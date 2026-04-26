/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { FinishReason, GenerateContentResponse } from '@google/genai';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { convertSchema, } from '../../utils/schemaConverter.js';
export class AnthropicContentConverter {
    model;
    schemaCompliance;
    constructor(model, schemaCompliance = 'auto') {
        this.model = model;
        this.schemaCompliance = schemaCompliance;
    }
    convertGeminiRequestToAnthropic(request) {
        const messages = [];
        const system = this.extractTextFromContentUnion(request.config?.systemInstruction);
        this.processContents(request.contents, messages);
        return {
            system: system || undefined,
            messages,
        };
    }
    async convertGeminiToolsToAnthropic(geminiTools) {
        const tools = [];
        for (const tool of geminiTools) {
            let actualTool;
            if ('tool' in tool) {
                actualTool = await tool.tool();
            }
            else {
                actualTool = tool;
            }
            if (!actualTool.functionDeclarations) {
                continue;
            }
            for (const func of actualTool.functionDeclarations) {
                if (!func.name)
                    continue;
                let inputSchema;
                if (func.parametersJsonSchema) {
                    inputSchema = {
                        ...func.parametersJsonSchema,
                    };
                }
                else if (func.parameters) {
                    inputSchema = func.parameters;
                }
                if (!inputSchema) {
                    inputSchema = { type: 'object', properties: {} };
                }
                inputSchema = convertSchema(inputSchema, this.schemaCompliance);
                if (typeof inputSchema['type'] !== 'string') {
                    inputSchema['type'] = 'object';
                }
                tools.push({
                    name: func.name,
                    description: func.description,
                    input_schema: inputSchema,
                });
            }
        }
        return tools;
    }
    convertAnthropicResponseToGemini(response) {
        const geminiResponse = new GenerateContentResponse();
        const parts = [];
        for (const block of response.content || []) {
            const blockType = String(block['type'] || '');
            if (blockType === 'text') {
                const text = typeof block.text === 'string'
                    ? block.text
                    : '';
                if (text) {
                    parts.push({ text });
                }
            }
            else if (blockType === 'tool_use') {
                const toolUse = block;
                parts.push({
                    functionCall: {
                        id: typeof toolUse.id === 'string' ? toolUse.id : undefined,
                        name: typeof toolUse.name === 'string' ? toolUse.name : undefined,
                        args: this.safeInputToArgs(toolUse.input),
                    },
                });
            }
            else if (blockType === 'thinking') {
                const thinking = typeof block.thinking === 'string'
                    ? block.thinking
                    : '';
                const signature = typeof block.signature === 'string'
                    ? block.signature
                    : '';
                if (thinking || signature) {
                    const thoughtPart = {
                        text: thinking,
                        thought: true,
                        thoughtSignature: signature,
                    };
                    parts.push(thoughtPart);
                }
            }
            else if (blockType === 'redacted_thinking') {
                parts.push({ text: '', thought: true });
            }
        }
        const candidate = {
            content: {
                parts,
                role: 'model',
            },
            index: 0,
            safetyRatings: [],
        };
        const finishReason = this.mapAnthropicFinishReasonToGemini(response.stop_reason);
        if (finishReason) {
            candidate.finishReason = finishReason;
        }
        geminiResponse.candidates = [candidate];
        geminiResponse.responseId = response.id;
        geminiResponse.createTime = Date.now().toString();
        geminiResponse.modelVersion = response.model || this.model;
        geminiResponse.promptFeedback = { safetyRatings: [] };
        if (response.usage) {
            const promptTokens = response.usage.input_tokens || 0;
            const completionTokens = response.usage.output_tokens || 0;
            geminiResponse.usageMetadata = {
                promptTokenCount: promptTokens,
                candidatesTokenCount: completionTokens,
                totalTokenCount: promptTokens + completionTokens,
            };
        }
        return geminiResponse;
    }
    processContents(contents, messages) {
        if (Array.isArray(contents)) {
            for (const content of contents) {
                this.processContent(content, messages);
            }
        }
        else if (contents) {
            this.processContent(contents, messages);
        }
    }
    processContent(content, messages) {
        if (typeof content === 'string') {
            messages.push({
                role: 'user',
                content: [{ type: 'text', text: content }],
            });
            return;
        }
        if (!this.isContentObject(content))
            return;
        const parsed = this.parseParts(content.parts || []);
        if (parsed.functionResponses.length > 0) {
            for (const response of parsed.functionResponses) {
                messages.push({
                    role: 'user',
                    content: [
                        {
                            type: 'tool_result',
                            tool_use_id: response.id || '',
                            content: this.extractFunctionResponseContent(response.response),
                        },
                    ],
                });
            }
            return;
        }
        if (content.role === 'model' && parsed.functionCalls.length > 0) {
            const thinkingBlocks = parsed.thoughtParts.map((part) => {
                const thinkingBlock = {
                    type: 'thinking',
                    thinking: part.text,
                };
                if (part.signature) {
                    thinkingBlock.signature =
                        part.signature;
                }
                return thinkingBlock;
            });
            const toolUses = parsed.functionCalls.map((call, index) => ({
                type: 'tool_use',
                id: call.id || `tool_${index}`,
                name: call.name || '',
                input: call.args || {},
            }));
            const textBlocks = parsed.contentParts.map((text) => ({
                type: 'text',
                text,
            }));
            messages.push({
                role: 'assistant',
                content: [...thinkingBlocks, ...textBlocks, ...toolUses],
            });
            return;
        }
        const role = content.role === 'model' ? 'assistant' : 'user';
        const thinkingBlocks = role === 'assistant'
            ? parsed.thoughtParts.map((part) => {
                const thinkingBlock = {
                    type: 'thinking',
                    thinking: part.text,
                };
                if (part.signature) {
                    thinkingBlock.signature =
                        part.signature;
                }
                return thinkingBlock;
            })
            : [];
        const textBlocks = [
            ...thinkingBlocks,
            ...parsed.contentParts.map((text) => ({
                type: 'text',
                text,
            })),
        ];
        if (textBlocks.length > 0) {
            messages.push({ role, content: textBlocks });
        }
    }
    parseParts(parts) {
        const thoughtParts = [];
        const contentParts = [];
        const functionCalls = [];
        const functionResponses = [];
        for (const part of parts) {
            if (typeof part === 'string') {
                contentParts.push(part);
            }
            else if ('text' in part &&
                part.text &&
                !('thought' in part && part.thought)) {
                contentParts.push(part.text);
            }
            else if ('text' in part && 'thought' in part && part.thought) {
                thoughtParts.push({
                    text: part.text || '',
                    signature: 'thoughtSignature' in part &&
                        typeof part.thoughtSignature === 'string'
                        ? part.thoughtSignature
                        : undefined,
                });
            }
            else if ('functionCall' in part && part.functionCall) {
                functionCalls.push(part.functionCall);
            }
            else if ('functionResponse' in part && part.functionResponse) {
                functionResponses.push(part.functionResponse);
            }
        }
        return {
            thoughtParts,
            contentParts,
            functionCalls,
            functionResponses,
        };
    }
    extractTextFromContentUnion(contentUnion) {
        if (typeof contentUnion === 'string') {
            return contentUnion;
        }
        if (Array.isArray(contentUnion)) {
            return contentUnion
                .map((item) => this.extractTextFromContentUnion(item))
                .filter(Boolean)
                .join('\n');
        }
        if (typeof contentUnion === 'object' && contentUnion !== null) {
            if ('parts' in contentUnion) {
                const content = contentUnion;
                return (content.parts
                    ?.map((part) => {
                    if (typeof part === 'string')
                        return part;
                    if ('text' in part)
                        return part.text || '';
                    return '';
                })
                    .filter(Boolean)
                    .join('\n') || '');
            }
        }
        return '';
    }
    extractFunctionResponseContent(response) {
        if (response === null || response === undefined) {
            return '';
        }
        if (typeof response === 'string') {
            return response;
        }
        if (typeof response === 'object') {
            const responseObject = response;
            const output = responseObject['output'];
            if (typeof output === 'string') {
                return output;
            }
            const error = responseObject['error'];
            if (typeof error === 'string') {
                return error;
            }
        }
        try {
            const serialized = JSON.stringify(response);
            return serialized ?? String(response);
        }
        catch {
            return String(response);
        }
    }
    safeInputToArgs(input) {
        if (input && typeof input === 'object') {
            return input;
        }
        if (typeof input === 'string') {
            return safeJsonParse(input, {});
        }
        return {};
    }
    mapAnthropicFinishReasonToGemini(reason) {
        if (!reason)
            return undefined;
        const mapping = {
            end_turn: FinishReason.STOP,
            stop_sequence: FinishReason.STOP,
            tool_use: FinishReason.STOP,
            max_tokens: FinishReason.MAX_TOKENS,
            content_filter: FinishReason.SAFETY,
        };
        return mapping[reason] || FinishReason.FINISH_REASON_UNSPECIFIED;
    }
    isContentObject(content) {
        return (typeof content === 'object' &&
            content !== null &&
            'role' in content &&
            'parts' in content &&
            Array.isArray(content['parts']));
    }
}
//# sourceMappingURL=converter.js.map