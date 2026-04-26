/**
 * @license
 * Copyright 2025 OpenGame Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Central, modality-aware provider resolver for OpenGame.
 *
 * OpenGame talks to four kinds of external generative APIs:
 *   - reasoning : a chat/code LLM used for game-design reasoning (GDD,
 *                 archetype classification, ABC notation generation).
 *   - image     : text-to-image and image-edit (sprites, backgrounds, tiles).
 *   - video     : image-to-video and text-to-video (used for animation
 *                 frames and as a source for audio extraction).
 *   - audio     : text-to-audio. In practice OpenGame renders music locally
 *                 from ABC notation (via the `reasoning` provider), or
 *                 extracts audio from a generated video, so an explicit
 *                 audio provider is usually optional.
 *
 * Each modality is configured INDEPENDENTLY so users can mix providers
 * (e.g. DashScope/Tongyi for image, Doubao for video, OpenAI-compat for
 * reasoning).
 *
 * Resolution order, highest priority first:
 *   1. Explicit per-modality environment variables
 *      (OPENGAME_<MOD>_PROVIDER / _API_KEY / _BASE_URL / _MODEL).
 *   2. The `openGame.providers.<mod>` block in ~/.qwen/settings.json
 *      (passed in via the `fromConfig` argument).
 *   3. Legacy environment variables inherited from the upstream code
 *      (DASHSCOPE_API_KEY, IMAGE_MODEL_API_KEY, REASONING_MODEL_API_KEY,
 *      etc.) — kept for backward compatibility, may be removed in a
 *      future release.
 *   4. If none of the above provide a key, throw a `MissingProviderConfigError`
 *      with an actionable message pointing at docs/users/configuration/api-keys.md.
 */
export type Modality = 'reasoning' | 'image' | 'video' | 'audio';
export type ProviderName = 'tongyi' | 'doubao' | 'openai-compat' | 'gemini';
export interface ResolvedProviderConfig {
    /** Which provider family this modality talks to. */
    provider: ProviderName;
    /** Bearer token sent to the provider. */
    apiKey: string;
    /** Base URL for the provider (already free of trailing slashes). */
    baseUrl: string;
    /**
     * Default model name for this modality. Tools may override this when the
     * user explicitly passes a different model in their request.
     */
    model: string;
}
/**
 * Optional per-modality configuration block sourced from settings.json.
 * The shape mirrors the env vars below so the two paths are interchangeable.
 */
export interface ProviderSettingsBlock {
    provider?: ProviderName;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
}
export interface OpenGameProvidersSettings {
    reasoning?: ProviderSettingsBlock;
    image?: ProviderSettingsBlock;
    video?: ProviderSettingsBlock;
    audio?: ProviderSettingsBlock;
}
/**
 * Thrown when no key/provider can be resolved for a modality. Tools should
 * let this bubble up to the user — it carries an actionable message.
 */
export declare class MissingProviderConfigError extends Error {
    readonly modality: Modality;
    readonly hint: string;
    constructor(modality: Modality, hint: string);
}
/**
 * Resolve the provider configuration for a single modality. Throws
 * `MissingProviderConfigError` if no key is available.
 */
export declare function resolveProviderConfig(modality: Modality, fromConfig?: OpenGameProvidersSettings, env?: NodeJS.ProcessEnv): ResolvedProviderConfig;
/**
 * Like `resolveProviderConfig` but returns `undefined` instead of throwing
 * when configuration is missing. Useful for code paths that want to
 * gracefully degrade (e.g. asset generation falling back to placeholders).
 */
export declare function tryResolveProviderConfig(modality: Modality, fromConfig?: OpenGameProvidersSettings, env?: NodeJS.ProcessEnv): ResolvedProviderConfig | undefined;
export type ProviderConfigSource = 'env' | 'settings' | 'legacy-env';
export interface ProviderStatus {
    modality: Modality;
    configured: boolean;
    provider?: ProviderName;
    baseUrl?: string;
    model?: string;
    /** Where the resolved config primarily came from. */
    source?: ProviderConfigSource;
    /** Actionable, multi-line hint when `configured` is false. */
    missingHint?: string;
}
export declare const ALL_MODALITIES: readonly Modality[];
/**
 * Inspect a single modality and report whether it is configured. Never
 * throws — missing config is reported via `configured: false` and a
 * `missingHint` message that can be shown directly to the user.
 *
 * The returned object never contains the API key itself, so it is safe
 * to log or render in the UI.
 */
export declare function getProviderStatus(modality: Modality, fromConfig?: OpenGameProvidersSettings, env?: NodeJS.ProcessEnv): ProviderStatus;
/** Convenience: status for every modality, in display order. */
export declare function getAllProvidersStatus(fromConfig?: OpenGameProvidersSettings, env?: NodeJS.ProcessEnv): ProviderStatus[];
