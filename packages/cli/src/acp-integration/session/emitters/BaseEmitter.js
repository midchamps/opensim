/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Abstract base class for all session event emitters.
 * Provides common functionality and access to session context.
 */
export class BaseEmitter {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    /**
     * Sends a session update to the ACP client.
     */
    async sendUpdate(update) {
        return this.ctx.sendUpdate(update);
    }
    /**
     * Gets the session configuration.
     */
    get config() {
        return this.ctx.config;
    }
    /**
     * Gets the session ID.
     */
    get sessionId() {
        return this.ctx.sessionId;
    }
}
//# sourceMappingURL=BaseEmitter.js.map