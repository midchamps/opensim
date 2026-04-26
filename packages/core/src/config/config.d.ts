/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { EventEmitter } from 'node:events';
import type { ContentGenerator, ContentGeneratorConfig, AuthType } from '../core/contentGenerator.js';
import type { FallbackModelHandler } from '../fallback/types.js';
import type { MCPOAuthConfig } from '../mcp/oauth-provider.js';
import type { ShellExecutionConfig } from '../services/shellExecutionService.js';
import type { AnyToolInvocation } from '../tools/tools.js';
import { BaseLlmClient } from '../core/baseLlmClient.js';
import { GeminiClient } from '../core/client.js';
import { FileDiscoveryService } from '../services/fileDiscoveryService.js';
import { type FileSystemService } from '../services/fileSystemService.js';
import { GitService } from '../services/gitService.js';
import type { OpenGameProvidersSettings } from '../services/providerConfig.js';
import type { SendSdkMcpMessage } from '../tools/mcp-client.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { InputFormat, OutputFormat } from '../output/types.js';
import { PromptRegistry } from '../prompts/prompt-registry.js';
import { SkillManager } from '../skills/skill-manager.js';
import { SubagentManager } from '../subagents/subagent-manager.js';
import type { SubagentConfig } from '../subagents/types.js';
import { type TelemetryTarget } from '../telemetry/index.js';
import { FileExclusions } from '../utils/ignorePatterns.js';
import { WorkspaceContext } from '../utils/workspaceContext.js';
import type { FileFilteringOptions } from './constants.js';
import { DEFAULT_FILE_FILTERING_OPTIONS, DEFAULT_MEMORY_FILE_FILTERING_OPTIONS } from './constants.js';
import { Storage } from './storage.js';
import { ChatRecordingService } from '../services/chatRecordingService.js';
import { SessionService, type ResumedSessionData } from '../services/sessionService.js';
export type { AnyToolInvocation, FileFilteringOptions, MCPOAuthConfig };
export { DEFAULT_FILE_FILTERING_OPTIONS, DEFAULT_MEMORY_FILE_FILTERING_OPTIONS, };
export declare enum ApprovalMode {
    PLAN = "plan",
    DEFAULT = "default",
    AUTO_EDIT = "auto-edit",
    YOLO = "yolo"
}
export declare const APPROVAL_MODES: ApprovalMode[];
/**
 * Information about an approval mode including display name and description.
 */
export interface ApprovalModeInfo {
    id: ApprovalMode;
    name: string;
    description: string;
}
/**
 * Detailed information about each approval mode.
 * Used for UI display and protocol responses.
 */
export declare const APPROVAL_MODE_INFO: Record<ApprovalMode, ApprovalModeInfo>;
export interface AccessibilitySettings {
    disableLoadingPhrases?: boolean;
    screenReader?: boolean;
}
export interface BugCommandSettings {
    urlTemplate: string;
}
export interface ChatCompressionSettings {
    contextPercentageThreshold?: number;
}
export interface SummarizeToolOutputSettings {
    tokenBudget?: number;
}
export interface TelemetrySettings {
    enabled?: boolean;
    target?: TelemetryTarget;
    otlpEndpoint?: string;
    otlpProtocol?: 'grpc' | 'http';
    logPrompts?: boolean;
    outfile?: string;
    useCollector?: boolean;
}
export interface OutputSettings {
    format?: OutputFormat;
}
export interface GitCoAuthorSettings {
    enabled?: boolean;
    name?: string;
    email?: string;
}
export interface GeminiCLIExtension {
    name: string;
    version: string;
    isActive: boolean;
    path: string;
    installMetadata?: ExtensionInstallMetadata;
}
export interface ExtensionInstallMetadata {
    source: string;
    type: 'git' | 'local' | 'link' | 'github-release';
    releaseTag?: string;
    ref?: string;
    autoUpdate?: boolean;
}
export declare const DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD = 25000;
export declare const DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES = 1000;
export declare class MCPServerConfig {
    readonly command?: string | undefined;
    readonly args?: string[] | undefined;
    readonly env?: Record<string, string> | undefined;
    readonly cwd?: string | undefined;
    readonly url?: string | undefined;
    readonly httpUrl?: string | undefined;
    readonly headers?: Record<string, string> | undefined;
    readonly tcp?: string | undefined;
    readonly timeout?: number | undefined;
    readonly trust?: boolean | undefined;
    readonly description?: string | undefined;
    readonly includeTools?: string[] | undefined;
    readonly excludeTools?: string[] | undefined;
    readonly extensionName?: string | undefined;
    readonly oauth?: MCPOAuthConfig | undefined;
    readonly authProviderType?: AuthProviderType | undefined;
    readonly targetAudience?: string | undefined;
    readonly targetServiceAccount?: string | undefined;
    readonly type?: "sdk" | undefined;
    constructor(command?: string | undefined, args?: string[] | undefined, env?: Record<string, string> | undefined, cwd?: string | undefined, url?: string | undefined, httpUrl?: string | undefined, headers?: Record<string, string> | undefined, tcp?: string | undefined, timeout?: number | undefined, trust?: boolean | undefined, description?: string | undefined, includeTools?: string[] | undefined, excludeTools?: string[] | undefined, extensionName?: string | undefined, oauth?: MCPOAuthConfig | undefined, authProviderType?: AuthProviderType | undefined, targetAudience?: string | undefined, targetServiceAccount?: string | undefined, type?: "sdk" | undefined);
}
/**
 * Check if an MCP server config represents an SDK server
 */
export declare function isSdkMcpServerConfig(config: MCPServerConfig): boolean;
export declare enum AuthProviderType {
    DYNAMIC_DISCOVERY = "dynamic_discovery",
    GOOGLE_CREDENTIALS = "google_credentials",
    SERVICE_ACCOUNT_IMPERSONATION = "service_account_impersonation"
}
export interface SandboxConfig {
    command: 'docker' | 'podman' | 'sandbox-exec';
    image: string;
}
export interface ConfigParameters {
    sessionId?: string;
    sessionData?: ResumedSessionData;
    embeddingModel?: string;
    sandbox?: SandboxConfig;
    targetDir: string;
    debugMode: boolean;
    includePartialMessages?: boolean;
    question?: string;
    fullContext?: boolean;
    coreTools?: string[];
    allowedTools?: string[];
    excludeTools?: string[];
    toolDiscoveryCommand?: string;
    toolCallCommand?: string;
    mcpServerCommand?: string;
    mcpServers?: Record<string, MCPServerConfig>;
    userMemory?: string;
    geminiMdFileCount?: number;
    approvalMode?: ApprovalMode;
    showMemoryUsage?: boolean;
    contextFileName?: string | string[];
    accessibility?: AccessibilitySettings;
    telemetry?: TelemetrySettings;
    gitCoAuthor?: boolean;
    usageStatisticsEnabled?: boolean;
    fileFiltering?: {
        respectGitIgnore?: boolean;
        respectQwenIgnore?: boolean;
        enableRecursiveFileSearch?: boolean;
        disableFuzzySearch?: boolean;
    };
    checkpointing?: boolean;
    proxy?: string;
    cwd: string;
    fileDiscoveryService?: FileDiscoveryService;
    includeDirectories?: string[];
    bugCommand?: BugCommandSettings;
    model?: string;
    extensionContextFilePaths?: string[];
    maxSessionTurns?: number;
    sessionTokenLimit?: number;
    experimentalSkills?: boolean;
    experimentalZedIntegration?: boolean;
    listExtensions?: boolean;
    extensions?: GeminiCLIExtension[];
    blockedMcpServers?: Array<{
        name: string;
        extensionName: string;
    }>;
    noBrowser?: boolean;
    summarizeToolOutput?: Record<string, SummarizeToolOutputSettings>;
    folderTrustFeature?: boolean;
    folderTrust?: boolean;
    ideMode?: boolean;
    authType?: AuthType;
    generationConfig?: Partial<ContentGeneratorConfig>;
    cliVersion?: string;
    loadMemoryFromIncludeDirectories?: boolean;
    chatRecording?: boolean;
    webSearch?: {
        provider: Array<{
            type: 'tavily' | 'google' | 'dashscope';
            apiKey?: string;
            searchEngineId?: string;
        }>;
        default: string;
    };
    openGameProviders?: OpenGameProvidersSettings;
    chatCompression?: ChatCompressionSettings;
    interactive?: boolean;
    trustedFolder?: boolean;
    useRipgrep?: boolean;
    useBuiltinRipgrep?: boolean;
    shouldUseNodePtyShell?: boolean;
    skipNextSpeakerCheck?: boolean;
    shellExecutionConfig?: ShellExecutionConfig;
    extensionManagement?: boolean;
    skipLoopDetection?: boolean;
    vlmSwitchMode?: string;
    truncateToolOutputThreshold?: number;
    truncateToolOutputLines?: number;
    enableToolOutputTruncation?: boolean;
    eventEmitter?: EventEmitter;
    useSmartEdit?: boolean;
    output?: OutputSettings;
    inputFormat?: InputFormat;
    outputFormat?: OutputFormat;
    skipStartupContext?: boolean;
    sdkMode?: boolean;
    sessionSubagents?: SubagentConfig[];
    channel?: string;
}
/**
 * Options for Config.initialize()
 */
export interface ConfigInitializeOptions {
    /**
     * Callback for sending MCP messages to SDK servers via control plane.
     * Required for SDK MCP server support in SDK mode.
     */
    sendSdkMcpMessage?: SendSdkMcpMessage;
}
export declare class Config {
    private sessionId;
    private sessionData?;
    private toolRegistry;
    private promptRegistry;
    private subagentManager;
    private skillManager;
    private fileSystemService;
    private contentGeneratorConfig;
    private contentGenerator;
    private _generationConfig;
    private readonly embeddingModel;
    private readonly sandbox;
    private readonly targetDir;
    private workspaceContext;
    private readonly debugMode;
    private readonly inputFormat;
    private readonly outputFormat;
    private readonly includePartialMessages;
    private readonly question;
    private readonly fullContext;
    private readonly coreTools;
    private readonly allowedTools;
    private readonly excludeTools;
    private readonly toolDiscoveryCommand;
    private readonly toolCallCommand;
    private readonly mcpServerCommand;
    private mcpServers;
    private sessionSubagents;
    private userMemory;
    private sdkMode;
    private geminiMdFileCount;
    private approvalMode;
    private readonly showMemoryUsage;
    private readonly accessibility;
    private readonly telemetrySettings;
    private readonly gitCoAuthor;
    private readonly usageStatisticsEnabled;
    private geminiClient;
    private baseLlmClient;
    private readonly fileFiltering;
    private fileDiscoveryService;
    private gitService;
    private sessionService;
    private chatRecordingService;
    private readonly checkpointing;
    private readonly proxy;
    private readonly cwd;
    private readonly bugCommand;
    private readonly extensionContextFilePaths;
    private readonly noBrowser;
    private readonly folderTrustFeature;
    private readonly folderTrust;
    private ideMode;
    private inFallbackMode;
    private readonly maxSessionTurns;
    private readonly sessionTokenLimit;
    private readonly listExtensions;
    private readonly _extensions;
    private readonly _blockedMcpServers;
    fallbackModelHandler?: FallbackModelHandler;
    private quotaErrorOccurred;
    private readonly summarizeToolOutput;
    private readonly cliVersion?;
    private readonly experimentalZedIntegration;
    private readonly experimentalSkills;
    private readonly chatRecordingEnabled;
    private readonly loadMemoryFromIncludeDirectories;
    private readonly openGameProviders?;
    private readonly webSearch?;
    private readonly chatCompression;
    private readonly interactive;
    private readonly trustedFolder;
    private readonly useRipgrep;
    private readonly useBuiltinRipgrep;
    private readonly shouldUseNodePtyShell;
    private readonly skipNextSpeakerCheck;
    private shellExecutionConfig;
    private readonly extensionManagement;
    private readonly skipLoopDetection;
    private readonly skipStartupContext;
    private readonly vlmSwitchMode;
    private initialized;
    readonly storage: Storage;
    private readonly fileExclusions;
    private readonly truncateToolOutputThreshold;
    private readonly truncateToolOutputLines;
    private readonly enableToolOutputTruncation;
    private readonly eventEmitter?;
    private readonly useSmartEdit;
    private readonly channel;
    constructor(params: ConfigParameters);
    /**
     * Must only be called once, throws if called again.
     * @param options Optional initialization options including sendSdkMcpMessage callback
     */
    initialize(options?: ConfigInitializeOptions): Promise<void>;
    getContentGenerator(): ContentGenerator;
    /**
     * Updates the credentials in the generation config.
     * This is needed when credentials are set after Config construction.
     */
    updateCredentials(credentials: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }): void;
    refreshAuth(authMethod: AuthType, isInitialAuth?: boolean): Promise<void>;
    /**
     * Provides access to the BaseLlmClient for stateless LLM operations.
     */
    getBaseLlmClient(): BaseLlmClient;
    getSessionId(): string;
    /**
     * Starts a new session and resets session-scoped services.
     */
    startNewSession(sessionId?: string, sessionData?: ResumedSessionData): string;
    /**
     * Returns the resumed session data if this session was resumed from a previous one.
     */
    getResumedSessionData(): ResumedSessionData | undefined;
    shouldLoadMemoryFromIncludeDirectories(): boolean;
    getContentGeneratorConfig(): ContentGeneratorConfig;
    getModel(): string;
    setModel(newModel: string, _metadata?: {
        reason?: string;
        context?: string;
    }): Promise<void>;
    isInFallbackMode(): boolean;
    setFallbackMode(active: boolean): void;
    setFallbackModelHandler(handler: FallbackModelHandler): void;
    getMaxSessionTurns(): number;
    getSessionTokenLimit(): number;
    setQuotaErrorOccurred(value: boolean): void;
    getQuotaErrorOccurred(): boolean;
    getEmbeddingModel(): string;
    getSandbox(): SandboxConfig | undefined;
    isRestrictiveSandbox(): boolean;
    getTargetDir(): string;
    getProjectRoot(): string;
    getWorkspaceContext(): WorkspaceContext;
    getToolRegistry(): ToolRegistry;
    getPromptRegistry(): PromptRegistry;
    getDebugMode(): boolean;
    getQuestion(): string | undefined;
    getFullContext(): boolean;
    getCoreTools(): string[] | undefined;
    getAllowedTools(): string[] | undefined;
    getExcludeTools(): string[] | undefined;
    getToolDiscoveryCommand(): string | undefined;
    getToolCallCommand(): string | undefined;
    getMcpServerCommand(): string | undefined;
    getMcpServers(): Record<string, MCPServerConfig> | undefined;
    addMcpServers(servers: Record<string, MCPServerConfig>): void;
    getSessionSubagents(): SubagentConfig[];
    setSessionSubagents(subagents: SubagentConfig[]): void;
    getSdkMode(): boolean;
    setSdkMode(value: boolean): void;
    getUserMemory(): string;
    setUserMemory(newUserMemory: string): void;
    getGeminiMdFileCount(): number;
    setGeminiMdFileCount(count: number): void;
    getApprovalMode(): ApprovalMode;
    setApprovalMode(mode: ApprovalMode): void;
    getShowMemoryUsage(): boolean;
    getInputFormat(): 'text' | 'stream-json';
    getIncludePartialMessages(): boolean;
    getAccessibility(): AccessibilitySettings;
    getTelemetryEnabled(): boolean;
    getTelemetryLogPromptsEnabled(): boolean;
    getTelemetryOtlpEndpoint(): string;
    getTelemetryOtlpProtocol(): 'grpc' | 'http';
    getTelemetryTarget(): TelemetryTarget;
    getTelemetryOutfile(): string | undefined;
    getGitCoAuthor(): GitCoAuthorSettings;
    getTelemetryUseCollector(): boolean;
    getGeminiClient(): GeminiClient;
    getEnableRecursiveFileSearch(): boolean;
    getFileFilteringDisableFuzzySearch(): boolean;
    getFileFilteringRespectGitIgnore(): boolean;
    getFileFilteringRespectQwenIgnore(): boolean;
    getFileFilteringOptions(): FileFilteringOptions;
    /**
     * Gets custom file exclusion patterns from configuration.
     * TODO: This is a placeholder implementation. In the future, this could
     * read from settings files, CLI arguments, or environment variables.
     */
    getCustomExcludes(): string[];
    getCheckpointingEnabled(): boolean;
    getProxy(): string | undefined;
    getWorkingDir(): string;
    getBugCommand(): BugCommandSettings | undefined;
    getFileService(): FileDiscoveryService;
    getUsageStatisticsEnabled(): boolean;
    getExtensionContextFilePaths(): string[];
    getExperimentalZedIntegration(): boolean;
    getExperimentalSkills(): boolean;
    getListExtensions(): boolean;
    getExtensionManagement(): boolean;
    getExtensions(): GeminiCLIExtension[];
    getBlockedMcpServers(): Array<{
        name: string;
        extensionName: string;
    }>;
    getNoBrowser(): boolean;
    isBrowserLaunchSuppressed(): boolean;
    getSummarizeToolOutputConfig(): Record<string, SummarizeToolOutputSettings> | undefined;
    getWebSearchConfig(): {
        provider: Array<{
            type: "tavily" | "google" | "dashscope";
            apiKey?: string;
            searchEngineId?: string;
        }>;
        default: string;
    } | undefined;
    /**
     * Per-modality OpenGame provider configuration
     * (`reasoning`/`image`/`video`/`audio`). Sourced from the user's
     * settings.json; environment variables take precedence inside the
     * resolver. Returns `undefined` when nothing is configured, in which
     * case the resolver falls back to env vars and legacy keys.
     */
    getOpenGameProviders(): OpenGameProvidersSettings | undefined;
    getIdeMode(): boolean;
    getFolderTrustFeature(): boolean;
    /**
     * Returns 'true' if the workspace is considered "trusted".
     * 'false' for untrusted.
     */
    getFolderTrust(): boolean;
    isTrustedFolder(): boolean;
    setIdeMode(value: boolean): void;
    getAuthType(): AuthType | undefined;
    getCliVersion(): string | undefined;
    getChannel(): string | undefined;
    /**
     * Get the current FileSystemService
     */
    getFileSystemService(): FileSystemService;
    /**
     * Set a custom FileSystemService
     */
    setFileSystemService(fileSystemService: FileSystemService): void;
    getChatCompression(): ChatCompressionSettings | undefined;
    isInteractive(): boolean;
    getUseRipgrep(): boolean;
    getUseBuiltinRipgrep(): boolean;
    getShouldUseNodePtyShell(): boolean;
    getSkipNextSpeakerCheck(): boolean;
    getShellExecutionConfig(): ShellExecutionConfig;
    setShellExecutionConfig(config: ShellExecutionConfig): void;
    getScreenReader(): boolean;
    getSkipLoopDetection(): boolean;
    getSkipStartupContext(): boolean;
    getVlmSwitchMode(): string | undefined;
    getEnableToolOutputTruncation(): boolean;
    getTruncateToolOutputThreshold(): number;
    getTruncateToolOutputLines(): number;
    getUseSmartEdit(): boolean;
    getOutputFormat(): OutputFormat;
    getGitService(): Promise<GitService>;
    /**
     * Returns the chat recording service.
     */
    getChatRecordingService(): ChatRecordingService | undefined;
    /**
     * Gets or creates a SessionService for managing chat sessions.
     */
    getSessionService(): SessionService;
    getFileExclusions(): FileExclusions;
    getSubagentManager(): SubagentManager;
    getSkillManager(): SkillManager;
    createToolRegistry(sendSdkMcpMessage?: SendSdkMcpMessage): Promise<ToolRegistry>;
}
