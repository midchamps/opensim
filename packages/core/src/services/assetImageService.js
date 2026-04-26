/**
 * Image Generation Service
 * Supports Tongyi and Doubao models
 * Inspired by PiXelDa's model architecture
 */
import { BaseService } from './assetBaseService.js';
// ============== Tongyi Image Service ==============
export class TongyiImageService extends BaseService {
    config;
    constructor(config) {
        super();
        this.config = config;
    }
    isAsyncModel(modelName) {
        return modelName.includes('wan') && modelName.includes('t2i');
    }
    async generateImage(prompt, size = '1024*1024') {
        this.log(`Generating image with Tongyi: ${prompt.substring(0, 50)}...`);
        const modelName = this.config.modelNameGeneration;
        if (this.isAsyncModel(modelName)) {
            return this.generateImageAsync(prompt, size);
        }
        else {
            return this.generateImageSync(prompt, size);
        }
    }
    async generateImageAsync(prompt, size) {
        const url = `${this.config.baseUrl}/api/v1/services/aigc/text2image/image-synthesis`;
        const payload = {
            model: this.config.modelNameGeneration,
            input: {
                prompt,
                negative_prompt: '',
            },
            parameters: {
                prompt_extend: false,
                size,
                n: 1,
            },
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
                'X-DashScope-Async': 'enable',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Tongyi Image API failed: ${response.status} - ${errorBody}`);
        }
        const taskData = (await response.json());
        const taskId = taskData.output?.task_id;
        if (!taskId) {
            throw new Error('Tongyi text2image returned no task ID');
        }
        this.log(`Created async task: ${taskId}`);
        const taskUrl = `${this.config.baseUrl}/api/v1/tasks/${taskId}`;
        const result = await this.pollTaskStatus(taskUrl, {
            Authorization: `Bearer ${this.config.apiKey}`,
        });
        const resultUrl = result.output?.results?.[0]?.url;
        if (!resultUrl) {
            throw new Error('Tongyi text2image task completed but no URL returned');
        }
        this.log(`Image generated successfully`);
        return resultUrl;
    }
    async generateImageSync(prompt, size) {
        const url = `${this.config.baseUrl}/api/v1/services/aigc/multimodal-generation/generation`;
        const payload = {
            model: this.config.modelNameGeneration,
            input: {
                messages: [
                    {
                        role: 'user',
                        content: [{ text: prompt }],
                    },
                ],
            },
            parameters: {
                prompt_extend: false,
                size,
            },
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Tongyi Image API failed: ${response.status} - ${errorBody}`);
        }
        const data = (await response.json());
        const choices = data.output?.choices;
        if (!choices || choices.length === 0) {
            throw new Error('Tongyi returned no choices');
        }
        const content = choices[0].message?.content;
        if (!content || !Array.isArray(content)) {
            throw new Error('Tongyi content format error');
        }
        const imageItem = content.find((item) => item.image);
        if (!imageItem || !imageItem.image) {
            throw new Error('Tongyi response missing image URL');
        }
        this.log(`Image generated successfully`);
        return imageItem.image;
    }
    isWanxEditModel(modelName) {
        return modelName.includes('wanx') && modelName.includes('imageedit');
    }
    async editImage(referenceImageUrl, prompt, previousFrameUrl) {
        this.log(`Editing image with Tongyi I2I...`);
        const modelName = this.config.modelNameEditing;
        if (this.isWanxEditModel(modelName)) {
            return this.editImageWanx(referenceImageUrl, prompt);
        }
        else {
            return this.editImageI2I(referenceImageUrl, prompt, previousFrameUrl);
        }
    }
    async editImageWanx(referenceImageUrl, prompt) {
        const url = `${this.config.baseUrl}/api/v1/services/aigc/text2image/image-synthesis`;
        // Convert URL to Base64 to avoid "url error" issues with cross-region OSS
        const base64Image = await this.imageUrlToBase64(referenceImageUrl);
        const payload = {
            model: this.config.modelNameEditing,
            input: {
                prompt,
                negative_prompt: '',
                function: 'description_edit',
                base_image_url: base64Image,
            },
            parameters: {
                prompt_extend: false,
                n: 1,
                size: '1024*1024',
            },
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
                'X-DashScope-Async': 'enable',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Tongyi wanx edit API failed: ${response.status} - ${errorBody}`);
        }
        const taskData = (await response.json());
        const taskId = taskData.output?.task_id;
        if (!taskId) {
            throw new Error('Tongyi wanx edit returned no task ID');
        }
        this.log(`Created wanx edit task: ${taskId}`);
        const taskUrl = `${this.config.baseUrl}/api/v1/tasks/${taskId}`;
        const result = await this.pollTaskStatus(taskUrl, {
            Authorization: `Bearer ${this.config.apiKey}`,
        });
        const resultUrl = result.output?.results?.[0]?.url;
        if (!resultUrl) {
            throw new Error('Tongyi wanx edit task completed but no URL returned');
        }
        this.log(`Image editing completed`);
        return resultUrl;
    }
    async editImageI2I(referenceImageUrl, prompt, previousFrameUrl) {
        const url = `${this.config.baseUrl}/api/v1/services/aigc/image2image/image-synthesis`;
        const images = previousFrameUrl
            ? [referenceImageUrl, previousFrameUrl]
            : [referenceImageUrl];
        const payload = {
            model: this.config.modelNameEditing,
            input: {
                prompt,
                images,
            },
            parameters: {
                prompt_extend: false,
                n: 1,
            },
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
                'X-DashScope-Async': 'enable',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Tongyi I2I API failed: ${response.status} - ${errorBody}`);
        }
        const taskData = (await response.json());
        const taskId = taskData.output?.task_id;
        if (!taskId) {
            throw new Error('Tongyi I2I returned no task ID');
        }
        const taskUrl = `${this.config.baseUrl}/api/v1/tasks/${taskId}`;
        const result = await this.pollTaskStatus(taskUrl, {
            Authorization: `Bearer ${this.config.apiKey}`,
        });
        const resultUrl = result.output?.results?.[0]?.url;
        if (!resultUrl) {
            throw new Error('Tongyi I2I task completed but no URL returned');
        }
        this.log(`Image editing completed`);
        return resultUrl;
    }
    async imageUrlToBase64(imageUrl) {
        this.log(`Downloading image for Base64 conversion: ${imageUrl.substring(0, 50)}...`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';
        return `data:${contentType};base64,${base64}`;
    }
}
// ============== Doubao Image Service ==============
export class DoubaoImageService extends BaseService {
    config;
    arkBaseUrl;
    constructor(config) {
        super();
        this.config = config;
        // Allow the user to override the Volcengine ARK base URL (e.g. for
        // a regional endpoint or a self-hosted proxy). Falls back to the
        // public Beijing endpoint that ships with the original implementation.
        this.arkBaseUrl =
            config.baseUrl && config.baseUrl.length > 0
                ? config.baseUrl
                : 'https://ark.cn-beijing.volces.com/api/v3';
    }
    async generateImage(prompt, size = '1024x1024') {
        this.log(`Generating image with Doubao: ${prompt.substring(0, 50)}...`);
        const url = `${this.arkBaseUrl}/images/generations`;
        const normalizedSize = size.replace('*', 'x');
        const payload = {
            model: this.config.modelNameGeneration,
            prompt,
            size: normalizedSize,
            watermark: false,
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Doubao Image API failed: ${response.status} - ${errorBody}`);
        }
        const data = (await response.json());
        if (!data.data || data.data.length === 0) {
            throw new Error('Doubao returned no results');
        }
        const resultUrl = data.data[0].url;
        if (!resultUrl) {
            throw new Error('Doubao returned a result without a URL');
        }
        this.log(`Image generated successfully`);
        return resultUrl;
    }
    async editImage(imageUrl, prompt, _previousFrameUrl) {
        this.log(`Editing image with Doubao...`);
        const url = `${this.arkBaseUrl}/images/edits`;
        const payload = {
            model: this.config.modelNameEditing || this.config.modelNameGeneration,
            prompt,
            image: imageUrl,
            size: '1024x1024',
            watermark: false,
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Doubao Edit API failed: ${response.status} - ${errorBody}`);
        }
        const data = (await response.json());
        if (!data.data || data.data.length === 0) {
            throw new Error('Doubao edit returned no results');
        }
        const resultUrl = data.data[0].url;
        if (!resultUrl) {
            throw new Error('Doubao edit returned a result without a URL');
        }
        this.log(`Image editing completed`);
        return resultUrl;
    }
}
// ============== OpenAI-Compatible Image Service ==============
//
// Talks to any endpoint that implements the OpenAI Images REST shape:
//   POST {baseUrl}/images/generations  { model, prompt, size, n }
//   POST {baseUrl}/images/edits        (multipart) { model, prompt, image }
//
// This covers the official OpenAI API (DALL-E / gpt-image-1), Stability
// proxies, fal.ai's OpenAI shim, OpenRouter image routes, Together.ai's
// image endpoints, etc. Sizes are passed through as-is (callers should
// use that provider's native vocabulary, e.g. "1024x1024").
export class OpenAICompatImageService extends BaseService {
    config;
    constructor(config) {
        super();
        this.config = config;
    }
    async generateImage(prompt, size = '1024x1024') {
        this.log(`Generating image via OpenAI-compat: ${prompt.substring(0, 50)}...`);
        const url = `${this.config.baseUrl}/images/generations`;
        const normalizedSize = size.replace('*', 'x');
        const payload = {
            model: this.config.modelNameGeneration,
            prompt,
            size: normalizedSize,
            n: 1,
            response_format: 'url',
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI-compat image API failed: ${response.status} - ${errorBody}`);
        }
        const data = (await response.json());
        const item = data.data?.[0];
        if (!item) {
            throw new Error('OpenAI-compat image API returned no results');
        }
        if (item.url) {
            return item.url;
        }
        if (item.b64_json) {
            // Surface base64 results as a data URL so downstream code can consume
            // them with the same `fetch(url)` it uses for hosted images.
            return `data:image/png;base64,${item.b64_json}`;
        }
        throw new Error('OpenAI-compat image API returned neither url nor b64_json');
    }
    async editImage(referenceImageUrl, prompt, _previousFrameUrl) {
        // The OpenAI image-edit endpoint only takes a single reference image
        // and uses multipart/form-data, which adds non-trivial complexity.
        // For now we fall back to a fresh generation that includes the prompt
        // — most callers (e.g. animation frames) only need style consistency
        // via the prompt rather than a true image-conditioned edit. Users who
        // need real I2I should select a Tongyi or Doubao provider for image.
        this.log('OpenAI-compat editImage falls back to plain text-to-image; use tongyi/doubao for true I2I.', 'warn');
        return this.generateImage(`${prompt} (matching reference style)`);
    }
}
// ============== Gemini (Imagen) Image Service ==============
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
export class GeminiImageService extends BaseService {
    config;
    constructor(config) {
        super();
        this.config = config;
    }
    /**
     * Convert OpenGame's `W*H` size hints into the nearest aspect ratio that
     * Imagen supports. Imagen's Gemini API only accepts a small enum
     * (`1:1`, `9:16`, `16:9`, `3:4`, `4:3`), so we snap.
     */
    sizeToAspectRatio(size) {
        const match = size.match(/^(\d+)\s*[*x]\s*(\d+)$/);
        if (!match)
            return '1:1';
        const w = Number(match[1]);
        const h = Number(match[2]);
        if (!w || !h)
            return '1:1';
        const ratio = w / h;
        const candidates = [
            ['1:1', 1],
            ['9:16', 9 / 16],
            ['16:9', 16 / 9],
            ['3:4', 3 / 4],
            ['4:3', 4 / 3],
        ];
        let best = candidates[0];
        let bestDiff = Math.abs(Math.log(ratio / best[1]));
        for (const cand of candidates.slice(1)) {
            const diff = Math.abs(Math.log(ratio / cand[1]));
            if (diff < bestDiff) {
                best = cand;
                bestDiff = diff;
            }
        }
        return best[0];
    }
    async generateImage(prompt, size = '1024*1024') {
        this.log(`Generating image via Gemini/Imagen: ${prompt.substring(0, 50)}...`);
        const model = this.config.modelNameGeneration;
        // `key` goes in the query string per the Gemini API convention;
        // Imagen does NOT accept Authorization: Bearer here.
        const url = `${this.config.baseUrl}/models/${encodeURIComponent(model)}:predict` +
            `?key=${encodeURIComponent(this.config.apiKey)}`;
        const payload = {
            instances: [{ prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: this.sizeToAspectRatio(size),
            },
        };
        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini Imagen API failed: ${response.status} - ${errorBody}`);
        }
        const data = (await response.json());
        const prediction = data.predictions?.[0];
        const b64 = prediction?.bytesBase64Encoded;
        if (!b64) {
            throw new Error('Gemini Imagen API returned no bytesBase64Encoded in predictions');
        }
        const mime = prediction?.mimeType || 'image/png';
        // Return as a data URL so the downstream pipeline (which already knows
        // how to `fetch()` both URLs and data: URIs) consumes it uniformly.
        return `data:${mime};base64,${b64}`;
    }
    async editImage(_referenceImageUrl, prompt, _previousFrameUrl) {
        // Imagen's Gemini API surface is text-to-image only. Fresh generation
        // using the same style prompt is the closest we can get without
        // switching to Vertex AI (different auth).
        this.log('Gemini editImage falls back to plain text-to-image; use tongyi/doubao for true I2I.', 'warn');
        return this.generateImage(`${prompt} (matching reference style)`);
    }
}
// ============== Factory ==============
export function createImageService(config) {
    switch (config.modelType) {
        case 'doubao':
            return new DoubaoImageService(config);
        case 'openai-compat':
            return new OpenAICompatImageService(config);
        case 'gemini':
            return new GeminiImageService(config);
        case 'tongyi':
        default:
            return new TongyiImageService(config);
    }
}
//# sourceMappingURL=assetImageService.js.map