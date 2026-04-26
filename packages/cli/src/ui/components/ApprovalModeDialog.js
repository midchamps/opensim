import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { ApprovalMode, APPROVAL_MODES } from '@opengame/opengame-core';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { SettingScope } from '../../config/settings.js';
import { getScopeMessageForSetting } from '../../utils/dialogScopeUtils.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { ScopeSelector } from './shared/ScopeSelector.js';
import { t } from '../../i18n/index.js';
const formatModeDescription = (mode) => {
    switch (mode) {
        case ApprovalMode.PLAN:
            return t('Analyze only, do not modify files or execute commands');
        case ApprovalMode.DEFAULT:
            return t('Require approval for file edits or shell commands');
        case ApprovalMode.AUTO_EDIT:
            return t('Automatically approve file edits');
        case ApprovalMode.YOLO:
            return t('Automatically approve all tools');
        default:
            return t('{{mode}} mode', { mode });
    }
};
export function ApprovalModeDialog({ onSelect, settings, currentMode, availableTerminalHeight: _availableTerminalHeight, }) {
    // Start with User scope by default
    const [selectedScope, setSelectedScope] = useState(SettingScope.User);
    // Track the currently highlighted approval mode
    const [highlightedMode, setHighlightedMode] = useState(currentMode || ApprovalMode.DEFAULT);
    // Generate approval mode items with inline descriptions
    const modeItems = APPROVAL_MODES.map((mode) => ({
        label: `${mode} - ${formatModeDescription(mode)}`,
        value: mode,
        key: mode,
    }));
    // Find the index of the current mode
    const initialModeIndex = modeItems.findIndex((item) => item.value === highlightedMode);
    const safeInitialModeIndex = initialModeIndex >= 0 ? initialModeIndex : 0;
    const handleModeSelect = useCallback((mode) => {
        onSelect(mode, selectedScope);
    }, [onSelect, selectedScope]);
    const handleModeHighlight = (mode) => {
        setHighlightedMode(mode);
    };
    const handleScopeHighlight = useCallback((scope) => {
        setSelectedScope(scope);
    }, []);
    const handleScopeSelect = useCallback((scope) => {
        onSelect(highlightedMode, scope);
    }, [onSelect, highlightedMode]);
    const [focusSection, setFocusSection] = useState('mode');
    useKeypress((key) => {
        if (key.name === 'tab') {
            setFocusSection((prev) => (prev === 'mode' ? 'scope' : 'mode'));
        }
        if (key.name === 'escape') {
            onSelect(undefined, selectedScope);
        }
    }, { isActive: true });
    // Generate scope message for approval mode setting
    const otherScopeModifiedMessage = getScopeMessageForSetting('tools.approvalMode', selectedScope, settings);
    // Check if user scope is selected but workspace has the setting
    const showWorkspacePriorityWarning = selectedScope === SettingScope.User &&
        otherScopeModifiedMessage.toLowerCase().includes('workspace');
    return (_jsx(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "row", padding: 1, width: "100%", height: "100%", children: _jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [_jsxs(Text, { bold: focusSection === 'mode', wrap: "truncate", children: [focusSection === 'mode' ? '> ' : '  ', t('Approval Mode'), ' ', _jsx(Text, { color: theme.text.secondary, children: otherScopeModifiedMessage })] }), _jsx(Box, { height: 1 }), _jsx(RadioButtonSelect, { items: modeItems, initialIndex: safeInitialModeIndex, onSelect: handleModeSelect, onHighlight: handleModeHighlight, isFocused: focusSection === 'mode', maxItemsToShow: 10, showScrollArrows: false, showNumbers: focusSection === 'mode' }), _jsx(Box, { height: 1 }), _jsx(Box, { marginTop: 1, children: _jsx(ScopeSelector, { onSelect: handleScopeSelect, onHighlight: handleScopeHighlight, isFocused: focusSection === 'scope', initialScope: selectedScope }) }), _jsx(Box, { height: 1 }), showWorkspacePriorityWarning && (_jsxs(_Fragment, { children: [_jsxs(Text, { color: theme.status.warning, wrap: "wrap", children: ["\u26A0", ' ', t('Workspace approval mode exists and takes priority. User-level change will have no effect.')] }), _jsx(Box, { height: 1 })] })), _jsx(Text, { color: theme.text.secondary, children: t('(Use Enter to select, Tab to change focus)') })] }) }));
}
//# sourceMappingURL=ApprovalModeDialog.js.map