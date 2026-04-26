/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentParameters, ToolListUnion } from '@google/genai';
import { FinishReason, GenerateContentResponse } from '@google/genai';
import type Anthropic from '@anthropic-ai/sdk';
import { type SchemaComplianceMode } from '../../utils/schemaConverter.js';
type AnthropicMessageParam = Anthropic.MessageParam;
type AnthropicToolParam = Anthropic.Tool;
export declare class AnthropicContentConverter {
    private model;
    private schemaCompliance;
    constructor(model: string, schemaCompliance?: SchemaComplianceMode);
    convertGeminiRequestToAnthropic(request: GenerateContentParameters): {
        system?: string;
        messages: AnthropicMessageParam[];
    };
    convertGeminiToolsToAnthropic(geminiTools: ToolListUnion): Promise<AnthropicToolParam[]>;
    convertAnthropicResponseToGemini(response: Anthropic.Message): GenerateContentResponse;
    private processContents;
    private processContent;
    private parseParts;
    private extractTextFromContentUnion;
    private extractFunctionResponseContent;
    private safeInputToArgs;
    mapAnthropicFinishReasonToGemini(reason?: string | null): FinishReason | undefined;
    private isContentObject;
}
export {};
