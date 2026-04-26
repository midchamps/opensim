/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * MCP Client Transport for SDK MCP servers
 *
 * Implements the @modelcontextprotocol/sdk Transport interface to enable
 * CLI's MCP client to connect to SDK MCP servers via the control plane.
 */
export class SdkControlClientTransport {
    serverName;
    sendMcpMessage;
    debugMode;
    started = false;
    // Transport interface callbacks
    onmessage;
    onerror;
    onclose;
    constructor(options) {
        this.serverName = options.serverName;
        this.sendMcpMessage = options.sendMcpMessage;
        this.debugMode = options.debugMode ?? false;
    }
    /**
     * Start the transport
     * For SDK transport, this just marks it as ready - no subprocess to spawn
     */
    async start() {
        if (this.started) {
            return;
        }
        this.started = true;
        if (this.debugMode) {
            console.error(`[SdkControlClientTransport] Started for server '${this.serverName}'`);
        }
    }
    /**
     * Send a message to the SDK MCP server via control plane
     *
     * Routes the message through the control plane and delivers
     * the response via onmessage callback.
     */
    async send(message) {
        if (!this.started) {
            throw new Error(`SdkControlClientTransport (${this.serverName}) not started. Call start() first.`);
        }
        if (this.debugMode) {
            console.error(`[SdkControlClientTransport] Sending message to '${this.serverName}':`, JSON.stringify(message));
        }
        try {
            // Send message to SDK and wait for response
            const response = await this.sendMcpMessage(this.serverName, message);
            if (this.debugMode) {
                console.error(`[SdkControlClientTransport] Received response from '${this.serverName}':`, JSON.stringify(response));
            }
            // Deliver response via onmessage callback
            if (this.onmessage) {
                this.onmessage(response);
            }
        }
        catch (error) {
            if (this.debugMode) {
                console.error(`[SdkControlClientTransport] Error sending to '${this.serverName}':`, error);
            }
            if (this.onerror) {
                this.onerror(error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
    }
    /**
     * Close the transport
     */
    async close() {
        if (!this.started) {
            return;
        }
        this.started = false;
        if (this.debugMode) {
            console.error(`[SdkControlClientTransport] Closed for server '${this.serverName}'`);
        }
        if (this.onclose) {
            this.onclose();
        }
    }
    /**
     * Check if transport is started
     */
    isStarted() {
        return this.started;
    }
    /**
     * Get server name
     */
    getServerName() {
        return this.serverName;
    }
}
//# sourceMappingURL=sdk-control-client-transport.js.map