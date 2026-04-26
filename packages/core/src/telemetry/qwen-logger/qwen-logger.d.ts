/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { HttpsProxyAgent } from 'https-proxy-agent';
import type { StartSessionEvent, UserPromptEvent, ToolCallEvent, ApiRequestEvent, ApiResponseEvent, ApiErrorEvent, ApiCancelEvent, FileOperationEvent, FlashFallbackEvent, LoopDetectedEvent, NextSpeakerCheckEvent, SlashCommandEvent, MalformedJsonResponseEvent, IdeConnectionEvent, KittySequenceOverflowEvent, ChatCompressionEvent, InvalidChunkEvent, ContentRetryEvent, ContentRetryFailureEvent, ConversationFinishedEvent, SubagentExecutionEvent, ExtensionInstallEvent, ExtensionUninstallEvent, ToolOutputTruncatedEvent, ExtensionEnableEvent, ModelSlashCommandEvent, ExtensionDisableEvent, AuthEvent, SkillLaunchEvent, RipgrepFallbackEvent, EndSessionEvent } from '../types.js';
import type { RumEvent, RumViewEvent, RumActionEvent, RumResourceEvent, RumExceptionEvent, RumPayload } from './event-types.js';
import type { Config } from '../../config/config.js';
export interface LogResponse {
    nextRequestWaitMs?: number;
}
export declare class QwenLogger {
    private static instance;
    private config?;
    private readonly installationManager;
    /**
     * Queue of pending events that need to be flushed to the server. New events
     * are added to this queue and then flushed on demand (via `flushToRum`)
     */
    private readonly events;
    /**
     * The last time that the events were successfully flushed to the server.
     */
    private lastFlushTime;
    private userId;
    private sessionId;
    /**
     * The value is true when there is a pending flush happening. This prevents
     * concurrent flush operations.
     */
    private isFlushInProgress;
    /**
     * This value is true when a flush was requested during an ongoing flush.
     */
    private pendingFlush;
    private constructor();
    private generateUserId;
    static getInstance(config?: Config): QwenLogger | undefined;
    enqueueLogEvent(event: RumEvent): void;
    createRumEvent(eventType: 'view' | 'action' | 'exception' | 'resource', type: string, name: string, properties: Partial<RumEvent>): RumEvent;
    createViewEvent(type: string, name: string, properties: Partial<RumViewEvent>): RumEvent;
    createActionEvent(type: string, name: string, properties: Partial<RumActionEvent>): RumEvent;
    createResourceEvent(type: string, name: string, properties: Partial<RumResourceEvent>): RumEvent;
    createExceptionEvent(type: string, name: string, properties: Partial<RumExceptionEvent>): RumEvent;
    private getOsMetadata;
    createRumPayload(): Promise<RumPayload>;
    flushIfNeeded(): void;
    flushToRum(): Promise<LogResponse>;
    logStartSessionEvent(event: StartSessionEvent): Promise<void>;
    logEndSessionEvent(_event: EndSessionEvent): void;
    logConversationFinishedEvent(event: ConversationFinishedEvent): void;
    logNewPromptEvent(event: UserPromptEvent): void;
    logSlashCommandEvent(event: SlashCommandEvent): void;
    logModelSlashCommandEvent(event: ModelSlashCommandEvent): void;
    logToolCallEvent(event: ToolCallEvent): void;
    logFileOperationEvent(event: FileOperationEvent): void;
    logSubagentExecutionEvent(event: SubagentExecutionEvent): void;
    logToolOutputTruncatedEvent(event: ToolOutputTruncatedEvent): void;
    logApiRequestEvent(event: ApiRequestEvent): void;
    logApiResponseEvent(event: ApiResponseEvent): void;
    logApiCancelEvent(event: ApiCancelEvent): void;
    logApiErrorEvent(event: ApiErrorEvent): void;
    logInvalidChunkEvent(event: InvalidChunkEvent): void;
    logContentRetryFailureEvent(event: ContentRetryFailureEvent): void;
    logMalformedJsonResponseEvent(event: MalformedJsonResponseEvent): void;
    logLoopDetectedEvent(event: LoopDetectedEvent): void;
    logKittySequenceOverflowEvent(event: KittySequenceOverflowEvent): void;
    logIdeConnectionEvent(event: IdeConnectionEvent): void;
    logExtensionInstallEvent(event: ExtensionInstallEvent): void;
    logExtensionUninstallEvent(event: ExtensionUninstallEvent): void;
    logExtensionEnableEvent(event: ExtensionEnableEvent): void;
    logExtensionDisableEvent(event: ExtensionDisableEvent): void;
    logAuthEvent(event: AuthEvent): void;
    logFlashFallbackEvent(event: FlashFallbackEvent): void;
    logRipgrepFallbackEvent(event: RipgrepFallbackEvent): void;
    logLoopDetectionDisabledEvent(): void;
    logNextSpeakerCheck(event: NextSpeakerCheckEvent): void;
    logSkillLaunchEvent(event: SkillLaunchEvent): void;
    logChatCompressionEvent(event: ChatCompressionEvent): void;
    logContentRetryEvent(event: ContentRetryEvent): void;
    getProxyAgent(): HttpsProxyAgent<string> | undefined;
    private requeueFailedEvents;
}
export declare const TEST_ONLY: {
    MAX_RETRY_EVENTS: number;
    MAX_EVENTS: number;
    FLUSH_INTERVAL_MS: number;
};
