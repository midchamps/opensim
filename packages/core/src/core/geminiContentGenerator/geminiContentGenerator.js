/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from '@google/genai';
/**
 * A wrapper for GoogleGenAI that implements the ContentGenerator interface.
 */
export class GeminiContentGenerator {
    googleGenAI;
    contentGeneratorConfig;
    constructor(options, contentGeneratorConfig) {
        this.googleGenAI = new GoogleGenAI(options);
        this.contentGeneratorConfig = contentGeneratorConfig;
    }
    buildGenerateContentConfig(request) {
        const configSamplingParams = this.contentGeneratorConfig?.samplingParams;
        const requestConfig = request.config || {};
        // Helper function to get parameter value with priority: config > request > default
        const getParameterValue = (configValue, requestKey, defaultValue) => {
            const requestValue = requestConfig[requestKey];
            if (configValue !== undefined)
                return configValue;
            if (requestValue !== undefined)
                return requestValue;
            return defaultValue;
        };
        return {
            ...requestConfig,
            temperature: getParameterValue(configSamplingParams?.temperature, 'temperature', 1),
            topP: getParameterValue(configSamplingParams?.top_p, 'topP', 0.95),
            topK: getParameterValue(configSamplingParams?.top_k, 'topK', 64),
            maxOutputTokens: getParameterValue(configSamplingParams?.max_tokens, 'maxOutputTokens'),
            presencePenalty: getParameterValue(configSamplingParams?.presence_penalty, 'presencePenalty'),
            frequencyPenalty: getParameterValue(configSamplingParams?.frequency_penalty, 'frequencyPenalty'),
            thinkingConfig: getParameterValue(this.buildThinkingConfig(), 'thinkingConfig', {
                includeThoughts: true,
                thinkingLevel: 'THINKING_LEVEL_UNSPECIFIED',
            }),
        };
    }
    buildThinkingConfig() {
        const reasoning = this.contentGeneratorConfig?.reasoning;
        if (reasoning === false) {
            return { includeThoughts: false };
        }
        if (reasoning) {
            const thinkingLevel = (reasoning.effort === 'low'
                ? 'LOW'
                : reasoning.effort === 'high'
                    ? 'HIGH'
                    : 'THINKING_LEVEL_UNSPECIFIED');
            return {
                includeThoughts: true,
                thinkingLevel,
            };
        }
        return undefined;
    }
    async generateContent(request, _userPromptId) {
        const finalRequest = {
            ...request,
            config: this.buildGenerateContentConfig(request),
        };
        return this.googleGenAI.models.generateContent(finalRequest);
    }
    async generateContentStream(request, _userPromptId) {
        const finalRequest = {
            ...request,
            config: this.buildGenerateContentConfig(request),
        };
        return this.googleGenAI.models.generateContentStream(finalRequest);
    }
    async countTokens(request) {
        return this.googleGenAI.models.countTokens(request);
    }
    async embedContent(request) {
        return this.googleGenAI.models.embedContent(request);
    }
    useSummarizedThinking() {
        return true;
    }
}
//# sourceMappingURL=geminiContentGenerator.js.map