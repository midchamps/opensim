/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
interface GeminiThoughtMessageContentProps {
    text: string;
    isPending: boolean;
    availableTerminalHeight?: number;
    terminalWidth: number;
}
/**
 * Continuation component for thought messages, similar to GeminiMessageContent.
 * Used when a thought response gets too long and needs to be split for performance.
 */
export declare const GeminiThoughtMessageContent: React.FC<GeminiThoughtMessageContentProps>;
export {};
