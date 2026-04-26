/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { type Key } from '../hooks/useKeypress.js';
import { type IdeIntegrationNudgeResult } from '../IdeIntegrationNudge.js';
import { type FolderTrustChoice } from '../components/FolderTrustDialog.js';
import { type AuthType, type EditorType, type ApprovalMode } from '@opengame/opengame-core';
import { type SettingScope } from '../../config/settings.js';
import type { AuthState } from '../types.js';
import { type VisionSwitchOutcome } from '../components/ModelSwitchDialog.js';
import { type OpenAICredentials } from '../components/OpenAIKeyPrompt.js';
export interface UIActions {
    handleThemeSelect: (themeName: string | undefined, scope: SettingScope) => void;
    handleThemeHighlight: (themeName: string | undefined) => void;
    handleApprovalModeSelect: (mode: ApprovalMode | undefined, scope: SettingScope) => void;
    handleAuthSelect: (authType: AuthType | undefined, scope: SettingScope, credentials?: OpenAICredentials) => Promise<void>;
    setAuthState: (state: AuthState) => void;
    onAuthError: (error: string) => void;
    cancelAuthentication: () => void;
    handleEditorSelect: (editorType: EditorType | undefined, scope: SettingScope) => void;
    exitEditorDialog: () => void;
    closeSettingsDialog: () => void;
    closeModelDialog: () => void;
    closePermissionsDialog: () => void;
    setShellModeActive: (value: boolean) => void;
    vimHandleInput: (key: Key) => boolean;
    handleIdePromptComplete: (result: IdeIntegrationNudgeResult) => void;
    handleFolderTrustSelect: (choice: FolderTrustChoice) => void;
    setConstrainHeight: (value: boolean) => void;
    onEscapePromptChange: (show: boolean) => void;
    refreshStatic: () => void;
    handleFinalSubmit: (value: string) => void;
    handleClearScreen: () => void;
    onWorkspaceMigrationDialogOpen: () => void;
    onWorkspaceMigrationDialogClose: () => void;
    handleVisionSwitchSelect: (outcome: VisionSwitchOutcome) => void;
    handleWelcomeBackSelection: (choice: 'continue' | 'restart') => void;
    handleWelcomeBackClose: () => void;
    closeSubagentCreateDialog: () => void;
    closeAgentsManagerDialog: () => void;
    openResumeDialog: () => void;
    closeResumeDialog: () => void;
    handleResume: (sessionId: string) => void;
}
export declare const UIActionsContext: import("react").Context<UIActions | null>;
export declare const useUIActions: () => UIActions;
