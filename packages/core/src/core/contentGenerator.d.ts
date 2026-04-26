/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CountTokensParameters, CountTokensResponse, EmbedContentParameters, EmbedContentResponse, GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import type { Config } from '../config/config.js';
/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
    generateContent(request: GenerateContentParameters, userPromptId: string): Promise<GenerateContentResponse>;
    generateContentStream(request: GenerateContentParameters, userPromptId: string): Promise<AsyncGenerator<GenerateContentResponse>>;
    countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;
    embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
    useSummarizedThinking(): boolean;
}
export declare enum AuthType {
    USE_OPENAI = "openai",
    QWEN_OAUTH = "qwen-oauth",
    USE_GEMINI = "gemini",
    USE_VERTEX_AI = "vertex-ai",
    USE_ANTHROPIC = "anthropic"
}
export type ContentGeneratorConfig = {
    model: string;
    apiKey?: string;
    baseUrl?: string;
    vertexai?: boolean;
    authType?: AuthType | undefined;
    enableOpenAILogging?: boolean;
    openAILoggingDir?: string;
    timeout?: number;
    maxRetries?: number;
    disableCacheControl?: boolean;
    samplingParams?: {
        top_p?: number;
        top_k?: number;
        repetition_penalty?: number;
        presence_penalty?: number;
        frequency_penalty?: number;
        temperature?: number;
        max_tokens?: number;
    };
    reasoning?: false | {
        effort?: 'low' | 'medium' | 'high';
        budget_tokens?: number;
    };
    proxy?: string | undefined;
    userAgent?: string;
    schemaCompliance?: 'auto' | 'openapi_30';
};
export declare function createContentGeneratorConfig(config: Config, authType: AuthType | undefined, generationConfig?: Partial<ContentGeneratorConfig>): ContentGeneratorConfig;
export declare function createContentGenerator(config: ContentGeneratorConfig, gcConfig: Config, isInitialAuth?: boolean): Promise<ContentGenerator>;
