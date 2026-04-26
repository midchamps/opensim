/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Content, GenerateContentConfig, GenerateContentResponse, PartListUnion } from '@google/genai';
import { type Config } from '../config/config.js';
import { GeminiChat } from './geminiChat.js';
import { Turn, type ChatCompressionInfo, type ServerGeminiStreamEvent } from './turn.js';
import { LoopDetectionService } from '../services/loopDetectionService.js';
export declare class GeminiClient {
    private readonly config;
    private chat?;
    private sessionTurnCount;
    private readonly loopDetector;
    private lastPromptId;
    private lastSentIdeContext;
    private forceFullIdeContext;
    /**
     * At any point in this conversation, was compression triggered without
     * being forced and did it fail?
     */
    private hasFailedCompressionAttempt;
    constructor(config: Config);
    initialize(): Promise<void>;
    private getContentGeneratorOrFail;
    addHistory(content: Content): Promise<void>;
    getChat(): GeminiChat;
    isInitialized(): boolean;
    getHistory(): Content[];
    stripThoughtsFromHistory(): void;
    setHistory(history: Content[]): void;
    setTools(): Promise<void>;
    resetChat(): Promise<void>;
    getLoopDetectionService(): LoopDetectionService;
    addDirectoryContext(): Promise<void>;
    startChat(extraHistory?: Content[]): Promise<GeminiChat>;
    private getIdeContextParts;
    sendMessageStream(request: PartListUnion, signal: AbortSignal, prompt_id: string, options?: {
        isContinuation: boolean;
    }, turns?: number): AsyncGenerator<ServerGeminiStreamEvent, Turn>;
    generateContent(contents: Content[], generationConfig: GenerateContentConfig, abortSignal: AbortSignal, model: string): Promise<GenerateContentResponse>;
    tryCompressChat(prompt_id: string, force?: boolean): Promise<ChatCompressionInfo>;
}
export declare const TEST_ONLY: {
    COMPRESSION_PRESERVE_THRESHOLD: number;
    COMPRESSION_TOKEN_THRESHOLD: number;
};
