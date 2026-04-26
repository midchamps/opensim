/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Storage } from '@opengame/opengame-core';
import { Logger } from '@opengame/opengame-core';
/**
 * Hook to manage the logger instance.
 */
export declare const useLogger: (storage: Storage, sessionId: string) => Logger | null;
