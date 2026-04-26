import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { ApprovalMode } from '@opengame/opengame-core';
import { t } from '../../i18n/index.js';
export const AutoAcceptIndicator = ({ approvalMode, }) => {
    let textColor = '';
    let textContent = '';
    let subText = '';
    switch (approvalMode) {
        case ApprovalMode.PLAN:
            textColor = theme.status.success;
            textContent = t('plan mode');
            subText = ` ${t('(shift + tab to cycle)')}`;
            break;
        case ApprovalMode.AUTO_EDIT:
            textColor = theme.status.warning;
            textContent = t('auto-accept edits');
            subText = ` ${t('(shift + tab to cycle)')}`;
            break;
        case ApprovalMode.YOLO:
            textColor = theme.status.error;
            textContent = t('YOLO mode');
            subText = ` ${t('(shift + tab to cycle)')}`;
            break;
        case ApprovalMode.DEFAULT:
        default:
            break;
    }
    return (_jsx(Box, { children: _jsxs(Text, { color: textColor, children: [textContent, subText && _jsx(Text, { color: theme.text.secondary, children: subText })] }) }));
};
//# sourceMappingURL=AutoAcceptIndicator.js.map