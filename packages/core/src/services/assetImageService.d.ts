/**
 * Image Generation Service
 * Supports Tongyi and Doubao models
 * Inspired by PiXelDa's model architecture
 */
import { BaseService } from './assetBaseService.js';
import type { ImageModelConfig } from '../tools/generate-assets-types.js';
export declare class TongyiImageService extends BaseService {
    private config;
    constructor(config: ImageModelConfig);
    private isAsyncModel;
    generateImage(prompt: string, size?: string): Promise<string>;
    private generateImageAsync;
    private generateImageSync;
    private isWanxEditModel;
    editImage(referenceImageUrl: string, prompt: string, previousFrameUrl?: string | null): Promise<string>;
    private editImageWanx;
    private editImageI2I;
    private imageUrlToBase64;
}
export declare class DoubaoImageService extends BaseService {
    private config;
    private arkBaseUrl;
    constructor(config: ImageModelConfig);
    generateImage(prompt: string, size?: string): Promise<string>;
    editImage(imageUrl: string, prompt: string, _previousFrameUrl?: string | null): Promise<string>;
}
export declare class OpenAICompatImageService extends BaseService {
    private config;
    constructor(config: ImageModelConfig);
    generateImage(prompt: string, size?: string): Promise<string>;
    editImage(referenceImageUrl: string, prompt: string, _previousFrameUrl?: string | null): Promise<string>;
}
/**
 * Image generation via Google Gemini's Imagen endpoint.
 *
 * Endpoint shape (Google AI Studio):
 *   POST {baseUrl}/models/{model}:predict?key={API_KEY}
 *   body  { instances: [{ prompt }], parameters: { sampleCount, aspectRatio } }
 *   resp  { predictions: [{ bytesBase64Encoded: "..." }] }
 *
 * Imagen does not currently expose an image-edit endpoint in the Gemini
 * API (only Vertex AI does, via a different auth model), so `editImage`
 * falls back to a fresh text-to-image call. This matches what the
 * OpenAI-compat service does for the same case.
 */
export declare class GeminiImageService extends BaseService {
    private config;
    constructor(config: ImageModelConfig);
    /**
     * Convert OpenGame's `W*H` size hints into the nearest aspect ratio that
     * Imagen supports. Imagen's Gemini API only accepts a small enum
     * (`1:1`, `9:16`, `16:9`, `3:4`, `4:3`), so we snap.
     */
    private sizeToAspectRatio;
    generateImage(prompt: string, size?: string): Promise<string>;
    editImage(_referenceImageUrl: string, prompt: string, _previousFrameUrl?: string | null): Promise<string>;
}
export interface IImageService {
    generateImage(prompt: string, size?: string): Promise<string>;
    editImage(referenceImageUrl: string, prompt: string, previousFrameUrl?: string | null): Promise<string>;
}
export declare function createImageService(config: ImageModelConfig): IImageService;
