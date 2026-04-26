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
import { createImageService } from './assetImageService.js';
import { createVideoService, FrameExtractionService, } from './assetVideoService.js';
import { createAudioService, AudioRenderService, } from './assetAudioService.js';
import { resolveProviderConfig, } from './providerConfig.js';
// ============== Per-provider model defaults ==============
//
// These are only used as the *editing* / *secondary* model name for
// providers that need a separate model id for image-edit vs. image-gen.
// The PRIMARY model name comes from `resolveProviderConfig` so users can
// override it via env or settings.
const IMAGE_EDIT_DEFAULTS = {
    tongyi: 'wanx2.1-imageedit',
    doubao: 'doubao-seedream-4-0-250828',
    'openai-compat': undefined, // falls back to the same gen model
    // Gemini's Imagen endpoint is text-to-image only; the service falls back
    // to a fresh text-to-image call for "edits", matching openai-compat.
    gemini: undefined,
};
const VIDEO_T2V_DEFAULTS = {
    tongyi: 'wan2.5-t2v-preview',
    doubao: 'doubao-seedance-1-0-pro-250528',
    'openai-compat': undefined,
    // No stable public Gemini T2V surface; the video service surfaces an
    // actionable error when actually invoked.
    gemini: undefined,
};
// ============== Model Router ==============
export class ModelRouter {
    imageService;
    videoService;
    audioService;
    frameExtractionService;
    audioRenderService;
    /** Resolved configuration that produced this router. Useful for logging. */
    imageConfig;
    videoConfig;
    audioConfig;
    constructor(options) {
        this.imageConfig = options.imageConfig;
        this.videoConfig = options.videoConfig;
        this.audioConfig = options.audioConfig;
        const imageModelConfig = {
            apiKey: this.imageConfig.apiKey,
            baseUrl: this.imageConfig.baseUrl,
            modelType: this.imageConfig.provider,
            modelNameGeneration: this.imageConfig.model,
            modelNameEditing: IMAGE_EDIT_DEFAULTS[this.imageConfig.provider] ??
                this.imageConfig.model,
        };
        this.imageService = createImageService(imageModelConfig);
        if (this.videoConfig) {
            const videoModelConfig = {
                apiKey: this.videoConfig.apiKey,
                baseUrl: this.videoConfig.baseUrl,
                modelType: this.videoConfig.provider,
                modelNameVideo: this.videoConfig.model,
                modelNameVideoText: VIDEO_T2V_DEFAULTS[this.videoConfig.provider] ??
                    this.videoConfig.model,
            };
            this.videoService = createVideoService(videoModelConfig);
        }
        else {
            this.videoService = createDisabledVideoService();
        }
        if (this.audioConfig) {
            const audioModelConfig = {
                apiKey: this.audioConfig.apiKey,
                baseUrl: this.audioConfig.baseUrl,
                modelType: this.audioConfig.provider,
                modelNameChat: this.audioConfig.model,
            };
            this.audioService = createAudioService(audioModelConfig);
        }
        else {
            this.audioService = createDisabledAudioService();
        }
        this.frameExtractionService = new FrameExtractionService();
        this.audioRenderService = new AudioRenderService();
    }
    // ============== Image Operations ==============
    async generateImage(prompt, size = '1024*1024') {
        console.log(`[ModelRouter] Routing image generation to ${this.imageConfig.provider}`);
        return this.imageService.generateImage(prompt, size);
    }
    async editImage(referenceImageUrl, prompt, previousFrameUrl) {
        console.log(`[ModelRouter] Routing image editing to ${this.imageConfig.provider}`);
        return this.imageService.editImage(referenceImageUrl, prompt, previousFrameUrl);
    }
    // ============== Video Operations ==============
    async generateVideo(baseImageUrl, prompt, resolution = '480P') {
        console.log(`[ModelRouter] Routing video generation to ${this.videoConfig?.provider ?? 'disabled'}`);
        return this.videoService.generateVideo(baseImageUrl, prompt, resolution);
    }
    async generateVideoFromText(prompt, resolution = '720P') {
        console.log(`[ModelRouter] Routing text-to-video generation to ${this.videoConfig?.provider ?? 'disabled'}`);
        return this.videoService.generateVideoFromText(prompt, resolution);
    }
    // ============== Audio Operations ==============
    async generateABC(request) {
        console.log(`[ModelRouter] Routing ABC generation to ${this.audioConfig?.provider ?? 'disabled'}`);
        return this.audioService.generateABC(request);
    }
    async generateAudioFromABC(abcNotation, type = 'bgm', durationSeconds = 5) {
        console.log(`[ModelRouter] Converting ABC notation to WAV (${type})...`);
        return this.audioRenderService.generateFromABC(abcNotation, type, durationSeconds);
    }
    async isSymusicAvailable() {
        return this.audioRenderService.isSymusicAvailable();
    }
    async generatePlaceholderAudio(durationSeconds = 1, type = 'sfx') {
        console.log(`[ModelRouter] Generating local ${type} audio (${durationSeconds}s)`);
        return this.audioRenderService.generateGameAudio(durationSeconds, type);
    }
    // ============== Getters ==============
    /**
     * Backwards-compatible alias. Returns the IMAGE provider name, since
     * almost all callers used `getModelType()` to log what they were
     * routing image calls to.
     */
    getModelType() {
        return this.imageConfig.provider;
    }
    getImageService() {
        return this.imageService;
    }
    getVideoService() {
        return this.videoService;
    }
    getAudioService() {
        return this.audioService;
    }
}
// ============== Disabled-modality stubs ==============
//
// When the user hasn't configured a video/audio provider we still hand
// the asset tool a router so its other code paths keep working. These
// stubs throw the same MissingProviderConfigError-style message the
// resolver would have raised, but only when the disabled modality is
// actually used.
function createDisabledVideoService() {
    const fail = () => {
        throw new Error('OpenGame video generation is not configured. Set OPENGAME_VIDEO_PROVIDER, ' +
            'OPENGAME_VIDEO_API_KEY (and OPENGAME_VIDEO_MODEL for openai-compat), or add ' +
            '"openGame.providers.video" to your settings.json. ' +
            'See docs/users/configuration/api-keys.md.');
    };
    return {
        generateVideo: () => fail(),
        generateVideoFromText: () => fail(),
    };
}
function createDisabledAudioService() {
    const fail = () => {
        throw new Error('OpenGame audio generation is not configured. Set OPENGAME_AUDIO_PROVIDER and ' +
            'OPENGAME_AUDIO_API_KEY, or add "openGame.providers.audio" to your settings.json. ' +
            'See docs/users/configuration/api-keys.md.');
    };
    return {
        generateABC: () => fail(),
    };
}
// ============== Factory Function ==============
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
export function createModelRouter(options = {}) {
    const { providers, modelType } = options;
    // If the caller passed a legacy `modelType`, fold it into the providers
    // hint for any modality that doesn't already have an explicit provider.
    const merged = providers ? { ...providers } : {};
    if (modelType) {
        for (const m of ['image', 'video', 'audio']) {
            const existing = merged[m] ?? {};
            merged[m] = { ...existing, provider: existing.provider ?? modelType };
        }
    }
    const imageConfig = resolveProviderConfig('image', merged);
    // Video and audio are best-effort: if unconfigured, we let the user run
    // image-only flows. We use a try/catch rather than tryResolveProviderConfig
    // so a misconfiguration (e.g. provider set but key missing) still surfaces.
    let videoConfig;
    try {
        videoConfig = resolveProviderConfig('video', merged);
    }
    catch (error) {
        // Fall back to the image config ONLY when the user explicitly opted in
        // via legacy IMAGE_MODEL_API_KEY (i.e. when no per-modality video
        // settings exist at all). Otherwise leave it disabled and let the
        // stub raise on first use.
        if (!merged.video?.provider &&
            !process.env['OPENGAME_VIDEO_PROVIDER'] &&
            !process.env['OPENGAME_VIDEO_API_KEY']) {
            videoConfig = undefined;
        }
        else {
            throw error;
        }
    }
    let audioConfig;
    try {
        audioConfig = resolveProviderConfig('audio', merged);
    }
    catch (error) {
        if (!merged.audio?.provider &&
            !process.env['OPENGAME_AUDIO_PROVIDER'] &&
            !process.env['OPENGAME_AUDIO_API_KEY']) {
            audioConfig = undefined;
        }
        else {
            throw error;
        }
    }
    return new ModelRouter({ imageConfig, videoConfig, audioConfig });
}
//# sourceMappingURL=assetModelRouter.js.map