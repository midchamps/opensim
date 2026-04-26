/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
import { SystemController } from './controllers/systemController.js';
import { PermissionController } from './controllers/permissionController.js';
import { SdkMcpController } from './controllers/sdkMcpController.js';
/**
 * Central coordinator for control plane communication.
 * Routes requests to controllers and manages request lifecycle.
 */
export class ControlDispatcher {
    context;
    // Make controllers publicly accessible
    systemController;
    permissionController;
    sdkMcpController;
    // readonly hookController: HookController;
    // Central pending request registries
    pendingIncomingRequests = new Map();
    pendingOutgoingRequests = new Map();
    constructor(context) {
        this.context = context;
        // Create domain controllers with context and registry
        this.systemController = new SystemController(context, this, 'SystemController');
        this.permissionController = new PermissionController(context, this, 'PermissionController');
        this.sdkMcpController = new SdkMcpController(context, this, 'SdkMcpController');
        // this.hookController = new HookController(context, this, 'HookController');
        // Listen for main abort signal
        this.context.abortSignal.addEventListener('abort', () => {
            this.shutdown();
        });
    }
    /**
     * Routes an incoming request to the appropriate controller and sends response
     */
    async dispatch(request) {
        const { request_id, request: payload } = request;
        try {
            // Route to appropriate controller
            const controller = this.getControllerForRequest(payload.subtype);
            const response = await controller.handleRequest(payload, request_id);
            // Send success response
            this.sendSuccessResponse(request_id, response);
        }
        catch (error) {
            // Send error response
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.sendErrorResponse(request_id, errorMessage);
        }
    }
    /**
     * Processes response from SDK for an outgoing request
     */
    handleControlResponse(response) {
        const responsePayload = response.response;
        const requestId = responsePayload.request_id;
        const pending = this.pendingOutgoingRequests.get(requestId);
        if (!pending) {
            // No pending request found - may have timed out or been cancelled
            if (this.context.debugMode) {
                console.error(`[ControlDispatcher] No pending outgoing request for: ${requestId}`);
            }
            return;
        }
        // Deregister
        this.deregisterOutgoingRequest(requestId);
        // Resolve or reject based on response type
        if (responsePayload.subtype === 'success') {
            pending.resolve(responsePayload);
        }
        else {
            const errorMessage = typeof responsePayload.error === 'string'
                ? responsePayload.error
                : (responsePayload.error?.message ?? 'Unknown error');
            pending.reject(new Error(errorMessage));
        }
    }
    /**
     * Sends a control request to SDK and waits for response
     */
    async sendControlRequest(payload, timeoutMs) {
        // Delegate to system controller (or any controller, they all have the same method)
        return this.systemController.sendControlRequest(payload, timeoutMs);
    }
    /**
     * Cancels a specific request or all pending requests
     */
    handleCancel(requestId) {
        if (requestId) {
            // Cancel specific incoming request
            const pending = this.pendingIncomingRequests.get(requestId);
            if (pending) {
                pending.abortController.abort();
                this.deregisterIncomingRequest(requestId);
                this.sendErrorResponse(requestId, 'Request cancelled');
                if (this.context.debugMode) {
                    console.error(`[ControlDispatcher] Cancelled incoming request: ${requestId}`);
                }
            }
        }
        else {
            // Cancel ALL pending incoming requests
            const requestIds = Array.from(this.pendingIncomingRequests.keys());
            for (const id of requestIds) {
                const pending = this.pendingIncomingRequests.get(id);
                if (pending) {
                    pending.abortController.abort();
                    this.deregisterIncomingRequest(id);
                    this.sendErrorResponse(id, 'All requests cancelled');
                }
            }
            if (this.context.debugMode) {
                console.error(`[ControlDispatcher] Cancelled all ${requestIds.length} pending incoming requests`);
            }
        }
    }
    /**
     * Stops all pending requests and cleans up all controllers
     */
    shutdown() {
        if (this.context.debugMode) {
            console.error('[ControlDispatcher] Shutting down');
        }
        // Cancel all incoming requests
        for (const [_requestId, pending,] of this.pendingIncomingRequests.entries()) {
            pending.abortController.abort();
            clearTimeout(pending.timeoutId);
        }
        this.pendingIncomingRequests.clear();
        // Cancel all outgoing requests
        for (const [_requestId, pending,] of this.pendingOutgoingRequests.entries()) {
            clearTimeout(pending.timeoutId);
            pending.reject(new Error('Dispatcher shutdown'));
        }
        this.pendingOutgoingRequests.clear();
        // Cleanup controllers
        this.systemController.cleanup();
        this.permissionController.cleanup();
        this.sdkMcpController.cleanup();
        // this.hookController.cleanup();
    }
    /**
     * Registers an incoming request in the pending registry
     */
    registerIncomingRequest(requestId, controller, abortController, timeoutId) {
        this.pendingIncomingRequests.set(requestId, {
            controller,
            abortController,
            timeoutId,
        });
    }
    /**
     * Removes an incoming request from the pending registry
     */
    deregisterIncomingRequest(requestId) {
        const pending = this.pendingIncomingRequests.get(requestId);
        if (pending) {
            clearTimeout(pending.timeoutId);
            this.pendingIncomingRequests.delete(requestId);
        }
    }
    /**
     * Registers an outgoing request in the pending registry
     */
    registerOutgoingRequest(requestId, controller, resolve, reject, timeoutId) {
        this.pendingOutgoingRequests.set(requestId, {
            controller,
            resolve,
            reject,
            timeoutId,
        });
    }
    /**
     * Removes an outgoing request from the pending registry
     */
    deregisterOutgoingRequest(requestId) {
        const pending = this.pendingOutgoingRequests.get(requestId);
        if (pending) {
            clearTimeout(pending.timeoutId);
            this.pendingOutgoingRequests.delete(requestId);
        }
    }
    /**
     * Get count of pending incoming requests (for debugging)
     */
    getPendingIncomingRequestCount() {
        return this.pendingIncomingRequests.size;
    }
    /**
     * Wait for all incoming request handlers to complete.
     *
     * Uses polling since we don't have direct Promise references to handlers.
     * The pendingIncomingRequests map is managed by BaseController:
     * - Registered when handler starts (in handleRequest)
     * - Deregistered when handler completes (success or error)
     *
     * @param pollIntervalMs - How often to check (default 50ms)
     * @param timeoutMs - Maximum wait time (default 30s)
     */
    async waitForPendingIncomingRequests(pollIntervalMs = 50, timeoutMs = 30000) {
        const startTime = Date.now();
        while (this.pendingIncomingRequests.size > 0) {
            if (Date.now() - startTime > timeoutMs) {
                if (this.context.debugMode) {
                    console.error(`[ControlDispatcher] Timeout waiting for ${this.pendingIncomingRequests.size} pending incoming requests`);
                }
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        }
        if (this.context.debugMode && this.pendingIncomingRequests.size === 0) {
            console.error('[ControlDispatcher] All incoming requests completed');
        }
    }
    /**
     * Returns the controller that handles the given request subtype
     */
    getControllerForRequest(subtype) {
        switch (subtype) {
            case 'initialize':
            case 'interrupt':
            case 'set_model':
            case 'supported_commands':
                return this.systemController;
            case 'can_use_tool':
            case 'set_permission_mode':
                return this.permissionController;
            case 'mcp_server_status':
                return this.sdkMcpController;
            // case 'hook_callback':
            //   return this.hookController;
            default:
                throw new Error(`Unknown control request subtype: ${subtype}`);
        }
    }
    /**
     * Sends a success response back to SDK
     */
    sendSuccessResponse(requestId, response) {
        const controlResponse = {
            type: 'control_response',
            response: {
                subtype: 'success',
                request_id: requestId,
                response,
            },
        };
        this.context.streamJson.send(controlResponse);
    }
    /**
     * Sends an error response back to SDK
     */
    sendErrorResponse(requestId, error) {
        const controlResponse = {
            type: 'control_response',
            response: {
                subtype: 'error',
                request_id: requestId,
                error,
            },
        };
        this.context.streamJson.send(controlResponse);
    }
}
//# sourceMappingURL=ControlDispatcher.js.map