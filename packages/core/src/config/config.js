/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'node:path';
import process from 'node:process';
// External dependencies
import { ProxyAgent, setGlobalDispatcher } from 'undici';
// Core
import { BaseLlmClient } from '../core/baseLlmClient.js';
import { GeminiClient } from '../core/client.js';
import { createContentGenerator, createContentGeneratorConfig, } from '../core/contentGenerator.js';
import { tokenLimit } from '../core/tokenLimits.js';
// Services
import { FileDiscoveryService } from '../services/fileDiscoveryService.js';
import { StandardFileSystemService, } from '../services/fileSystemService.js';
import { GitService } from '../services/gitService.js';
// Tools
import { EditTool } from '../tools/edit.js';
import { ExitPlanModeTool } from '../tools/exitPlanMode.js';
import { GenerateAssetsTool } from '../tools/generate-assets.js';
import { GenerateTilemapTool } from '../tools/generate-tilemap.js';
import { GlobTool } from '../tools/glob.js';
import { GrepTool } from '../tools/grep.js';
import { LSTool } from '../tools/ls.js';
import { MemoryTool, setGeminiMdFilename } from '../tools/memoryTool.js';
import { ReadFileTool } from '../tools/read-file.js';
import { ReadManyFilesTool } from '../tools/read-many-files.js';
import { canUseRipgrep } from '../utils/ripgrepUtils.js';
import { RipGrepTool } from '../tools/ripGrep.js';
import { ShellTool } from '../tools/shell.js';
import { SmartEditTool } from '../tools/smart-edit.js';
import { SkillTool } from '../tools/skill.js';
import { TaskTool } from '../tools/task.js';
import { TodoWriteTool } from '../tools/todoWrite.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { GameTypeClassifierTool } from '../tools/game-type-classifier.js';
import { GenerateGDDTool } from '../tools/generate-gdd.js';
//import { CopyTemplateTool } from '../tools/copy-template.js';
import { WebFetchTool } from '../tools/web-fetch.js';
import { WebSearchTool } from '../tools/web-search/index.js';
import { WriteFileTool } from '../tools/write-file.js';
// Other modules
import { ideContextStore } from '../ide/ideContext.js';
import { InputFormat, OutputFormat } from '../output/types.js';
import { PromptRegistry } from '../prompts/prompt-registry.js';
import { SkillManager } from '../skills/skill-manager.js';
import { SubagentManager } from '../subagents/subagent-manager.js';
import { DEFAULT_OTLP_ENDPOINT, DEFAULT_TELEMETRY_TARGET, initializeTelemetry, logStartSession, logRipgrepFallback, RipgrepFallbackEvent, StartSessionEvent, uiTelemetryService, } from '../telemetry/index.js';
// Utils
import { shouldAttemptBrowserLaunch } from '../utils/browser.js';
import { FileExclusions } from '../utils/ignorePatterns.js';
import { WorkspaceContext } from '../utils/workspaceContext.js';
import { isToolEnabled } from '../utils/tool-utils.js';
import { getErrorMessage } from '../utils/errors.js';
import { DEFAULT_FILE_FILTERING_OPTIONS, DEFAULT_MEMORY_FILE_FILTERING_OPTIONS, } from './constants.js';
import { DEFAULT_QWEN_EMBEDDING_MODEL, DEFAULT_QWEN_MODEL } from './models.js';
import { Storage } from './storage.js';
import { ChatRecordingService } from '../services/chatRecordingService.js';
import { SessionService, } from '../services/sessionService.js';
import { randomUUID } from 'node:crypto';
export { DEFAULT_FILE_FILTERING_OPTIONS, DEFAULT_MEMORY_FILE_FILTERING_OPTIONS, };
export var ApprovalMode;
(function (ApprovalMode) {
    ApprovalMode["PLAN"] = "plan";
    ApprovalMode["DEFAULT"] = "default";
    ApprovalMode["AUTO_EDIT"] = "auto-edit";
    ApprovalMode["YOLO"] = "yolo";
})(ApprovalMode || (ApprovalMode = {}));
export const APPROVAL_MODES = Object.values(ApprovalMode);
/**
 * Detailed information about each approval mode.
 * Used for UI display and protocol responses.
 */
export const APPROVAL_MODE_INFO = {
    [ApprovalMode.PLAN]: {
        id: ApprovalMode.PLAN,
        name: 'Plan',
        description: 'Analyze only, do not modify files or execute commands',
    },
    [ApprovalMode.DEFAULT]: {
        id: ApprovalMode.DEFAULT,
        name: 'Default',
        description: 'Require approval for file edits or shell commands',
    },
    [ApprovalMode.AUTO_EDIT]: {
        id: ApprovalMode.AUTO_EDIT,
        name: 'Auto Edit',
        description: 'Automatically approve file edits',
    },
    [ApprovalMode.YOLO]: {
        id: ApprovalMode.YOLO,
        name: 'YOLO',
        description: 'Automatically approve all tools',
    },
};
export const DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD = 25_000;
export const DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES = 1000;
export class MCPServerConfig {
    command;
    args;
    env;
    cwd;
    url;
    httpUrl;
    headers;
    tcp;
    timeout;
    trust;
    description;
    includeTools;
    excludeTools;
    extensionName;
    oauth;
    authProviderType;
    targetAudience;
    targetServiceAccount;
    type;
    constructor(
    // For stdio transport
    command, args, env, cwd, 
    // For sse transport
    url, 
    // For streamable http transport
    httpUrl, headers, 
    // For websocket transport
    tcp, 
    // Common
    timeout, trust, 
    // Metadata
    description, includeTools, excludeTools, extensionName, 
    // OAuth configuration
    oauth, authProviderType, 
    // Service Account Configuration
    /* targetAudience format: CLIENT_ID.apps.googleusercontent.com */
    targetAudience, 
    /* targetServiceAccount format: <service-account-name>@<project-num>.iam.gserviceaccount.com */
    targetServiceAccount, 
    // SDK MCP server type - 'sdk' indicates server runs in SDK process
    type) {
        this.command = command;
        this.args = args;
        this.env = env;
        this.cwd = cwd;
        this.url = url;
        this.httpUrl = httpUrl;
        this.headers = headers;
        this.tcp = tcp;
        this.timeout = timeout;
        this.trust = trust;
        this.description = description;
        this.includeTools = includeTools;
        this.excludeTools = excludeTools;
        this.extensionName = extensionName;
        this.oauth = oauth;
        this.authProviderType = authProviderType;
        this.targetAudience = targetAudience;
        this.targetServiceAccount = targetServiceAccount;
        this.type = type;
    }
}
/**
 * Check if an MCP server config represents an SDK server
 */
export function isSdkMcpServerConfig(config) {
    return config.type === 'sdk';
}
export var AuthProviderType;
(function (AuthProviderType) {
    AuthProviderType["DYNAMIC_DISCOVERY"] = "dynamic_discovery";
    AuthProviderType["GOOGLE_CREDENTIALS"] = "google_credentials";
    AuthProviderType["SERVICE_ACCOUNT_IMPERSONATION"] = "service_account_impersonation";
})(AuthProviderType || (AuthProviderType = {}));
function normalizeConfigOutputFormat(format) {
    if (!format) {
        return undefined;
    }
    switch (format) {
        case 'stream-json':
            return OutputFormat.STREAM_JSON;
        case 'json':
        case OutputFormat.JSON:
            return OutputFormat.JSON;
        case 'text':
        case OutputFormat.TEXT:
        default:
            return OutputFormat.TEXT;
    }
}
export class Config {
    sessionId;
    sessionData;
    toolRegistry;
    promptRegistry;
    subagentManager;
    skillManager;
    fileSystemService;
    contentGeneratorConfig;
    contentGenerator;
    _generationConfig;
    embeddingModel;
    sandbox;
    targetDir;
    workspaceContext;
    debugMode;
    inputFormat;
    outputFormat;
    includePartialMessages;
    question;
    fullContext;
    coreTools;
    allowedTools;
    excludeTools;
    toolDiscoveryCommand;
    toolCallCommand;
    mcpServerCommand;
    mcpServers;
    sessionSubagents;
    userMemory;
    sdkMode;
    geminiMdFileCount;
    approvalMode;
    showMemoryUsage;
    accessibility;
    telemetrySettings;
    gitCoAuthor;
    usageStatisticsEnabled;
    geminiClient;
    baseLlmClient;
    fileFiltering;
    fileDiscoveryService = null;
    gitService = undefined;
    sessionService = undefined;
    chatRecordingService = undefined;
    checkpointing;
    proxy;
    cwd;
    bugCommand;
    extensionContextFilePaths;
    noBrowser;
    folderTrustFeature;
    folderTrust;
    ideMode;
    inFallbackMode = false;
    maxSessionTurns;
    sessionTokenLimit;
    listExtensions;
    _extensions;
    _blockedMcpServers;
    fallbackModelHandler;
    quotaErrorOccurred = false;
    summarizeToolOutput;
    cliVersion;
    experimentalZedIntegration = false;
    experimentalSkills = false;
    chatRecordingEnabled;
    loadMemoryFromIncludeDirectories = false;
    openGameProviders;
    webSearch;
    chatCompression;
    interactive;
    trustedFolder;
    useRipgrep;
    useBuiltinRipgrep;
    shouldUseNodePtyShell;
    skipNextSpeakerCheck;
    shellExecutionConfig;
    extensionManagement = true;
    skipLoopDetection;
    skipStartupContext;
    vlmSwitchMode;
    initialized = false;
    storage;
    fileExclusions;
    truncateToolOutputThreshold;
    truncateToolOutputLines;
    enableToolOutputTruncation;
    eventEmitter;
    useSmartEdit;
    channel;
    constructor(params) {
        this.sessionId = params.sessionId ?? randomUUID();
        this.sessionData = params.sessionData;
        this.embeddingModel = params.embeddingModel ?? DEFAULT_QWEN_EMBEDDING_MODEL;
        this.fileSystemService = new StandardFileSystemService();
        this.sandbox = params.sandbox;
        this.targetDir = path.resolve(params.targetDir);
        this.workspaceContext = new WorkspaceContext(this.targetDir, params.includeDirectories ?? []);
        this.debugMode = params.debugMode;
        this.inputFormat = params.inputFormat ?? InputFormat.TEXT;
        const normalizedOutputFormat = normalizeConfigOutputFormat(params.outputFormat ?? params.output?.format);
        this.outputFormat = normalizedOutputFormat ?? OutputFormat.TEXT;
        this.includePartialMessages = params.includePartialMessages ?? false;
        this.question = params.question;
        this.fullContext = params.fullContext ?? false;
        this.coreTools = params.coreTools;
        this.allowedTools = params.allowedTools;
        this.excludeTools = params.excludeTools;
        this.toolDiscoveryCommand = params.toolDiscoveryCommand;
        this.toolCallCommand = params.toolCallCommand;
        this.mcpServerCommand = params.mcpServerCommand;
        this.mcpServers = params.mcpServers;
        this.sessionSubagents = params.sessionSubagents ?? [];
        this.sdkMode = params.sdkMode ?? false;
        this.userMemory = params.userMemory ?? '';
        this.geminiMdFileCount = params.geminiMdFileCount ?? 0;
        this.approvalMode = params.approvalMode ?? ApprovalMode.DEFAULT;
        this.showMemoryUsage = params.showMemoryUsage ?? false;
        this.accessibility = params.accessibility ?? {};
        this.telemetrySettings = {
            enabled: params.telemetry?.enabled ?? false,
            target: params.telemetry?.target ?? DEFAULT_TELEMETRY_TARGET,
            otlpEndpoint: params.telemetry?.otlpEndpoint ?? DEFAULT_OTLP_ENDPOINT,
            otlpProtocol: params.telemetry?.otlpProtocol,
            logPrompts: params.telemetry?.logPrompts ?? true,
            outfile: params.telemetry?.outfile,
            useCollector: params.telemetry?.useCollector,
        };
        this.gitCoAuthor = {
            enabled: params.gitCoAuthor ?? true,
            name: 'Qwen-Coder',
            email: 'qwen-coder@alibabacloud.com',
        };
        this.usageStatisticsEnabled = params.usageStatisticsEnabled ?? true;
        this.fileFiltering = {
            respectGitIgnore: params.fileFiltering?.respectGitIgnore ?? true,
            respectQwenIgnore: params.fileFiltering?.respectQwenIgnore ?? true,
            enableRecursiveFileSearch: params.fileFiltering?.enableRecursiveFileSearch ?? true,
            disableFuzzySearch: params.fileFiltering?.disableFuzzySearch ?? false,
        };
        this.checkpointing = params.checkpointing ?? false;
        this.proxy = params.proxy;
        this.cwd = params.cwd ?? process.cwd();
        this.fileDiscoveryService = params.fileDiscoveryService ?? null;
        this.bugCommand = params.bugCommand;
        this.extensionContextFilePaths = params.extensionContextFilePaths ?? [];
        this.maxSessionTurns = params.maxSessionTurns ?? -1;
        this.sessionTokenLimit = params.sessionTokenLimit ?? -1;
        this.experimentalZedIntegration =
            params.experimentalZedIntegration ?? false;
        this.experimentalSkills = params.experimentalSkills ?? false;
        this.listExtensions = params.listExtensions ?? false;
        this._extensions = params.extensions ?? [];
        this._blockedMcpServers = params.blockedMcpServers ?? [];
        this.noBrowser = params.noBrowser ?? false;
        this.summarizeToolOutput = params.summarizeToolOutput;
        this.folderTrustFeature = params.folderTrustFeature ?? false;
        this.folderTrust = params.folderTrust ?? false;
        this.ideMode = params.ideMode ?? false;
        this._generationConfig = {
            model: params.model,
            ...(params.generationConfig || {}),
            baseUrl: params.generationConfig?.baseUrl,
        };
        this.contentGeneratorConfig = this
            ._generationConfig;
        this.cliVersion = params.cliVersion;
        this.chatRecordingEnabled = params.chatRecording ?? true;
        this.loadMemoryFromIncludeDirectories =
            params.loadMemoryFromIncludeDirectories ?? false;
        this.chatCompression = params.chatCompression;
        this.interactive = params.interactive ?? false;
        this.trustedFolder = params.trustedFolder;
        this.skipLoopDetection = params.skipLoopDetection ?? false;
        this.skipStartupContext = params.skipStartupContext ?? false;
        // Web search
        this.webSearch = params.webSearch;
        this.openGameProviders = params.openGameProviders;
        this.useRipgrep = params.useRipgrep ?? true;
        this.useBuiltinRipgrep = params.useBuiltinRipgrep ?? true;
        this.shouldUseNodePtyShell = params.shouldUseNodePtyShell ?? false;
        this.skipNextSpeakerCheck = params.skipNextSpeakerCheck ?? true;
        this.shellExecutionConfig = {
            terminalWidth: params.shellExecutionConfig?.terminalWidth ?? 80,
            terminalHeight: params.shellExecutionConfig?.terminalHeight ?? 24,
            showColor: params.shellExecutionConfig?.showColor ?? false,
            pager: params.shellExecutionConfig?.pager ?? 'cat',
        };
        this.truncateToolOutputThreshold =
            params.truncateToolOutputThreshold ??
                DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD;
        this.truncateToolOutputLines =
            params.truncateToolOutputLines ?? DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES;
        this.enableToolOutputTruncation = params.enableToolOutputTruncation ?? true;
        this.useSmartEdit = params.useSmartEdit ?? false;
        this.extensionManagement = params.extensionManagement ?? true;
        this.channel = params.channel;
        this.storage = new Storage(this.targetDir);
        this.vlmSwitchMode = params.vlmSwitchMode;
        this.inputFormat = params.inputFormat ?? InputFormat.TEXT;
        this.fileExclusions = new FileExclusions(this);
        this.eventEmitter = params.eventEmitter;
        if (params.contextFileName) {
            setGeminiMdFilename(params.contextFileName);
        }
        if (this.telemetrySettings.enabled) {
            initializeTelemetry(this);
        }
        if (this.getProxy()) {
            setGlobalDispatcher(new ProxyAgent(this.getProxy()));
        }
        this.geminiClient = new GeminiClient(this);
        this.chatRecordingService = this.chatRecordingEnabled
            ? new ChatRecordingService(this)
            : undefined;
    }
    /**
     * Must only be called once, throws if called again.
     * @param options Optional initialization options including sendSdkMcpMessage callback
     */
    async initialize(options) {
        if (this.initialized) {
            throw Error('Config was already initialized');
        }
        this.initialized = true;
        // Initialize centralized FileDiscoveryService
        this.getFileService();
        if (this.getCheckpointingEnabled()) {
            await this.getGitService();
        }
        this.promptRegistry = new PromptRegistry();
        this.subagentManager = new SubagentManager(this);
        this.skillManager = new SkillManager(this);
        // Load session subagents if they were provided before initialization
        if (this.sessionSubagents.length > 0) {
            this.subagentManager.loadSessionSubagents(this.sessionSubagents);
        }
        this.toolRegistry = await this.createToolRegistry(options?.sendSdkMcpMessage);
        await this.geminiClient.initialize();
        logStartSession(this, new StartSessionEvent(this));
    }
    getContentGenerator() {
        return this.contentGenerator;
    }
    /**
     * Updates the credentials in the generation config.
     * This is needed when credentials are set after Config construction.
     */
    updateCredentials(credentials) {
        if (credentials.apiKey) {
            this._generationConfig.apiKey = credentials.apiKey;
        }
        if (credentials.baseUrl) {
            this._generationConfig.baseUrl = credentials.baseUrl;
        }
        if (credentials.model) {
            this._generationConfig.model = credentials.model;
        }
    }
    async refreshAuth(authMethod, isInitialAuth) {
        const newContentGeneratorConfig = createContentGeneratorConfig(this, authMethod, this._generationConfig);
        this.contentGenerator = await createContentGenerator(newContentGeneratorConfig, this, isInitialAuth);
        // Only assign to instance properties after successful initialization
        this.contentGeneratorConfig = newContentGeneratorConfig;
        // Initialize BaseLlmClient now that the ContentGenerator is available
        this.baseLlmClient = new BaseLlmClient(this.contentGenerator, this);
        // Reset the session flag since we're explicitly changing auth and using default model
        this.inFallbackMode = false;
    }
    /**
     * Provides access to the BaseLlmClient for stateless LLM operations.
     */
    getBaseLlmClient() {
        if (!this.baseLlmClient) {
            // Handle cases where initialization might be deferred or authentication failed
            if (this.contentGenerator) {
                this.baseLlmClient = new BaseLlmClient(this.getContentGenerator(), this);
            }
            else {
                throw new Error('BaseLlmClient not initialized. Ensure authentication has occurred and ContentGenerator is ready.');
            }
        }
        return this.baseLlmClient;
    }
    getSessionId() {
        return this.sessionId;
    }
    /**
     * Starts a new session and resets session-scoped services.
     */
    startNewSession(sessionId, sessionData) {
        this.sessionId = sessionId ?? randomUUID();
        this.sessionData = sessionData;
        this.chatRecordingService = this.chatRecordingEnabled
            ? new ChatRecordingService(this)
            : undefined;
        if (this.initialized) {
            logStartSession(this, new StartSessionEvent(this));
        }
        return this.sessionId;
    }
    /**
     * Returns the resumed session data if this session was resumed from a previous one.
     */
    getResumedSessionData() {
        return this.sessionData;
    }
    shouldLoadMemoryFromIncludeDirectories() {
        return this.loadMemoryFromIncludeDirectories;
    }
    getContentGeneratorConfig() {
        return this.contentGeneratorConfig;
    }
    getModel() {
        return this.contentGeneratorConfig?.model || DEFAULT_QWEN_MODEL;
    }
    async setModel(newModel, _metadata) {
        if (this.contentGeneratorConfig) {
            this.contentGeneratorConfig.model = newModel;
        }
        // TODO: Log _metadata for telemetry if needed
        // This _metadata can be used for tracking model switches (reason, context)
    }
    isInFallbackMode() {
        return this.inFallbackMode;
    }
    setFallbackMode(active) {
        this.inFallbackMode = active;
    }
    setFallbackModelHandler(handler) {
        this.fallbackModelHandler = handler;
    }
    getMaxSessionTurns() {
        return this.maxSessionTurns;
    }
    getSessionTokenLimit() {
        return this.sessionTokenLimit;
    }
    setQuotaErrorOccurred(value) {
        this.quotaErrorOccurred = value;
    }
    getQuotaErrorOccurred() {
        return this.quotaErrorOccurred;
    }
    getEmbeddingModel() {
        return this.embeddingModel;
    }
    getSandbox() {
        return this.sandbox;
    }
    isRestrictiveSandbox() {
        const sandboxConfig = this.getSandbox();
        const seatbeltProfile = process.env['SEATBELT_PROFILE'];
        return (!!sandboxConfig &&
            sandboxConfig.command === 'sandbox-exec' &&
            !!seatbeltProfile &&
            seatbeltProfile.startsWith('restrictive-'));
    }
    getTargetDir() {
        return this.targetDir;
    }
    getProjectRoot() {
        return this.targetDir;
    }
    getWorkspaceContext() {
        return this.workspaceContext;
    }
    getToolRegistry() {
        return this.toolRegistry;
    }
    getPromptRegistry() {
        return this.promptRegistry;
    }
    getDebugMode() {
        return this.debugMode;
    }
    getQuestion() {
        return this.question;
    }
    getFullContext() {
        return this.fullContext;
    }
    getCoreTools() {
        return this.coreTools;
    }
    getAllowedTools() {
        return this.allowedTools;
    }
    getExcludeTools() {
        return this.excludeTools;
    }
    getToolDiscoveryCommand() {
        return this.toolDiscoveryCommand;
    }
    getToolCallCommand() {
        return this.toolCallCommand;
    }
    getMcpServerCommand() {
        return this.mcpServerCommand;
    }
    getMcpServers() {
        return this.mcpServers;
    }
    addMcpServers(servers) {
        if (this.initialized) {
            throw new Error('Cannot modify mcpServers after initialization');
        }
        this.mcpServers = { ...this.mcpServers, ...servers };
    }
    getSessionSubagents() {
        return this.sessionSubagents;
    }
    setSessionSubagents(subagents) {
        if (this.initialized) {
            throw new Error('Cannot modify sessionSubagents after initialization');
        }
        this.sessionSubagents = subagents;
    }
    getSdkMode() {
        return this.sdkMode;
    }
    setSdkMode(value) {
        this.sdkMode = value;
    }
    getUserMemory() {
        return this.userMemory;
    }
    setUserMemory(newUserMemory) {
        this.userMemory = newUserMemory;
    }
    getGeminiMdFileCount() {
        return this.geminiMdFileCount;
    }
    setGeminiMdFileCount(count) {
        this.geminiMdFileCount = count;
    }
    getApprovalMode() {
        return this.approvalMode;
    }
    setApprovalMode(mode) {
        if (!this.isTrustedFolder() &&
            mode !== ApprovalMode.DEFAULT &&
            mode !== ApprovalMode.PLAN) {
            throw new Error('Cannot enable privileged approval modes in an untrusted folder.');
        }
        this.approvalMode = mode;
    }
    getShowMemoryUsage() {
        return this.showMemoryUsage;
    }
    getInputFormat() {
        return this.inputFormat;
    }
    getIncludePartialMessages() {
        return this.includePartialMessages;
    }
    getAccessibility() {
        return this.accessibility;
    }
    getTelemetryEnabled() {
        return this.telemetrySettings.enabled ?? false;
    }
    getTelemetryLogPromptsEnabled() {
        return this.telemetrySettings.logPrompts ?? true;
    }
    getTelemetryOtlpEndpoint() {
        return this.telemetrySettings.otlpEndpoint ?? DEFAULT_OTLP_ENDPOINT;
    }
    getTelemetryOtlpProtocol() {
        return this.telemetrySettings.otlpProtocol ?? 'grpc';
    }
    getTelemetryTarget() {
        return this.telemetrySettings.target ?? DEFAULT_TELEMETRY_TARGET;
    }
    getTelemetryOutfile() {
        return this.telemetrySettings.outfile;
    }
    getGitCoAuthor() {
        return this.gitCoAuthor;
    }
    getTelemetryUseCollector() {
        return this.telemetrySettings.useCollector ?? false;
    }
    getGeminiClient() {
        return this.geminiClient;
    }
    getEnableRecursiveFileSearch() {
        return this.fileFiltering.enableRecursiveFileSearch;
    }
    getFileFilteringDisableFuzzySearch() {
        return this.fileFiltering.disableFuzzySearch;
    }
    getFileFilteringRespectGitIgnore() {
        return this.fileFiltering.respectGitIgnore;
    }
    getFileFilteringRespectQwenIgnore() {
        return this.fileFiltering.respectQwenIgnore;
    }
    getFileFilteringOptions() {
        return {
            respectGitIgnore: this.fileFiltering.respectGitIgnore,
            respectQwenIgnore: this.fileFiltering.respectQwenIgnore,
        };
    }
    /**
     * Gets custom file exclusion patterns from configuration.
     * TODO: This is a placeholder implementation. In the future, this could
     * read from settings files, CLI arguments, or environment variables.
     */
    getCustomExcludes() {
        // Placeholder implementation - returns empty array for now
        // Future implementation could read from:
        // - User settings file
        // - Project-specific configuration
        // - Environment variables
        // - CLI arguments
        return [];
    }
    getCheckpointingEnabled() {
        return this.checkpointing;
    }
    getProxy() {
        return this.proxy;
    }
    getWorkingDir() {
        return this.cwd;
    }
    getBugCommand() {
        return this.bugCommand;
    }
    getFileService() {
        if (!this.fileDiscoveryService) {
            this.fileDiscoveryService = new FileDiscoveryService(this.targetDir);
        }
        return this.fileDiscoveryService;
    }
    getUsageStatisticsEnabled() {
        return this.usageStatisticsEnabled;
    }
    getExtensionContextFilePaths() {
        return this.extensionContextFilePaths;
    }
    getExperimentalZedIntegration() {
        return this.experimentalZedIntegration;
    }
    getExperimentalSkills() {
        return this.experimentalSkills;
    }
    getListExtensions() {
        return this.listExtensions;
    }
    getExtensionManagement() {
        return this.extensionManagement;
    }
    getExtensions() {
        return this._extensions;
    }
    getBlockedMcpServers() {
        return this._blockedMcpServers;
    }
    getNoBrowser() {
        return this.noBrowser;
    }
    isBrowserLaunchSuppressed() {
        return this.getNoBrowser() || !shouldAttemptBrowserLaunch();
    }
    getSummarizeToolOutputConfig() {
        return this.summarizeToolOutput;
    }
    // Web search provider configuration
    getWebSearchConfig() {
        return this.webSearch;
    }
    /**
     * Per-modality OpenGame provider configuration
     * (`reasoning`/`image`/`video`/`audio`). Sourced from the user's
     * settings.json; environment variables take precedence inside the
     * resolver. Returns `undefined` when nothing is configured, in which
     * case the resolver falls back to env vars and legacy keys.
     */
    getOpenGameProviders() {
        return this.openGameProviders;
    }
    getIdeMode() {
        return this.ideMode;
    }
    getFolderTrustFeature() {
        return this.folderTrustFeature;
    }
    /**
     * Returns 'true' if the workspace is considered "trusted".
     * 'false' for untrusted.
     */
    getFolderTrust() {
        return this.folderTrust;
    }
    isTrustedFolder() {
        // isWorkspaceTrusted in cli/src/config/trustedFolder.js returns undefined
        // when the file based trust value is unavailable, since it is mainly used
        // in the initialization for trust dialogs, etc. Here we return true since
        // config.isTrustedFolder() is used for the main business logic of blocking
        // tool calls etc in the rest of the application.
        //
        // Default value is true since we load with trusted settings to avoid
        // restarts in the more common path. If the user chooses to mark the folder
        // as untrusted, the CLI will restart and we will have the trust value
        // reloaded.
        const context = ideContextStore.get();
        if (context?.workspaceState?.isTrusted !== undefined) {
            return context.workspaceState.isTrusted;
        }
        return this.trustedFolder ?? true;
    }
    setIdeMode(value) {
        this.ideMode = value;
    }
    getAuthType() {
        return this.contentGeneratorConfig.authType;
    }
    getCliVersion() {
        return this.cliVersion;
    }
    getChannel() {
        return this.channel;
    }
    /**
     * Get the current FileSystemService
     */
    getFileSystemService() {
        return this.fileSystemService;
    }
    /**
     * Set a custom FileSystemService
     */
    setFileSystemService(fileSystemService) {
        this.fileSystemService = fileSystemService;
    }
    getChatCompression() {
        return this.chatCompression;
    }
    isInteractive() {
        return this.interactive;
    }
    getUseRipgrep() {
        return this.useRipgrep;
    }
    getUseBuiltinRipgrep() {
        return this.useBuiltinRipgrep;
    }
    getShouldUseNodePtyShell() {
        return this.shouldUseNodePtyShell;
    }
    getSkipNextSpeakerCheck() {
        return this.skipNextSpeakerCheck;
    }
    getShellExecutionConfig() {
        return this.shellExecutionConfig;
    }
    setShellExecutionConfig(config) {
        this.shellExecutionConfig = {
            terminalWidth: config.terminalWidth ?? this.shellExecutionConfig.terminalWidth,
            terminalHeight: config.terminalHeight ?? this.shellExecutionConfig.terminalHeight,
            showColor: config.showColor ?? this.shellExecutionConfig.showColor,
            pager: config.pager ?? this.shellExecutionConfig.pager,
        };
    }
    getScreenReader() {
        return this.accessibility.screenReader ?? false;
    }
    getSkipLoopDetection() {
        return this.skipLoopDetection;
    }
    getSkipStartupContext() {
        return this.skipStartupContext;
    }
    getVlmSwitchMode() {
        return this.vlmSwitchMode;
    }
    getEnableToolOutputTruncation() {
        return this.enableToolOutputTruncation;
    }
    getTruncateToolOutputThreshold() {
        if (!this.enableToolOutputTruncation ||
            this.truncateToolOutputThreshold <= 0) {
            return Number.POSITIVE_INFINITY;
        }
        return Math.min(
        // Estimate remaining context window in characters (1 token ~= 4 chars).
        4 *
            (tokenLimit(this.getModel()) -
                uiTelemetryService.getLastPromptTokenCount()), this.truncateToolOutputThreshold);
    }
    getTruncateToolOutputLines() {
        if (!this.enableToolOutputTruncation || this.truncateToolOutputLines <= 0) {
            return Number.POSITIVE_INFINITY;
        }
        return this.truncateToolOutputLines;
    }
    getUseSmartEdit() {
        return this.useSmartEdit;
    }
    getOutputFormat() {
        return this.outputFormat;
    }
    async getGitService() {
        if (!this.gitService) {
            this.gitService = new GitService(this.targetDir, this.storage);
            await this.gitService.initialize();
        }
        return this.gitService;
    }
    /**
     * Returns the chat recording service.
     */
    getChatRecordingService() {
        if (!this.chatRecordingEnabled) {
            return undefined;
        }
        if (!this.chatRecordingService) {
            this.chatRecordingService = new ChatRecordingService(this);
        }
        return this.chatRecordingService;
    }
    /**
     * Gets or creates a SessionService for managing chat sessions.
     */
    getSessionService() {
        if (!this.sessionService) {
            this.sessionService = new SessionService(this.targetDir);
        }
        return this.sessionService;
    }
    getFileExclusions() {
        return this.fileExclusions;
    }
    getSubagentManager() {
        return this.subagentManager;
    }
    getSkillManager() {
        return this.skillManager;
    }
    async createToolRegistry(sendSdkMcpMessage) {
        const registry = new ToolRegistry(this, this.eventEmitter, sendSdkMcpMessage);
        const coreToolsConfig = this.getCoreTools();
        const excludeToolsConfig = this.getExcludeTools();
        // Helper to create & register core tools that are enabled
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const registerCoreTool = (ToolClass, ...args) => {
            const toolName = ToolClass?.Name;
            const className = ToolClass?.name ?? 'UnknownTool';
            if (!toolName) {
                // Log warning and skip this tool instead of crashing
                console.warn(`[Config] Skipping tool registration: ${className} is missing static Name property. ` +
                    `Tools must define a static Name property to be registered. ` +
                    `Location: config.ts:registerCoreTool`);
                return;
            }
            if (isToolEnabled(toolName, coreToolsConfig, excludeToolsConfig)) {
                try {
                    registry.registerTool(new ToolClass(...args));
                }
                catch (error) {
                    console.error(`[Config] Failed to register tool ${className} (${toolName}):`, error);
                    throw error; // Re-throw after logging context
                }
            }
        };
        registerCoreTool(TaskTool, this);
        if (this.getExperimentalSkills()) {
            registerCoreTool(SkillTool, this);
        }
        registerCoreTool(LSTool, this);
        registerCoreTool(ReadFileTool, this);
        if (this.getUseRipgrep()) {
            let useRipgrep = false;
            let errorString = undefined;
            try {
                useRipgrep = await canUseRipgrep(this.getUseBuiltinRipgrep());
            }
            catch (error) {
                errorString = getErrorMessage(error);
            }
            if (useRipgrep) {
                registerCoreTool(RipGrepTool, this);
            }
            else {
                // Log for telemetry
                logRipgrepFallback(this, new RipgrepFallbackEvent(this.getUseRipgrep(), this.getUseBuiltinRipgrep(), errorString || 'ripgrep is not available'));
                registerCoreTool(GrepTool, this);
            }
        }
        else {
            registerCoreTool(GrepTool, this);
        }
        registerCoreTool(GlobTool, this);
        if (this.getUseSmartEdit()) {
            registerCoreTool(SmartEditTool, this);
        }
        else {
            registerCoreTool(EditTool, this);
        }
        registerCoreTool(WriteFileTool, this);
        registerCoreTool(ReadManyFilesTool, this);
        registerCoreTool(ShellTool, this);
        registerCoreTool(MemoryTool);
        registerCoreTool(TodoWriteTool, this);
        !this.sdkMode && registerCoreTool(ExitPlanModeTool, this);
        registerCoreTool(WebFetchTool, this);
        // Conditionally register web search tool if web search provider is configured
        // buildWebSearchConfig ensures qwen-oauth users get dashscope provider, so
        // if tool is registered, config must exist
        if (this.getWebSearchConfig()) {
            registerCoreTool(WebSearchTool, this);
        }
        registerCoreTool(GameTypeClassifierTool, this);
        registerCoreTool(GenerateGDDTool, this);
        registerCoreTool(GenerateAssetsTool, this);
        registerCoreTool(GenerateTilemapTool, this);
        //registerCoreTool(CopyTemplateTool, this);
        await registry.discoverAllTools();
        console.debug('ToolRegistry created', registry.getAllToolNames());
        return registry;
    }
}
//# sourceMappingURL=config.js.map