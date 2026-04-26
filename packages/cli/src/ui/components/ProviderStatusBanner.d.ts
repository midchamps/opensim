/**
 * @license
 * Copyright 2025 OpenGame Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import { type Config } from '@opengame/opengame-core';
interface ProviderStatusBannerProps {
    config: Config;
}
/**
 * Compact one-line summary of which generative-AI providers OpenGame has
 * keys for. Rendered just below the header so the user can immediately
 * see which tools will work in this session. Shows guidance to run
 * `/setup` only when at least one modality is missing.
 */
export declare const ProviderStatusBanner: React.FC<ProviderStatusBannerProps>;
export {};
