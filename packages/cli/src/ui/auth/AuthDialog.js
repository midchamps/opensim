import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AuthType } from '@opengame/opengame-core';
import { Box, Text } from 'ink';
import { SettingScope } from '../../config/settings.js';
import { Colors } from '../colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { RadioButtonSelect } from '../components/shared/RadioButtonSelect.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useUIActions } from '../contexts/UIActionsContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { t } from '../../i18n/index.js';
function parseDefaultAuthType(defaultAuthType) {
    if (defaultAuthType &&
        Object.values(AuthType).includes(defaultAuthType)) {
        return defaultAuthType;
    }
    return null;
}
export function AuthDialog() {
    const { pendingAuthType, authError } = useUIState();
    const { handleAuthSelect: onAuthSelect } = useUIActions();
    const settings = useSettings();
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const items = [
        {
            key: AuthType.QWEN_OAUTH,
            label: t('Qwen OAuth'),
            value: AuthType.QWEN_OAUTH,
        },
        {
            key: AuthType.USE_OPENAI,
            label: t('OpenAI'),
            value: AuthType.USE_OPENAI,
        },
    ];
    const initialAuthIndex = Math.max(0, items.findIndex((item) => {
        // Priority 1: pendingAuthType
        if (pendingAuthType) {
            return item.value === pendingAuthType;
        }
        // Priority 2: settings.merged.security?.auth?.selectedType
        if (settings.merged.security?.auth?.selectedType) {
            return item.value === settings.merged.security?.auth?.selectedType;
        }
        // Priority 3: QWEN_DEFAULT_AUTH_TYPE env var
        const defaultAuthType = parseDefaultAuthType(process.env['QWEN_DEFAULT_AUTH_TYPE']);
        if (defaultAuthType) {
            return item.value === defaultAuthType;
        }
        // Priority 4: default to QWEN_OAUTH
        return item.value === AuthType.QWEN_OAUTH;
    }));
    const hasApiKey = Boolean(settings.merged.security?.auth?.apiKey);
    const currentSelectedAuthType = selectedIndex !== null
        ? items[selectedIndex]?.value
        : items[initialAuthIndex]?.value;
    const handleAuthSelect = async (authMethod) => {
        setErrorMessage(null);
        await onAuthSelect(authMethod, SettingScope.User);
    };
    const handleHighlight = (authMethod) => {
        const index = items.findIndex((item) => item.value === authMethod);
        setSelectedIndex(index);
    };
    useKeypress((key) => {
        if (key.name === 'escape') {
            // Prevent exit if there is an error message.
            // This means they user is not authenticated yet.
            if (errorMessage) {
                return;
            }
            if (settings.merged.security?.auth?.selectedType === undefined) {
                // Prevent exiting if no auth method is set
                setErrorMessage(t('You must select an auth method to proceed. Press Ctrl+C again to exit.'));
                return;
            }
            onAuthSelect(undefined, SettingScope.User);
        }
    }, { isActive: true });
    return (_jsxs(Box, { borderStyle: "round", borderColor: Colors.Gray, flexDirection: "column", padding: 1, width: "100%", children: [_jsx(Text, { bold: true, children: t('Get started') }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { children: t('How would you like to authenticate for this project?') }) }), _jsx(Box, { marginTop: 1, children: _jsx(RadioButtonSelect, { items: items, initialIndex: initialAuthIndex, onSelect: handleAuthSelect, onHighlight: handleHighlight }) }), (authError || errorMessage) && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: Colors.AccentRed, children: authError || errorMessage }) })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: Colors.AccentPurple, children: t('(Use Enter to Set Auth)') }) }), hasApiKey && currentSelectedAuthType === AuthType.QWEN_OAUTH && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: Colors.Gray, children: t('Note: Your existing API key in settings.json will not be cleared when using Qwen OAuth. You can switch back to OpenAI authentication later if needed.') }) })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { children: t('Terms of Services and Privacy Notice for OpenGame') }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: Colors.AccentBlue, children: 'https://github.com/QwenLM/Qwen3-Coder/blob/main/README.md' }) })] }));
}
//# sourceMappingURL=AuthDialog.js.map