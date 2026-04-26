/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { AuthType } from '@opengame/opengame-core';
/**
 * Build webSearch configuration from multiple sources with priority:
 * 1. settings.json (new format) - highest priority
 * 2. Command line args + environment variables
 * 3. Legacy tavilyApiKey (backward compatibility)
 *
 * @param argv - Command line arguments
 * @param settings - User settings from settings.json
 * @param authType - Authentication type (e.g., 'qwen-oauth')
 * @returns WebSearch configuration or undefined if no providers available
 */
export function buildWebSearchConfig(argv, settings, authType) {
    const isQwenOAuth = authType === AuthType.QWEN_OAUTH;
    // Step 1: Collect providers from settings or command line/env
    let providers = [];
    let userDefault;
    if (settings.webSearch) {
        // Use providers from settings.json
        providers = [...settings.webSearch.provider];
        userDefault = settings.webSearch.default;
    }
    else {
        // Build providers from command line args and environment variables
        const tavilyKey = argv.tavilyApiKey ||
            settings.advanced?.tavilyApiKey ||
            process.env['TAVILY_API_KEY'];
        if (tavilyKey) {
            providers.push({
                type: 'tavily',
                apiKey: tavilyKey,
            });
        }
        const googleKey = argv.googleApiKey || process.env['GOOGLE_API_KEY'];
        const googleEngineId = argv.googleSearchEngineId || process.env['GOOGLE_SEARCH_ENGINE_ID'];
        if (googleKey && googleEngineId) {
            providers.push({
                type: 'google',
                apiKey: googleKey,
                searchEngineId: googleEngineId,
            });
        }
    }
    // Step 2: Ensure dashscope is available for qwen-oauth users
    if (isQwenOAuth) {
        const hasDashscope = providers.some((p) => p.type === 'dashscope');
        if (!hasDashscope) {
            providers.push({ type: 'dashscope' });
        }
    }
    // Step 3: If no providers available, return undefined
    if (providers.length === 0) {
        return undefined;
    }
    // Step 4: Determine default provider
    // Priority: user explicit config > CLI arg > first available provider (tavily > google > dashscope)
    const providerPriority = [
        'tavily',
        'google',
        'dashscope',
    ];
    // Determine default provider based on availability
    let defaultProvider = userDefault || argv.webSearchDefault;
    if (!defaultProvider) {
        // Find first available provider by priority order
        for (const providerType of providerPriority) {
            if (providers.some((p) => p.type === providerType)) {
                defaultProvider = providerType;
                break;
            }
        }
        // Fallback to first available provider if none found in priority list
        if (!defaultProvider) {
            defaultProvider = providers[0]?.type || 'dashscope';
        }
    }
    return {
        provider: providers,
        default: defaultProvider,
    };
}
//# sourceMappingURL=webSearch.js.map