/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Config } from '@opengame/opengame-core';
import type { LoadedSettings } from '../config/settings.js';
import { type Extension } from '../config/extension.js';
import type { CliArgs } from '../config/config.js';
export declare function runAcpAgent(config: Config, settings: LoadedSettings, extensions: Extension[], argv: CliArgs): Promise<void>;
