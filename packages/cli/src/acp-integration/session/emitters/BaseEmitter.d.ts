/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SessionContext } from '../types.js';
import type * as acp from '../../acp.js';
/**
 * Abstract base class for all session event emitters.
 * Provides common functionality and access to session context.
 */
export declare abstract class BaseEmitter {
    protected readonly ctx: SessionContext;
    constructor(ctx: SessionContext);
    /**
     * Sends a session update to the ACP client.
     */
    protected sendUpdate(update: acp.SessionUpdate): Promise<void>;
    /**
     * Gets the session configuration.
     */
    protected get config(): import("@opengame/opengame-core").Config;
    /**
     * Gets the session ID.
     */
    protected get sessionId(): string;
}
