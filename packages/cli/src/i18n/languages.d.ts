/**
 * @license
 * Copyright 2025 Qwen team
 * SPDX-License-Identifier: Apache-2.0
 */
export type SupportedLanguage = 'en' | 'zh' | 'ru' | 'de' | string;
export interface LanguageDefinition {
    /** The internal locale code used by the i18n system (e.g., 'en', 'zh'). */
    code: SupportedLanguage;
    /** The standard name used in UI settings (e.g., 'en-US', 'zh-CN'). */
    id: string;
    /** The full English name of the language (e.g., 'English', 'Chinese'). */
    fullName: string;
}
export declare const SUPPORTED_LANGUAGES: readonly LanguageDefinition[];
/**
 * Maps a locale code to its English language name.
 * Used for LLM output language instructions.
 */
export declare function getLanguageNameFromLocale(locale: SupportedLanguage): string;
