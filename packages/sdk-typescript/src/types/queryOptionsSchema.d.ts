import { z } from 'zod';
import type { CanUseTool } from './types.js';
import type { SubagentConfig } from './protocol.js';
/**
 * OAuth configuration for MCP servers
 */
export declare const McpOAuthConfigSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    clientId: z.ZodOptional<z.ZodString>;
    clientSecret: z.ZodOptional<z.ZodString>;
    scopes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    redirectUri: z.ZodOptional<z.ZodString>;
    authorizationUrl: z.ZodOptional<z.ZodString>;
    tokenUrl: z.ZodOptional<z.ZodString>;
    audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tokenParamName: z.ZodOptional<z.ZodString>;
    registrationUrl: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    enabled?: boolean | undefined;
    scopes?: string[] | undefined;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    redirectUri?: string | undefined;
    tokenUrl?: string | undefined;
    authorizationUrl?: string | undefined;
    audiences?: string[] | undefined;
    tokenParamName?: string | undefined;
    registrationUrl?: string | undefined;
}, {
    enabled?: boolean | undefined;
    scopes?: string[] | undefined;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    redirectUri?: string | undefined;
    tokenUrl?: string | undefined;
    authorizationUrl?: string | undefined;
    audiences?: string[] | undefined;
    tokenParamName?: string | undefined;
    registrationUrl?: string | undefined;
}>;
/**
 * CLI MCP Server configuration schema
 *
 * Supports multiple transport types:
 * - stdio: command, args, env, cwd
 * - SSE: url
 * - Streamable HTTP: httpUrl, headers
 * - WebSocket: tcp
 */
export declare const CLIMcpServerConfigSchema: z.ZodObject<{
    command: z.ZodOptional<z.ZodString>;
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    cwd: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    httpUrl: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    tcp: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    trust: z.ZodOptional<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    includeTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludeTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    extensionName: z.ZodOptional<z.ZodString>;
    oauth: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        clientId: z.ZodOptional<z.ZodString>;
        clientSecret: z.ZodOptional<z.ZodString>;
        scopes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        redirectUri: z.ZodOptional<z.ZodString>;
        authorizationUrl: z.ZodOptional<z.ZodString>;
        tokenUrl: z.ZodOptional<z.ZodString>;
        audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tokenParamName: z.ZodOptional<z.ZodString>;
        registrationUrl: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        enabled?: boolean | undefined;
        scopes?: string[] | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tokenUrl?: string | undefined;
        authorizationUrl?: string | undefined;
        audiences?: string[] | undefined;
        tokenParamName?: string | undefined;
        registrationUrl?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        scopes?: string[] | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tokenUrl?: string | undefined;
        authorizationUrl?: string | undefined;
        audiences?: string[] | undefined;
        tokenParamName?: string | undefined;
        registrationUrl?: string | undefined;
    }>>;
    authProviderType: z.ZodOptional<z.ZodEnum<["dynamic_discovery", "google_credentials", "service_account_impersonation"]>>;
    targetAudience: z.ZodOptional<z.ZodString>;
    targetServiceAccount: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    args?: string[] | undefined;
    command?: string | undefined;
    url?: string | undefined;
    env?: Record<string, string> | undefined;
    timeout?: number | undefined;
    headers?: Record<string, string> | undefined;
    cwd?: string | undefined;
    httpUrl?: string | undefined;
    targetAudience?: string | undefined;
    includeTools?: string[] | undefined;
    excludeTools?: string[] | undefined;
    trust?: boolean | undefined;
    tcp?: string | undefined;
    extensionName?: string | undefined;
    oauth?: {
        enabled?: boolean | undefined;
        scopes?: string[] | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tokenUrl?: string | undefined;
        authorizationUrl?: string | undefined;
        audiences?: string[] | undefined;
        tokenParamName?: string | undefined;
        registrationUrl?: string | undefined;
    } | undefined;
    authProviderType?: "service_account_impersonation" | "dynamic_discovery" | "google_credentials" | undefined;
    targetServiceAccount?: string | undefined;
}, {
    description?: string | undefined;
    args?: string[] | undefined;
    command?: string | undefined;
    url?: string | undefined;
    env?: Record<string, string> | undefined;
    timeout?: number | undefined;
    headers?: Record<string, string> | undefined;
    cwd?: string | undefined;
    httpUrl?: string | undefined;
    targetAudience?: string | undefined;
    includeTools?: string[] | undefined;
    excludeTools?: string[] | undefined;
    trust?: boolean | undefined;
    tcp?: string | undefined;
    extensionName?: string | undefined;
    oauth?: {
        enabled?: boolean | undefined;
        scopes?: string[] | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tokenUrl?: string | undefined;
        authorizationUrl?: string | undefined;
        audiences?: string[] | undefined;
        tokenParamName?: string | undefined;
        registrationUrl?: string | undefined;
    } | undefined;
    authProviderType?: "service_account_impersonation" | "dynamic_discovery" | "google_credentials" | undefined;
    targetServiceAccount?: string | undefined;
}>;
/**
 * SDK MCP Server configuration schema
 */
export declare const SdkMcpServerConfigSchema: z.ZodObject<{
    type: z.ZodLiteral<"sdk">;
    name: z.ZodString;
    instance: z.ZodType<{
        connect(transport: unknown): Promise<void>;
        close(): Promise<void>;
    }, z.ZodTypeDef, {
        connect(transport: unknown): Promise<void>;
        close(): Promise<void>;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "sdk";
    name: string;
    instance: {
        connect(transport: unknown): Promise<void>;
        close(): Promise<void>;
    };
}, {
    type: "sdk";
    name: string;
    instance: {
        connect(transport: unknown): Promise<void>;
        close(): Promise<void>;
    };
}>;
/**
 * Unified MCP Server configuration schema
 */
export declare const McpServerConfigSchema: z.ZodUnion<[z.ZodObject<{
    command: z.ZodOptional<z.ZodString>;
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    cwd: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    httpUrl: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    tcp: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    trust: z.ZodOptional<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    includeTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludeTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    extensionName: z.ZodOptional<z.ZodString>;
    oauth: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        clientId: z.ZodOptional<z.ZodString>;
        clientSecret: z.ZodOptional<z.ZodString>;
        scopes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        redirectUri: z.ZodOptional<z.ZodString>;
        authorizationUrl: z.ZodOptional<z.ZodString>;
        tokenUrl: z.ZodOptional<z.ZodString>;
        audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tokenParamName: z.ZodOptional<z.ZodString>;
        registrationUrl: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        enabled?: boolean | undefined;
        scopes?: string[] | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tokenUrl?: string | undefined;
        authorizationUrl?: string | undefined;
        audiences?: string[] | undefined;
        tokenParamName?: string | undefined;
        registrationUrl?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        scopes?: string[] | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tokenUrl?: string | undefined;
        authorizationUrl?: string | undefined;
        audiences?: string[] | undefined;
        tokenParamName?: string | undefined;
        registrationUrl?: string | undefined;
    }>>;
    authProviderType: z.ZodOptional<z.ZodEnum<["dynamic_discovery", "google_credentials", "service_account_impersonation"]>>;
    targetAudience: z.ZodOptional<z.ZodString>;
    targetServiceAccount: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    args?: string[] | undefined;
    command?: string | undefined;
    url?: string | undefined;
    env?: Record<string, string> | undefined;
    timeout?: number | undefined;
    headers?: Record<string, string> | undefined;
    cwd?: string | undefined;
    httpUrl?: string | undefined;
    targetAudience?: string | undefined;
    includeTools?: string[] | undefined;
    excludeTools?: string[] | undefined;
    trust?: boolean | undefined;
    tcp?: string | undefined;
    extensionName?: string | undefined;
    oauth?: {
        enabled?: boolean | undefined;
        scopes?: string[] | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tokenUrl?: string | undefined;
        authorizationUrl?: string | undefined;
        audiences?: string[] | undefined;
        tokenParamName?: string | undefined;
        registrationUrl?: string | undefined;
    } | undefined;
    authProviderType?: "service_account_impersonation" | "dynamic_discovery" | "google_credentials" | undefined;
    targetServiceAccount?: string | undefined;
}, {
    description?: string | undefined;
    args?: string[] | undefined;
    command?: string | undefined;
    url?: string | undefined;
    env?: Record<string, string> | undefined;
    timeout?: number | undefined;
    headers?: Record<string, string> | undefined;
    cwd?: string | undefined;
    httpUrl?: string | undefined;
    targetAudience?: string | undefined;
    includeTools?: string[] | undefined;
    excludeTools?: string[] | undefined;
    trust?: boolean | undefined;
    tcp?: string | undefined;
    extensionName?: string | undefined;
    oauth?: {
        enabled?: boolean | undefined;
        scopes?: string[] | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        redirectUri?: string | undefined;
        tokenUrl?: string | undefined;
        authorizationUrl?: string | undefined;
        audiences?: string[] | undefined;
        tokenParamName?: string | undefined;
        registrationUrl?: string | undefined;
    } | undefined;
    authProviderType?: "service_account_impersonation" | "dynamic_discovery" | "google_credentials" | undefined;
    targetServiceAccount?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"sdk">;
    name: z.ZodString;
    instance: z.ZodType<{
        connect(transport: unknown): Promise<void>;
        close(): Promise<void>;
    }, z.ZodTypeDef, {
        connect(transport: unknown): Promise<void>;
        close(): Promise<void>;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "sdk";
    name: string;
    instance: {
        connect(transport: unknown): Promise<void>;
        close(): Promise<void>;
    };
}, {
    type: "sdk";
    name: string;
    instance: {
        connect(transport: unknown): Promise<void>;
        close(): Promise<void>;
    };
}>]>;
export declare const ModelConfigSchema: z.ZodObject<{
    model: z.ZodOptional<z.ZodString>;
    temp: z.ZodOptional<z.ZodNumber>;
    top_p: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    model?: string | undefined;
    temp?: number | undefined;
    top_p?: number | undefined;
}, {
    model?: string | undefined;
    temp?: number | undefined;
    top_p?: number | undefined;
}>;
export declare const RunConfigSchema: z.ZodObject<{
    max_time_minutes: z.ZodOptional<z.ZodNumber>;
    max_turns: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    max_time_minutes?: number | undefined;
    max_turns?: number | undefined;
}, {
    max_time_minutes?: number | undefined;
    max_turns?: number | undefined;
}>;
export declare const SubagentConfigSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    systemPrompt: z.ZodString;
    modelConfig: z.ZodOptional<z.ZodObject<{
        model: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        temp: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        top_p: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        temp?: number | undefined;
        top_p?: number | undefined;
    }, {
        model?: string | undefined;
        temp?: number | undefined;
        top_p?: number | undefined;
    }>>;
    runConfig: z.ZodOptional<z.ZodObject<{
        max_time_minutes: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        max_turns: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        max_time_minutes?: number | undefined;
        max_turns?: number | undefined;
    }, {
        max_time_minutes?: number | undefined;
        max_turns?: number | undefined;
    }>>;
    color: z.ZodOptional<z.ZodString>;
    isBuiltin: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    systemPrompt: string;
    color?: string | undefined;
    tools?: string[] | undefined;
    modelConfig?: {
        model?: string | undefined;
        temp?: number | undefined;
        top_p?: number | undefined;
    } | undefined;
    runConfig?: {
        max_time_minutes?: number | undefined;
        max_turns?: number | undefined;
    } | undefined;
    isBuiltin?: boolean | undefined;
}, {
    description: string;
    name: string;
    systemPrompt: string;
    color?: string | undefined;
    tools?: string[] | undefined;
    modelConfig?: {
        model?: string | undefined;
        temp?: number | undefined;
        top_p?: number | undefined;
    } | undefined;
    runConfig?: {
        max_time_minutes?: number | undefined;
        max_turns?: number | undefined;
    } | undefined;
    isBuiltin?: boolean | undefined;
}>;
export declare const TimeoutConfigSchema: z.ZodObject<{
    canUseTool: z.ZodOptional<z.ZodNumber>;
    mcpRequest: z.ZodOptional<z.ZodNumber>;
    controlRequest: z.ZodOptional<z.ZodNumber>;
    streamClose: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    canUseTool?: number | undefined;
    mcpRequest?: number | undefined;
    controlRequest?: number | undefined;
    streamClose?: number | undefined;
}, {
    canUseTool?: number | undefined;
    mcpRequest?: number | undefined;
    controlRequest?: number | undefined;
    streamClose?: number | undefined;
}>;
export declare const QueryOptionsSchema: z.ZodObject<{
    cwd: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    pathToQwenExecutable: z.ZodOptional<z.ZodString>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    permissionMode: z.ZodOptional<z.ZodEnum<["default", "plan", "auto-edit", "yolo"]>>;
    canUseTool: z.ZodOptional<z.ZodType<CanUseTool, z.ZodTypeDef, CanUseTool>>;
    mcpServers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodObject<{
        command: z.ZodOptional<z.ZodString>;
        args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        cwd: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        httpUrl: z.ZodOptional<z.ZodString>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        tcp: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        trust: z.ZodOptional<z.ZodBoolean>;
        description: z.ZodOptional<z.ZodString>;
        includeTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        excludeTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        extensionName: z.ZodOptional<z.ZodString>;
        oauth: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodOptional<z.ZodBoolean>;
            clientId: z.ZodOptional<z.ZodString>;
            clientSecret: z.ZodOptional<z.ZodString>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            redirectUri: z.ZodOptional<z.ZodString>;
            authorizationUrl: z.ZodOptional<z.ZodString>;
            tokenUrl: z.ZodOptional<z.ZodString>;
            audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            tokenParamName: z.ZodOptional<z.ZodString>;
            registrationUrl: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            enabled?: boolean | undefined;
            scopes?: string[] | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            redirectUri?: string | undefined;
            tokenUrl?: string | undefined;
            authorizationUrl?: string | undefined;
            audiences?: string[] | undefined;
            tokenParamName?: string | undefined;
            registrationUrl?: string | undefined;
        }, {
            enabled?: boolean | undefined;
            scopes?: string[] | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            redirectUri?: string | undefined;
            tokenUrl?: string | undefined;
            authorizationUrl?: string | undefined;
            audiences?: string[] | undefined;
            tokenParamName?: string | undefined;
            registrationUrl?: string | undefined;
        }>>;
        authProviderType: z.ZodOptional<z.ZodEnum<["dynamic_discovery", "google_credentials", "service_account_impersonation"]>>;
        targetAudience: z.ZodOptional<z.ZodString>;
        targetServiceAccount: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        args?: string[] | undefined;
        command?: string | undefined;
        url?: string | undefined;
        env?: Record<string, string> | undefined;
        timeout?: number | undefined;
        headers?: Record<string, string> | undefined;
        cwd?: string | undefined;
        httpUrl?: string | undefined;
        targetAudience?: string | undefined;
        includeTools?: string[] | undefined;
        excludeTools?: string[] | undefined;
        trust?: boolean | undefined;
        tcp?: string | undefined;
        extensionName?: string | undefined;
        oauth?: {
            enabled?: boolean | undefined;
            scopes?: string[] | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            redirectUri?: string | undefined;
            tokenUrl?: string | undefined;
            authorizationUrl?: string | undefined;
            audiences?: string[] | undefined;
            tokenParamName?: string | undefined;
            registrationUrl?: string | undefined;
        } | undefined;
        authProviderType?: "service_account_impersonation" | "dynamic_discovery" | "google_credentials" | undefined;
        targetServiceAccount?: string | undefined;
    }, {
        description?: string | undefined;
        args?: string[] | undefined;
        command?: string | undefined;
        url?: string | undefined;
        env?: Record<string, string> | undefined;
        timeout?: number | undefined;
        headers?: Record<string, string> | undefined;
        cwd?: string | undefined;
        httpUrl?: string | undefined;
        targetAudience?: string | undefined;
        includeTools?: string[] | undefined;
        excludeTools?: string[] | undefined;
        trust?: boolean | undefined;
        tcp?: string | undefined;
        extensionName?: string | undefined;
        oauth?: {
            enabled?: boolean | undefined;
            scopes?: string[] | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            redirectUri?: string | undefined;
            tokenUrl?: string | undefined;
            authorizationUrl?: string | undefined;
            audiences?: string[] | undefined;
            tokenParamName?: string | undefined;
            registrationUrl?: string | undefined;
        } | undefined;
        authProviderType?: "service_account_impersonation" | "dynamic_discovery" | "google_credentials" | undefined;
        targetServiceAccount?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"sdk">;
        name: z.ZodString;
        instance: z.ZodType<{
            connect(transport: unknown): Promise<void>;
            close(): Promise<void>;
        }, z.ZodTypeDef, {
            connect(transport: unknown): Promise<void>;
            close(): Promise<void>;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "sdk";
        name: string;
        instance: {
            connect(transport: unknown): Promise<void>;
            close(): Promise<void>;
        };
    }, {
        type: "sdk";
        name: string;
        instance: {
            connect(transport: unknown): Promise<void>;
            close(): Promise<void>;
        };
    }>]>>>;
    abortController: z.ZodOptional<z.ZodType<AbortController, z.ZodTypeDef, AbortController>>;
    debug: z.ZodOptional<z.ZodBoolean>;
    stderr: z.ZodOptional<z.ZodType<(message: string) => void, z.ZodTypeDef, (message: string) => void>>;
    logLevel: z.ZodOptional<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    maxSessionTurns: z.ZodOptional<z.ZodNumber>;
    coreTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludeTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    allowedTools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    authType: z.ZodOptional<z.ZodEnum<["openai", "qwen-oauth"]>>;
    agents: z.ZodOptional<z.ZodArray<z.ZodType<SubagentConfig, z.ZodTypeDef, SubagentConfig>, "many">>;
    includePartialMessages: z.ZodOptional<z.ZodBoolean>;
    timeout: z.ZodOptional<z.ZodObject<{
        canUseTool: z.ZodOptional<z.ZodNumber>;
        mcpRequest: z.ZodOptional<z.ZodNumber>;
        controlRequest: z.ZodOptional<z.ZodNumber>;
        streamClose: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        canUseTool?: number | undefined;
        mcpRequest?: number | undefined;
        controlRequest?: number | undefined;
        streamClose?: number | undefined;
    }, {
        canUseTool?: number | undefined;
        mcpRequest?: number | undefined;
        controlRequest?: number | undefined;
        streamClose?: number | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    stderr?: ((message: string) => void) | undefined;
    debug?: boolean | undefined;
    env?: Record<string, string> | undefined;
    timeout?: {
        canUseTool?: number | undefined;
        mcpRequest?: number | undefined;
        controlRequest?: number | undefined;
        streamClose?: number | undefined;
    } | undefined;
    authType?: "openai" | "qwen-oauth" | undefined;
    model?: string | undefined;
    cwd?: string | undefined;
    agents?: SubagentConfig[] | undefined;
    excludeTools?: string[] | undefined;
    allowedTools?: string[] | undefined;
    mcpServers?: Record<string, {
        description?: string | undefined;
        args?: string[] | undefined;
        command?: string | undefined;
        url?: string | undefined;
        env?: Record<string, string> | undefined;
        timeout?: number | undefined;
        headers?: Record<string, string> | undefined;
        cwd?: string | undefined;
        httpUrl?: string | undefined;
        targetAudience?: string | undefined;
        includeTools?: string[] | undefined;
        excludeTools?: string[] | undefined;
        trust?: boolean | undefined;
        tcp?: string | undefined;
        extensionName?: string | undefined;
        oauth?: {
            enabled?: boolean | undefined;
            scopes?: string[] | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            redirectUri?: string | undefined;
            tokenUrl?: string | undefined;
            authorizationUrl?: string | undefined;
            audiences?: string[] | undefined;
            tokenParamName?: string | undefined;
            registrationUrl?: string | undefined;
        } | undefined;
        authProviderType?: "service_account_impersonation" | "dynamic_discovery" | "google_credentials" | undefined;
        targetServiceAccount?: string | undefined;
    } | {
        type: "sdk";
        name: string;
        instance: {
            connect(transport: unknown): Promise<void>;
            close(): Promise<void>;
        };
    }> | undefined;
    maxSessionTurns?: number | undefined;
    coreTools?: string[] | undefined;
    includePartialMessages?: boolean | undefined;
    abortController?: AbortController | undefined;
    canUseTool?: CanUseTool | undefined;
    pathToQwenExecutable?: string | undefined;
    permissionMode?: "default" | "yolo" | "auto-edit" | "plan" | undefined;
    logLevel?: "error" | "debug" | "info" | "warn" | undefined;
}, {
    stderr?: ((message: string) => void) | undefined;
    debug?: boolean | undefined;
    env?: Record<string, string> | undefined;
    timeout?: {
        canUseTool?: number | undefined;
        mcpRequest?: number | undefined;
        controlRequest?: number | undefined;
        streamClose?: number | undefined;
    } | undefined;
    authType?: "openai" | "qwen-oauth" | undefined;
    model?: string | undefined;
    cwd?: string | undefined;
    agents?: SubagentConfig[] | undefined;
    excludeTools?: string[] | undefined;
    allowedTools?: string[] | undefined;
    mcpServers?: Record<string, {
        description?: string | undefined;
        args?: string[] | undefined;
        command?: string | undefined;
        url?: string | undefined;
        env?: Record<string, string> | undefined;
        timeout?: number | undefined;
        headers?: Record<string, string> | undefined;
        cwd?: string | undefined;
        httpUrl?: string | undefined;
        targetAudience?: string | undefined;
        includeTools?: string[] | undefined;
        excludeTools?: string[] | undefined;
        trust?: boolean | undefined;
        tcp?: string | undefined;
        extensionName?: string | undefined;
        oauth?: {
            enabled?: boolean | undefined;
            scopes?: string[] | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            redirectUri?: string | undefined;
            tokenUrl?: string | undefined;
            authorizationUrl?: string | undefined;
            audiences?: string[] | undefined;
            tokenParamName?: string | undefined;
            registrationUrl?: string | undefined;
        } | undefined;
        authProviderType?: "service_account_impersonation" | "dynamic_discovery" | "google_credentials" | undefined;
        targetServiceAccount?: string | undefined;
    } | {
        type: "sdk";
        name: string;
        instance: {
            connect(transport: unknown): Promise<void>;
            close(): Promise<void>;
        };
    }> | undefined;
    maxSessionTurns?: number | undefined;
    coreTools?: string[] | undefined;
    includePartialMessages?: boolean | undefined;
    abortController?: AbortController | undefined;
    canUseTool?: CanUseTool | undefined;
    pathToQwenExecutable?: string | undefined;
    permissionMode?: "default" | "yolo" | "auto-edit" | "plan" | undefined;
    logLevel?: "error" | "debug" | "info" | "warn" | undefined;
}>;
