/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { GenerateContentResponse, } from '@google/genai';
import { OpenAIContentConverter } from './converter.js';
export class ContentGenerationPipeline {
    config;
    client;
    converter;
    contentGeneratorConfig;
    constructor(config) {
        this.config = config;
        this.contentGeneratorConfig = config.contentGeneratorConfig;
        this.client = this.config.provider.buildClient();
        this.converter = new OpenAIContentConverter(this.contentGeneratorConfig.model, this.contentGeneratorConfig.schemaCompliance);
    }
    async execute(request, userPromptId) {
        return this.executeWithErrorHandling(request, userPromptId, false, async (openaiRequest) => {
            const openaiResponse = (await this.client.chat.completions.create(openaiRequest, {
                signal: request.config?.abortSignal,
            }));
            const geminiResponse = this.converter.convertOpenAIResponseToGemini(openaiResponse);
            return geminiResponse;
        });
    }
    async executeStream(request, userPromptId) {
        return this.executeWithErrorHandling(request, userPromptId, true, async (openaiRequest, context) => {
            // Stage 1: Create OpenAI stream
            const stream = (await this.client.chat.completions.create(openaiRequest, {
                signal: request.config?.abortSignal,
            }));
            // Stage 2: Process stream with conversion and logging
            return this.processStreamWithLogging(stream, context, request);
        });
    }
    /**
     * Stage 2: Process OpenAI stream with conversion and logging
     * This method handles the complete stream processing pipeline:
     * 1. Convert OpenAI chunks to Gemini format while preserving original chunks
     * 2. Filter empty responses
     * 3. Handle chunk merging for providers that send finishReason and usageMetadata separately
     * 4. Collect both formats for logging
     * 5. Handle success/error logging
     */
    async *processStreamWithLogging(stream, context, request) {
        const collectedGeminiResponses = [];
        // Reset streaming tool calls to prevent data pollution from previous streams
        this.converter.resetStreamingToolCalls();
        // State for handling chunk merging
        let pendingFinishResponse = null;
        try {
            // Stage 2a: Convert and yield each chunk while preserving original
            for await (const chunk of stream) {
                const response = this.converter.convertOpenAIChunkToGemini(chunk);
                // Stage 2b: Filter empty responses to avoid downstream issues
                if (response.candidates?.[0]?.content?.parts?.length === 0 &&
                    !response.candidates?.[0]?.finishReason &&
                    !response.usageMetadata) {
                    continue;
                }
                // Stage 2c: Handle chunk merging for providers that send finishReason and usageMetadata separately
                const shouldYield = this.handleChunkMerging(response, collectedGeminiResponses, (mergedResponse) => {
                    pendingFinishResponse = mergedResponse;
                });
                if (shouldYield) {
                    // If we have a pending finish response, yield it instead
                    if (pendingFinishResponse) {
                        yield pendingFinishResponse;
                        pendingFinishResponse = null;
                    }
                    else {
                        yield response;
                    }
                }
            }
            // Stage 2d: If there's still a pending finish response at the end, yield it
            if (pendingFinishResponse) {
                yield pendingFinishResponse;
            }
            // Stage 2e: Stream completed successfully
            context.duration = Date.now() - context.startTime;
        }
        catch (error) {
            // Clear streaming tool calls on error to prevent data pollution
            this.converter.resetStreamingToolCalls();
            // Use shared error handling logic
            await this.handleError(error, context, request);
        }
    }
    /**
     * Handle chunk merging for providers that send finishReason and usageMetadata separately.
     *
     * Strategy: When we encounter a finishReason chunk, we hold it and merge all subsequent
     * chunks into it until the stream ends. This ensures the final chunk contains both
     * finishReason and the most up-to-date usage information from any provider pattern.
     *
     * @param response Current Gemini response
     * @param collectedGeminiResponses Array to collect responses for logging
     * @param setPendingFinish Callback to set pending finish response
     * @returns true if the response should be yielded, false if it should be held for merging
     */
    handleChunkMerging(response, collectedGeminiResponses, setPendingFinish) {
        const isFinishChunk = response.candidates?.[0]?.finishReason;
        // Check if we have a pending finish response from previous chunks
        const hasPendingFinish = collectedGeminiResponses.length > 0 &&
            collectedGeminiResponses[collectedGeminiResponses.length - 1]
                .candidates?.[0]?.finishReason;
        if (isFinishChunk) {
            // This is a finish reason chunk
            collectedGeminiResponses.push(response);
            setPendingFinish(response);
            return false; // Don't yield yet, wait for potential subsequent chunks to merge
        }
        else if (hasPendingFinish) {
            // We have a pending finish chunk, merge this chunk's data into it
            const lastResponse = collectedGeminiResponses[collectedGeminiResponses.length - 1];
            const mergedResponse = new GenerateContentResponse();
            // Keep the finish reason from the previous chunk
            mergedResponse.candidates = lastResponse.candidates;
            // Merge usage metadata if this chunk has it
            if (response.usageMetadata) {
                mergedResponse.usageMetadata = response.usageMetadata;
            }
            else {
                mergedResponse.usageMetadata = lastResponse.usageMetadata;
            }
            // Copy other essential properties from the current response
            mergedResponse.responseId = response.responseId;
            mergedResponse.createTime = response.createTime;
            mergedResponse.modelVersion = response.modelVersion;
            mergedResponse.promptFeedback = response.promptFeedback;
            // Update the collected responses with the merged response
            collectedGeminiResponses[collectedGeminiResponses.length - 1] =
                mergedResponse;
            setPendingFinish(mergedResponse);
            return true; // Yield the merged response
        }
        // Normal chunk - collect and yield
        collectedGeminiResponses.push(response);
        return true;
    }
    async buildRequest(request, userPromptId, streaming = false) {
        const messages = this.converter.convertGeminiRequestToOpenAI(request);
        // Apply provider-specific enhancements
        const baseRequest = {
            model: this.contentGeneratorConfig.model,
            messages,
            ...this.buildGenerateContentConfig(request),
        };
        // Add streaming options if present
        if (streaming) {
            baseRequest.stream = true;
            baseRequest.stream_options = { include_usage: true };
        }
        // Add tools if present
        if (request.config?.tools) {
            baseRequest.tools = await this.converter.convertGeminiToolsToOpenAI(request.config.tools);
        }
        // Let provider enhance the request (e.g., add metadata, cache control)
        return this.config.provider.buildRequest(baseRequest, userPromptId);
    }
    buildGenerateContentConfig(request) {
        const defaultSamplingParams = this.config.provider.getDefaultGenerationConfig();
        const configSamplingParams = this.contentGeneratorConfig.samplingParams;
        // Helper function to get parameter value with priority: config > request > default
        const getParameterValue = (configKey, requestKey) => {
            const configValue = configSamplingParams?.[configKey];
            const requestValue = requestKey
                ? request.config?.[requestKey]
                : undefined;
            const defaultValue = requestKey
                ? defaultSamplingParams[requestKey]
                : undefined;
            if (configValue !== undefined)
                return configValue;
            if (requestValue !== undefined)
                return requestValue;
            return defaultValue;
        };
        // Helper function to conditionally add parameter if it has a value
        const addParameterIfDefined = (key, configKey, requestKey) => {
            const value = getParameterValue(configKey, requestKey);
            return value !== undefined ? { [key]: value } : {};
        };
        const params = {
            // Parameters with request fallback but no defaults
            ...addParameterIfDefined('temperature', 'temperature', 'temperature'),
            ...addParameterIfDefined('top_p', 'top_p', 'topP'),
            // Max tokens (special case: different property names)
            ...addParameterIfDefined('max_tokens', 'max_tokens', 'maxOutputTokens'),
            // Config-only parameters (no request fallback)
            ...addParameterIfDefined('top_k', 'top_k', 'topK'),
            ...addParameterIfDefined('repetition_penalty', 'repetition_penalty'),
            ...addParameterIfDefined('presence_penalty', 'presence_penalty', 'presencePenalty'),
            ...addParameterIfDefined('frequency_penalty', 'frequency_penalty', 'frequencyPenalty'),
            ...this.buildReasoningConfig(),
        };
        return params;
    }
    buildReasoningConfig() {
        const reasoning = this.contentGeneratorConfig.reasoning;
        if (reasoning === false) {
            return {};
        }
        return {
            reasoning_effort: reasoning?.effort ?? 'medium',
        };
    }
    /**
     * Common error handling wrapper for execute methods
     */
    async executeWithErrorHandling(request, userPromptId, isStreaming, executor) {
        const context = this.createRequestContext(userPromptId, isStreaming);
        try {
            const openaiRequest = await this.buildRequest(request, userPromptId, isStreaming);
            const result = await executor(openaiRequest, context);
            context.duration = Date.now() - context.startTime;
            return result;
        }
        catch (error) {
            // Use shared error handling logic
            return await this.handleError(error, context, request);
        }
    }
    /**
     * Shared error handling logic for both executeWithErrorHandling and processStreamWithLogging
     * This centralizes the common error processing steps to avoid duplication
     */
    async handleError(error, context, request) {
        context.duration = Date.now() - context.startTime;
        this.config.errorHandler.handle(error, context, request);
    }
    /**
     * Create request context with common properties
     */
    createRequestContext(userPromptId, isStreaming) {
        return {
            userPromptId,
            model: this.contentGeneratorConfig.model,
            authType: this.contentGeneratorConfig.authType || 'unknown',
            startTime: Date.now(),
            duration: 0,
            isStreaming,
        };
    }
}
//# sourceMappingURL=pipeline.js.map