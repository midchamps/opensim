/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { AuthType, type DeviceAuthorizationData } from '@opengame/opengame-core';
export interface QwenAuthState {
    deviceAuth: DeviceAuthorizationData | null;
    authStatus: 'idle' | 'polling' | 'success' | 'error' | 'timeout' | 'rate_limit';
    authMessage: string | null;
}
export declare const useQwenAuth: (pendingAuthType: AuthType | undefined, isAuthenticating: boolean) => {
    qwenAuthState: QwenAuthState;
    cancelQwenAuth: () => void;
};
