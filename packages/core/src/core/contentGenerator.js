/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { DEFAULT_QWEN_MODEL } from '../config/models.js';
import { LoggingContentGenerator } from './loggingContentGenerator/index.js';
export var AuthType;
(function (AuthType) {
    AuthType["USE_OPENAI"] = "openai";
    AuthType["QWEN_OAUTH"] = "qwen-oauth";
    AuthType["USE_GEMINI"] = "gemini";
    AuthType["USE_VERTEX_AI"] = "vertex-ai";
    AuthType["USE_ANTHROPIC"] = "anthropic";
})(AuthType || (AuthType = {}));
export function createContentGeneratorConfig(config, authType, generationConfig) {
    let newContentGeneratorConfig = {
        ...(generationConfig || {}),
        authType,
        proxy: config?.getProxy(),
    };
    if (authType === AuthType.QWEN_OAUTH) {
        // For Qwen OAuth, we'll handle the API key dynamically in createContentGenerator
        // Set a special marker to indicate this is Qwen OAuth
        return {
            ...newContentGeneratorConfig,
            model: DEFAULT_QWEN_MODEL,
            apiKey: 'QWEN_OAUTH_DYNAMIC_TOKEN',
        };
    }
    if (authType === AuthType.USE_OPENAI) {
        newContentGeneratorConfig = {
            ...newContentGeneratorConfig,
            apiKey: newContentGeneratorConfig.apiKey || process.env['OPENAI_API_KEY'],
            baseUrl: newContentGeneratorConfig.baseUrl || process.env['OPENAI_BASE_URL'],
            model: newContentGeneratorConfig.model || process.env['OPENAI_MODEL'],
        };
        if (!newContentGeneratorConfig.apiKey) {
            throw new Error('OPENAI_API_KEY environment variable not found.');
        }
        return {
            ...newContentGeneratorConfig,
            model: newContentGeneratorConfig?.model || 'qwen3-coder-plus',
        };
    }
    if (authType === AuthType.USE_ANTHROPIC) {
        newContentGeneratorConfig = {
            ...newContentGeneratorConfig,
            apiKey: newContentGeneratorConfig.apiKey || process.env['ANTHROPIC_API_KEY'],
            baseUrl: newContentGeneratorConfig.baseUrl || process.env['ANTHROPIC_BASE_URL'],
            model: newContentGeneratorConfig.model || process.env['ANTHROPIC_MODEL'],
        };
        if (!newContentGeneratorConfig.apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not found.');
        }
        if (!newContentGeneratorConfig.baseUrl) {
            throw new Error('ANTHROPIC_BASE_URL environment variable not found.');
        }
        if (!newContentGeneratorConfig.model) {
            throw new Error('ANTHROPIC_MODEL environment variable not found.');
        }
    }
    if (authType === AuthType.USE_GEMINI) {
        newContentGeneratorConfig = {
            ...newContentGeneratorConfig,
            apiKey: newContentGeneratorConfig.apiKey || process.env['GEMINI_API_KEY'],
            model: newContentGeneratorConfig.model || process.env['GEMINI_MODEL'],
        };
        if (!newContentGeneratorConfig.apiKey) {
            throw new Error('GEMINI_API_KEY environment variable not found.');
        }
        if (!newContentGeneratorConfig.model) {
            throw new Error('GEMINI_MODEL environment variable not found.');
        }
    }
    if (authType === AuthType.USE_VERTEX_AI) {
        newContentGeneratorConfig = {
            ...newContentGeneratorConfig,
            apiKey: newContentGeneratorConfig.apiKey || process.env['GOOGLE_API_KEY'],
            model: newContentGeneratorConfig.model || process.env['GOOGLE_MODEL'],
        };
        if (!newContentGeneratorConfig.apiKey) {
            throw new Error('GOOGLE_API_KEY environment variable not found.');
        }
        if (!newContentGeneratorConfig.model) {
            throw new Error('GOOGLE_MODEL environment variable not found.');
        }
    }
    return newContentGeneratorConfig;
}
export async function createContentGenerator(config, gcConfig, isInitialAuth) {
    if (config.authType === AuthType.USE_OPENAI) {
        if (!config.apiKey) {
            throw new Error('OPENAI_API_KEY environment variable not found.');
        }
        // Import OpenAIContentGenerator dynamically to avoid circular dependencies
        const { createOpenAIContentGenerator } = await import('./openaiContentGenerator/index.js');
        // Always use OpenAIContentGenerator, logging is controlled by enableOpenAILogging flag
        const generator = createOpenAIContentGenerator(config, gcConfig);
        return new LoggingContentGenerator(generator, gcConfig);
    }
    if (config.authType === AuthType.QWEN_OAUTH) {
        // Import required classes dynamically
        const { getQwenOAuthClient: getQwenOauthClient } = await import('../qwen/qwenOAuth2.js');
        const { QwenContentGenerator } = await import('../qwen/qwenContentGenerator.js');
        try {
            // Get the Qwen OAuth client (now includes integrated token management)
            // If this is initial auth, require cached credentials to detect missing credentials
            const qwenClient = await getQwenOauthClient(gcConfig, isInitialAuth ? { requireCachedCredentials: true } : undefined);
            // Create the content generator with dynamic token management
            const generator = new QwenContentGenerator(qwenClient, config, gcConfig);
            return new LoggingContentGenerator(generator, gcConfig);
        }
        catch (error) {
            throw new Error(`${error instanceof Error ? error.message : String(error)}`);
        }
    }
    if (config.authType === AuthType.USE_ANTHROPIC) {
        if (!config.apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not found.');
        }
        const { createAnthropicContentGenerator } = await import('./anthropicContentGenerator/index.js');
        const generator = createAnthropicContentGenerator(config, gcConfig);
        return new LoggingContentGenerator(generator, gcConfig);
    }
    if (config.authType === AuthType.USE_GEMINI ||
        config.authType === AuthType.USE_VERTEX_AI) {
        const { createGeminiContentGenerator } = await import('./geminiContentGenerator/index.js');
        const generator = createGeminiContentGenerator(config, gcConfig);
        return new LoggingContentGenerator(generator, gcConfig);
    }
    throw new Error(`Error creating contentGenerator: Unsupported authType: ${config.authType}`);
}
//# sourceMappingURL=contentGenerator.js.map