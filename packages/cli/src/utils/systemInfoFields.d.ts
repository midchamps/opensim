/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ExtendedSystemInfo } from './systemInfo.js';
/**
 * Field configuration for system information display
 */
export interface SystemInfoField {
    label: string;
    key: keyof ExtendedSystemInfo;
}
/**
 * Unified field configuration for system information display.
 * This ensures consistent labeling between /about and /bug commands.
 */
export declare function getSystemInfoFields(info: ExtendedSystemInfo): SystemInfoField[];
/**
 * Get the value for a field from system info
 */
export declare function getFieldValue(field: SystemInfoField, info: ExtendedSystemInfo): string;
