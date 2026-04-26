/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Control Context implementation
 */
export class ControlContext {
    config;
    streamJson;
    sessionId;
    abortSignal;
    debugMode;
    permissionMode;
    sdkMcpServers;
    mcpClients;
    onInterrupt;
    constructor(options) {
        this.config = options.config;
        this.streamJson = options.streamJson;
        this.sessionId = options.sessionId;
        this.abortSignal = options.abortSignal;
        this.debugMode = options.config.getDebugMode();
        this.permissionMode = options.permissionMode || 'default';
        this.sdkMcpServers = new Set();
        this.mcpClients = new Map();
        this.onInterrupt = options.onInterrupt;
    }
}
//# sourceMappingURL=ControlContext.js.map