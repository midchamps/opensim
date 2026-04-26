/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { APPROVAL_MODE_INFO, APPROVAL_MODES, AuthType, clearCachedCredentialFile, QwenOAuth2Event, qwenOAuth2Events, MCPServerConfig, SessionService, tokenLimit, } from '@opengame/opengame-core';
import * as acp from './acp.js';
import { AcpFileSystemService } from './service/filesystem.js';
import { Readable, Writable } from 'node:stream';
import { SettingScope } from '../config/settings.js';
import { z } from 'zod';
import { ExtensionStorage } from '../config/extension.js';
import { loadCliConfig } from '../config/config.js';
import { ExtensionEnablementManager } from '../config/extensions/extensionEnablement.js';
// Import the modular Session class
import { Session } from './session/Session.js';
export async function runAcpAgent(config, settings, extensions, argv) {
    const stdout = Writable.toWeb(process.stdout);
    const stdin = Readable.toWeb(process.stdin);
    // Stdout is used to send messages to the client, so console.log/console.info
    // messages to stderr so that they don't interfere with ACP.
    console.log = console.error;
    console.info = console.error;
    console.debug = console.error;
    new acp.AgentSideConnection((client) => new GeminiAgent(config, settings, extensions, argv, client), stdout, stdin);
}
class GeminiAgent {
    config;
    settings;
    extensions;
    argv;
    client;
    sessions = new Map();
    clientCapabilities;
    constructor(config, settings, extensions, argv, client) {
        this.config = config;
        this.settings = settings;
        this.extensions = extensions;
        this.argv = argv;
        this.client = client;
    }
    async initialize(args) {
        this.clientCapabilities = args.clientCapabilities;
        const authMethods = [
            {
                id: AuthType.USE_OPENAI,
                name: 'Use OpenAI API key',
                description: 'Requires setting the `OPENAI_API_KEY` environment variable',
            },
            {
                id: AuthType.QWEN_OAUTH,
                name: 'Qwen OAuth',
                description: 'OAuth authentication for Qwen models with 2000 daily requests',
            },
        ];
        // Get current approval mode from config
        const currentApprovalMode = this.config.getApprovalMode();
        // Build available modes from shared APPROVAL_MODE_INFO
        const availableModes = APPROVAL_MODES.map((mode) => ({
            id: mode,
            name: APPROVAL_MODE_INFO[mode].name,
            description: APPROVAL_MODE_INFO[mode].description,
        }));
        const version = process.env['CLI_VERSION'] || process.version;
        return {
            protocolVersion: acp.PROTOCOL_VERSION,
            agentInfo: {
                name: 'qwen-code',
                title: 'OpenGame',
                version,
            },
            authMethods,
            modes: {
                currentModeId: currentApprovalMode,
                availableModes,
            },
            agentCapabilities: {
                loadSession: true,
                promptCapabilities: {
                    image: true,
                    audio: true,
                    embeddedContext: true,
                },
            },
        };
    }
    async authenticate({ methodId }) {
        const method = z.nativeEnum(AuthType).parse(methodId);
        let authUri;
        const authUriHandler = (deviceAuth) => {
            authUri = deviceAuth.verification_uri_complete;
            // Send the auth URL to ACP client as soon as it's available (refreshAuth is blocking).
            void this.client.authenticateUpdate({ _meta: { authUri } });
        };
        if (method === AuthType.QWEN_OAUTH) {
            qwenOAuth2Events.once(QwenOAuth2Event.AuthUri, authUriHandler);
        }
        await clearCachedCredentialFile();
        try {
            await this.config.refreshAuth(method);
            this.settings.setValue(SettingScope.User, 'security.auth.selectedType', method);
        }
        finally {
            // Ensure we don't leak listeners if auth fails early.
            if (method === AuthType.QWEN_OAUTH) {
                qwenOAuth2Events.off(QwenOAuth2Event.AuthUri, authUriHandler);
            }
        }
        return;
    }
    async newSession({ cwd, mcpServers, }) {
        const config = await this.newSessionConfig(cwd, mcpServers);
        await this.ensureAuthenticated(config);
        this.setupFileSystem(config);
        const session = await this.createAndStoreSession(config);
        const configuredModel = (config.getModel() ||
            this.config.getModel() ||
            '').trim();
        const modelId = configuredModel || 'default';
        const modelName = configuredModel || modelId;
        return {
            sessionId: session.getId(),
            models: {
                currentModelId: modelId,
                availableModels: [
                    {
                        modelId,
                        name: modelName,
                        description: null,
                        _meta: {
                            contextLimit: tokenLimit(modelId),
                        },
                    },
                ],
                _meta: null,
            },
        };
    }
    async newSessionConfig(cwd, mcpServers, sessionId) {
        const mergedMcpServers = { ...this.settings.merged.mcpServers };
        for (const { command, args, env: rawEnv, name } of mcpServers) {
            const env = {};
            for (const { name: envName, value } of rawEnv) {
                env[envName] = value;
            }
            mergedMcpServers[name] = new MCPServerConfig(command, args, env, cwd);
        }
        const settings = { ...this.settings.merged, mcpServers: mergedMcpServers };
        const argvForSession = {
            ...this.argv,
            resume: sessionId,
            continue: false,
        };
        const config = await loadCliConfig(settings, this.extensions, new ExtensionEnablementManager(ExtensionStorage.getUserExtensionsDir(), this.argv.extensions), argvForSession, cwd);
        await config.initialize();
        return config;
    }
    async cancel(params) {
        const session = this.sessions.get(params.sessionId);
        if (!session) {
            throw new Error(`Session not found: ${params.sessionId}`);
        }
        await session.cancelPendingPrompt();
    }
    async prompt(params) {
        const session = this.sessions.get(params.sessionId);
        if (!session) {
            throw new Error(`Session not found: ${params.sessionId}`);
        }
        return session.prompt(params);
    }
    async loadSession(params) {
        const sessionService = new SessionService(params.cwd);
        const exists = await sessionService.sessionExists(params.sessionId);
        if (!exists) {
            throw acp.RequestError.invalidParams(`Session not found for id: ${params.sessionId}`);
        }
        const config = await this.newSessionConfig(params.cwd, params.mcpServers, params.sessionId);
        await this.ensureAuthenticated(config);
        this.setupFileSystem(config);
        const sessionData = config.getResumedSessionData();
        if (!sessionData) {
            throw acp.RequestError.internalError(`Failed to load session data for id: ${params.sessionId}`);
        }
        await this.createAndStoreSession(config, sessionData.conversation);
        return null;
    }
    async listSessions(params) {
        const sessionService = new SessionService(params.cwd);
        const result = await sessionService.listSessions({
            cursor: params.cursor,
            size: params.size,
        });
        return {
            items: result.items.map((item) => ({
                sessionId: item.sessionId,
                cwd: item.cwd,
                startTime: item.startTime,
                mtime: item.mtime,
                prompt: item.prompt,
                gitBranch: item.gitBranch,
                filePath: item.filePath,
                messageCount: item.messageCount,
            })),
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        };
    }
    async setMode(params) {
        const session = this.sessions.get(params.sessionId);
        if (!session) {
            throw new Error(`Session not found: ${params.sessionId}`);
        }
        return session.setMode(params);
    }
    async ensureAuthenticated(config) {
        const selectedType = this.settings.merged.security?.auth?.selectedType;
        if (!selectedType) {
            throw acp.RequestError.authRequired('No Selected Type');
        }
        try {
            // Use true for the second argument to ensure only cached credentials are used
            await config.refreshAuth(selectedType, true);
        }
        catch (e) {
            console.error(`Authentication failed: ${e}`);
            throw acp.RequestError.authRequired('Authentication failed: ' + e.message);
        }
    }
    setupFileSystem(config) {
        if (!this.clientCapabilities?.fs) {
            return;
        }
        const acpFileSystemService = new AcpFileSystemService(this.client, config.getSessionId(), this.clientCapabilities.fs, config.getFileSystemService());
        config.setFileSystemService(acpFileSystemService);
    }
    async createAndStoreSession(config, conversation) {
        const sessionId = config.getSessionId();
        const geminiClient = config.getGeminiClient();
        // Use GeminiClient to manage chat lifecycle properly
        // This ensures geminiClient.chat is in sync with the session's chat
        //
        // Note: When loading a session, config.initialize() has already been called
        // in newSessionConfig(), which in turn calls geminiClient.initialize().
        // The GeminiClient.initialize() method checks config.getResumedSessionData()
        // and automatically loads the conversation history into the chat instance.
        // So we only need to initialize if it hasn't been done yet.
        if (!geminiClient.isInitialized()) {
            await geminiClient.initialize();
        }
        // Now get the chat instance that's managed by GeminiClient
        const chat = geminiClient.getChat();
        const session = new Session(sessionId, chat, config, this.client, this.settings);
        this.sessions.set(sessionId, session);
        setTimeout(async () => {
            await session.sendAvailableCommandsUpdate();
        }, 0);
        if (conversation && conversation.messages) {
            await session.replayHistory(conversation.messages);
        }
        return session;
    }
}
//# sourceMappingURL=acpAgent.js.map