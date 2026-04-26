/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { DefaultOpenAICompatibleProvider } from './default.js';
export class DeepSeekOpenAICompatibleProvider extends DefaultOpenAICompatibleProvider {
    constructor(contentGeneratorConfig, cliConfig) {
        super(contentGeneratorConfig, cliConfig);
    }
    static isDeepSeekProvider(contentGeneratorConfig) {
        const baseUrl = contentGeneratorConfig.baseUrl ?? '';
        return baseUrl.toLowerCase().includes('api.deepseek.com');
    }
    buildRequest(request, userPromptId) {
        const baseRequest = super.buildRequest(request, userPromptId);
        if (!baseRequest.messages?.length) {
            return baseRequest;
        }
        const messages = baseRequest.messages.map((message) => {
            if (!('content' in message)) {
                return message;
            }
            const { content } = message;
            if (typeof content === 'string' ||
                content === null ||
                content === undefined) {
                return message;
            }
            if (!Array.isArray(content)) {
                return message;
            }
            const text = content
                .map((part) => {
                if (part.type !== 'text') {
                    throw new Error(`DeepSeek provider only supports text content. Found non-text part of type '${part.type}' in message with role '${message.role}'.`);
                }
                return part.text ?? '';
            })
                .join('');
            return {
                ...message,
                content: text,
            };
        });
        return {
            ...baseRequest,
            messages,
        };
    }
    getDefaultGenerationConfig() {
        return {
            temperature: 0,
        };
    }
}
//# sourceMappingURL=deepseek.js.map