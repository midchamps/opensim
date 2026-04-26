/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
interface GeminiThoughtMessageProps {
    text: string;
    isPending: boolean;
    availableTerminalHeight?: number;
    terminalWidth: number;
}
/**
 * Displays model thinking/reasoning text with a softer, dimmed style
 * to visually distinguish it from regular content output.
 */
export declare const GeminiThoughtMessage: React.FC<GeminiThoughtMessageProps>;
export {};
