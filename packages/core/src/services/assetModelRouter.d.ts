/**
 * Asset Model Router
 *
 * Routes image / video / audio asset-generation calls to the appropriate
 * provider implementation. Each modality is configured INDEPENDENTLY via
 * `resolveProviderConfig`, so users can freely mix providers (e.g.
 * Tongyi for image, Doubao for video, OpenAI-compat for audio).
 *
 * The router used to read a single `IMAGE_MODEL_API_KEY` and apply it to
 * every modality; that's been replaced with explicit per-modality
 * resolution.  See `providerConfig.ts` for the env-var matrix and the
 * settings.json schema.
 */
import { type IImageService } from './assetImageService.js';
import { type IVideoService } from './assetVideoService.js';
import { type IAudioService } from './assetAudioService.js';
import type { AudioRequest } from '../tools/generate-assets-types.js';
import { type OpenGameProvidersSettings, type ResolvedProviderConfig } from './providerConfig.js';
export declare class ModelRouter {
    private imageService;
    private videoService;
    private audioService;
    private frameExtractionService;
    private audioRenderService;
    /** Resolved configuration that produced this router. Useful for logging. */
    readonly imageConfig: ResolvedProviderConfig;
    readonly videoConfig: ResolvedProviderConfig | undefined;
    readonly audioConfig: ResolvedProviderConfig | undefined;
    constructor(options: {
        imageConfig: ResolvedProviderConfig;
        videoConfig?: ResolvedProviderConfig;
        audioConfig?: ResolvedProviderConfig;
    });
    generateImage(prompt: string, size?: string): Promise<string>;
    editImage(referenceImageUrl: string, prompt: string, previousFrameUrl?: string | null): Promise<string>;
    generateVideo(baseImageUrl: string, prompt: string, resolution?: string): Promise<{
        videoUrl: string;
        taskId: string;
    }>;
    generateVideoFromText(prompt: string, resolution?: string): Promise<{
        videoUrl: string;
        taskId: string;
    }>;
    generateABC(request: AudioRequest): Promise<string>;
    generateAudioFromABC(abcNotation: string, type?: 'sfx' | 'bgm', durationSeconds?: number): Promise<Buffer>;
    isSymusicAvailable(): Promise<boolean>;
    generatePlaceholderAudio(durationSeconds?: number, type?: 'sfx' | 'bgm'): Promise<Buffer>;
    /**
     * Backwards-compatible alias. Returns the IMAGE provider name, since
     * almost all callers used `getModelType()` to log what they were
     * routing image calls to.
     */
    getModelType(): string;
    getImageService(): IImageService;
    getVideoService(): IVideoService;
    getAudioService(): IAudioService;
}
/**
 * Build a ModelRouter from environment + (optional) settings.json. The
 * IMAGE modality is mandatory because every asset request (background,
 * sprite, animation base frame, tileset) starts with an image call. The
 * VIDEO and AUDIO modalities are optional — if unconfigured, the
 * corresponding code paths throw an actionable error only when actually
 * invoked, so users without a video key can still generate static
 * sprites and backgrounds.
 *
 * The legacy `modelType` option is honored as a hint only when the user
 * hasn't already set `OPENGAME_IMAGE_PROVIDER`, for backward compat with
 * the original `model_type` parameter on the GenerateAssetsTool.
 */
export declare function createModelRouter(options?: {
    modelType?: 'tongyi' | 'doubao' | 'openai-compat' | 'gemini';
    providers?: OpenGameProvidersSettings;
}): ModelRouter;
