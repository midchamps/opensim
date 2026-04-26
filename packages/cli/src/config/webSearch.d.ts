/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import type { WebSearchProviderConfig } from '@opengame/opengame-core';
import type { Settings } from './settings.js';
/**
 * CLI arguments related to web search configuration
 */
export interface WebSearchCliArgs {
    tavilyApiKey?: string;
    googleApiKey?: string;
    googleSearchEngineId?: string;
    webSearchDefault?: string;
}
/**
 * Web search configuration structure
 */
export interface WebSearchConfig {
    provider: WebSearchProviderConfig[];
    default: string;
}
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
export declare function buildWebSearchConfig(argv: WebSearchCliArgs, settings: Settings, authType?: string): WebSearchConfig | undefined;
