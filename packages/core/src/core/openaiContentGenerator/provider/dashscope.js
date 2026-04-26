import OpenAI from 'openai';
import { AuthType } from '../../contentGenerator.js';
import { DEFAULT_TIMEOUT, DEFAULT_MAX_RETRIES, DEFAULT_DASHSCOPE_BASE_URL, } from '../constants.js';
import { tokenLimit } from '../../tokenLimits.js';
export class DashScopeOpenAICompatibleProvider {
    contentGeneratorConfig;
    cliConfig;
    constructor(contentGeneratorConfig, cliConfig) {
        this.cliConfig = cliConfig;
        this.contentGeneratorConfig = contentGeneratorConfig;
    }
    static isDashScopeProvider(contentGeneratorConfig) {
        const authType = contentGeneratorConfig.authType;
        const baseUrl = contentGeneratorConfig.baseUrl;
        return (authType === AuthType.QWEN_OAUTH ||
            baseUrl === 'https://dashscope.aliyuncs.com/compatible-mode/v1' ||
            baseUrl === 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1' ||
            !baseUrl);
    }
    buildHeaders() {
        const version = this.cliConfig.getCliVersion() || 'unknown';
        const userAgent = `QwenCode/${version} (${process.platform}; ${process.arch})`;
        const { authType } = this.contentGeneratorConfig;
        return {
            'User-Agent': userAgent,
            'X-DashScope-CacheControl': 'enable',
            'X-DashScope-UserAgent': userAgent,
            'X-DashScope-AuthType': authType,
        };
    }
    buildClient() {
        const { apiKey, baseUrl = DEFAULT_DASHSCOPE_BASE_URL, timeout = DEFAULT_TIMEOUT, maxRetries = DEFAULT_MAX_RETRIES, } = this.contentGeneratorConfig;
        const defaultHeaders = this.buildHeaders();
        return new OpenAI({
            apiKey,
            baseURL: baseUrl,
            timeout,
            maxRetries,
            defaultHeaders,
        });
    }
    /**
     * Build and configure the request for DashScope API.
     *
     * This method applies DashScope-specific configurations including:
     * - Cache control for the system message, last tool message (when tools are configured),
     *   and the latest history message
     * - Output token limits based on model capabilities
     * - Vision model specific parameters (vl_high_resolution_images)
     * - Request metadata for session tracking
     *
     * @param request - The original chat completion request parameters
     * @param userPromptId - Unique identifier for the user prompt for session tracking
     * @returns Configured request with DashScope-specific parameters applied
     */
    buildRequest(request, userPromptId) {
        let messages = request.messages;
        let tools = request.tools;
        // Apply DashScope cache control only if not disabled
        if (!this.shouldDisableCacheControl()) {
            const { messages: updatedMessages, tools: updatedTools } = this.addDashScopeCacheControl(request, request.stream ? 'all' : 'system_only');
            messages = updatedMessages;
            tools = updatedTools;
        }
        // Apply output token limits based on model capabilities
        // This ensures max_tokens doesn't exceed the model's maximum output limit
        const requestWithTokenLimits = this.applyOutputTokenLimit(request, request.model);
        if (this.isVisionModel(request.model)) {
            return {
                ...requestWithTokenLimits,
                messages,
                ...(tools ? { tools } : {}),
                ...(this.buildMetadata(userPromptId) || {}),
                /* @ts-expect-error dashscope exclusive */
                vl_high_resolution_images: true,
            };
        }
        return {
            ...requestWithTokenLimits, // Preserve all original parameters including sampling params and adjusted max_tokens
            messages,
            ...(tools ? { tools } : {}),
            ...(this.buildMetadata(userPromptId) || {}),
        };
    }
    buildMetadata(userPromptId) {
        const channel = this.cliConfig.getChannel?.();
        return {
            metadata: {
                sessionId: this.cliConfig.getSessionId?.(),
                promptId: userPromptId,
                ...(channel ? { channel } : {}),
            },
        };
    }
    getDefaultGenerationConfig() {
        return {
            temperature: 0.3,
        };
    }
    /**
     * Add cache control flag to specified message(s) for DashScope providers
     */
    addDashScopeCacheControl(request, cacheControl) {
        const messages = request.messages;
        const systemIndex = messages.findIndex((msg) => msg.role === 'system');
        const lastIndex = messages.length - 1;
        const updatedMessages = messages.length === 0
            ? messages
            : messages.map((message, index) => {
                const shouldAddCacheControl = Boolean((index === systemIndex && systemIndex !== -1) ||
                    (index === lastIndex && cacheControl === 'all'));
                if (!shouldAddCacheControl ||
                    !('content' in message) ||
                    message.content === null ||
                    message.content === undefined) {
                    return message;
                }
                return {
                    ...message,
                    content: this.addCacheControlToContent(message.content),
                };
            });
        const updatedTools = cacheControl === 'all' && request.tools?.length
            ? this.addCacheControlToTools(request.tools)
            : request.tools;
        return {
            messages: updatedMessages,
            tools: updatedTools,
        };
    }
    addCacheControlToTools(tools) {
        if (tools.length === 0) {
            return tools;
        }
        const updatedTools = [...tools];
        const lastToolIndex = tools.length - 1;
        updatedTools[lastToolIndex] = {
            ...updatedTools[lastToolIndex],
            cache_control: { type: 'ephemeral' },
        };
        return updatedTools;
    }
    /**
     * Add cache control to message content, handling both string and array formats
     */
    addCacheControlToContent(content) {
        // Convert content to array format if it's a string
        const contentArray = this.normalizeContentToArray(content);
        // Add cache control to the last text item or create one if needed
        return this.addCacheControlToContentArray(contentArray);
    }
    /**
     * Normalize content to array format
     */
    normalizeContentToArray(content) {
        if (typeof content === 'string') {
            return [
                {
                    type: 'text',
                    text: content,
                },
            ];
        }
        return [...content];
    }
    /**
     * Add cache control to the content array
     */
    addCacheControlToContentArray(contentArray) {
        if (contentArray.length === 0) {
            return [
                {
                    type: 'text',
                    text: '',
                    cache_control: { type: 'ephemeral' },
                },
            ];
        }
        const lastItem = contentArray[contentArray.length - 1];
        if (lastItem.type === 'text') {
            // Add cache_control to the last text item
            contentArray[contentArray.length - 1] = {
                ...lastItem,
                cache_control: { type: 'ephemeral' },
            };
        }
        else {
            // If the last item is not text, add a new text item with cache_control
            contentArray.push({
                type: 'text',
                text: '',
                cache_control: { type: 'ephemeral' },
            });
        }
        return contentArray;
    }
    isVisionModel(model) {
        if (!model) {
            return false;
        }
        const normalized = model.toLowerCase();
        if (normalized === 'vision-model') {
            return true;
        }
        if (normalized.startsWith('qwen-vl')) {
            return true;
        }
        if (normalized.startsWith('qwen3-vl-plus')) {
            return true;
        }
        return false;
    }
    /**
     * Apply output token limit to a request's max_tokens parameter.
     *
     * Ensures that existing max_tokens parameters don't exceed the model's maximum output
     * token limit. Only modifies max_tokens when already present in the request.
     *
     * @param request - The chat completion request parameters
     * @param model - The model name to get the output token limit for
     * @returns The request with max_tokens adjusted to respect the model's limits (if present)
     */
    applyOutputTokenLimit(request, model) {
        const currentMaxTokens = request.max_tokens;
        // Only process if max_tokens is already present in the request
        if (currentMaxTokens === undefined || currentMaxTokens === null) {
            return request; // No max_tokens parameter, return unchanged
        }
        const modelLimit = tokenLimit(model, 'output');
        // If max_tokens exceeds the model limit, cap it to the model's limit
        if (currentMaxTokens > modelLimit) {
            return {
                ...request,
                max_tokens: modelLimit,
            };
        }
        // If max_tokens is within the limit, return the request unchanged
        return request;
    }
    /**
     * Check if cache control should be disabled based on configuration.
     *
     * @returns true if cache control should be disabled, false otherwise
     */
    shouldDisableCacheControl() {
        return (this.cliConfig.getContentGeneratorConfig()?.disableCacheControl === true);
    }
}
//# sourceMappingURL=dashscope.js.map