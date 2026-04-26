/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '@opengame/opengame-core';
import { AuthType } from '@opengame/opengame-core';
import type { LoadedSettings, SettingScope } from '../../config/settings.js';
import type { OpenAICredentials } from '../components/OpenAIKeyPrompt.js';
import { AuthState } from '../types.js';
import type { HistoryItem } from '../types.js';
export type { QwenAuthState } from '../hooks/useQwenAuth.js';
export declare const useAuthCommand: (settings: LoadedSettings, config: Config, addItem: (item: Omit<HistoryItem, "id">, timestamp: number) => void) => {
    authState: AuthState;
    setAuthState: import("react").Dispatch<import("react").SetStateAction<AuthState>>;
    authError: string | null;
    onAuthError: (error: string | null) => void;
    isAuthDialogOpen: boolean;
    isAuthenticating: boolean;
    pendingAuthType: AuthType | undefined;
    qwenAuthState: import("../hooks/useQwenAuth.js").QwenAuthState;
    handleAuthSelect: (authType: AuthType | undefined, scope: SettingScope, credentials?: OpenAICredentials) => Promise<void>;
    openAuthDialog: () => void;
    cancelAuthentication: () => void;
};
