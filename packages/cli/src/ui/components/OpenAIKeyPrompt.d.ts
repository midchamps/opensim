/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { z } from 'zod';
interface OpenAIKeyPromptProps {
    onSubmit: (apiKey: string, baseUrl: string, model: string) => void;
    onCancel: () => void;
    defaultApiKey?: string;
    defaultBaseUrl?: string;
    defaultModel?: string;
}
export declare const credentialSchema: z.ZodObject<{
    apiKey: z.ZodString;
    baseUrl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
    model: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    model?: string | undefined;
    baseUrl?: string | undefined;
}, {
    apiKey: string;
    model?: string | undefined;
    baseUrl?: string | undefined;
}>;
export type OpenAICredentials = z.infer<typeof credentialSchema>;
export declare function OpenAIKeyPrompt({ onSubmit, onCancel, defaultApiKey, defaultBaseUrl, defaultModel, }: OpenAIKeyPromptProps): React.JSX.Element;
export {};
