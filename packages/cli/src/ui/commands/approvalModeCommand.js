/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';
export const approvalModeCommand = {
    name: 'approval-mode',
    get description() {
        return t('View or change the approval mode for tool usage');
    },
    kind: CommandKind.BUILT_IN,
    action: async (_context, _args) => ({
        type: 'dialog',
        dialog: 'approval-mode',
    }),
};
//# sourceMappingURL=approvalModeCommand.js.map