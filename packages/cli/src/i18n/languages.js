/**
 * @license
 * Copyright 2025 Qwen team
 * SPDX-License-Identifier: Apache-2.0
 */
export const SUPPORTED_LANGUAGES = [
    {
        code: 'en',
        id: 'en-US',
        fullName: 'English',
    },
    {
        code: 'zh',
        id: 'zh-CN',
        fullName: 'Chinese',
    },
    {
        code: 'ru',
        id: 'ru-RU',
        fullName: 'Russian',
    },
    {
        code: 'de',
        id: 'de-DE',
        fullName: 'German',
    },
];
/**
 * Maps a locale code to its English language name.
 * Used for LLM output language instructions.
 */
export function getLanguageNameFromLocale(locale) {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === locale);
    return lang?.fullName || 'English';
}
//# sourceMappingURL=languages.js.map