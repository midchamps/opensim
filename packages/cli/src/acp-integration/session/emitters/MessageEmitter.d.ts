/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import type { GenerateContentResponseUsageMetadata } from '@google/genai';
import { BaseEmitter } from './BaseEmitter.js';
/**
 * Handles emission of text message chunks (user, agent, thought).
 *
 * This emitter is responsible for sending message content to the ACP client
 * in a consistent format, regardless of whether the message comes from
 * normal flow, history replay, or other sources.
 */
export declare class MessageEmitter extends BaseEmitter {
    /**
     * Emits a user message chunk.
     */
    emitUserMessage(text: string): Promise<void>;
    /**
     * Emits an agent thought chunk.
     */
    emitAgentThought(text: string): Promise<void>;
    /**
     * Emits an agent message chunk.
     */
    emitAgentMessage(text: string): Promise<void>;
    /**
     * Emits usage metadata.
     */
    emitUsageMetadata(usageMetadata: GenerateContentResponseUsageMetadata, text?: string, durationMs?: number): Promise<void>;
    /**
     * Emits a message chunk based on role and thought flag.
     * This is the unified method that handles all message types.
     *
     * @param text - The message text content
     * @param role - Whether this is a user or assistant message
     * @param isThought - Whether this is an assistant thought (only applies to assistant role)
     */
    emitMessage(text: string, role: 'user' | 'assistant', isThought?: boolean): Promise<void>;
}
