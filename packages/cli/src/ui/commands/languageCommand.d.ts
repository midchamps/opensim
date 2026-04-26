/**
 * @license
 * Copyright 2025 Qwen team
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SlashCommand } from './types.js';
/**
 * Initializes the LLM output language rule file on first startup.
 * If the file already exists, it is not overwritten (respects user preference).
 */
export declare function initializeLlmOutputLanguage(): void;
export declare const languageCommand: SlashCommand;
