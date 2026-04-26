import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useContext, useMemo } from 'react';
import { Box, Text } from 'ink';
import { AuthType, ModelSlashCommandEvent, logModelSlashCommand, } from '@opengame/opengame-core';
import { useKeypress } from '../hooks/useKeypress.js';
import { theme } from '../semantic-colors.js';
import { DescriptiveRadioButtonSelect } from './shared/DescriptiveRadioButtonSelect.js';
import { ConfigContext } from '../contexts/ConfigContext.js';
import { getAvailableModelsForAuthType, MAINLINE_CODER, } from '../models/availableModels.js';
import { t } from '../../i18n/index.js';
export function ModelDialog({ onClose }) {
    const config = useContext(ConfigContext);
    // Get auth type from config, default to QWEN_OAUTH if not available
    const authType = config?.getAuthType() ?? AuthType.QWEN_OAUTH;
    // Get available models based on auth type
    const availableModels = useMemo(() => getAvailableModelsForAuthType(authType), [authType]);
    const MODEL_OPTIONS = useMemo(() => availableModels.map((model) => ({
        value: model.id,
        title: model.label,
        description: model.description || '',
        key: model.id,
    })), [availableModels]);
    // Determine the Preferred Model (read once when the dialog opens).
    const preferredModel = config?.getModel() || MAINLINE_CODER;
    useKeypress((key) => {
        if (key.name === 'escape') {
            onClose();
        }
    }, { isActive: true });
    // Calculate the initial index based on the preferred model.
    const initialIndex = useMemo(() => MODEL_OPTIONS.findIndex((option) => option.value === preferredModel), [MODEL_OPTIONS, preferredModel]);
    // Handle selection internally (Autonomous Dialog).
    const handleSelect = useCallback((model) => {
        if (config) {
            config.setModel(model);
            const event = new ModelSlashCommandEvent(model);
            logModelSlashCommand(config, event);
        }
        onClose();
    }, [config, onClose]);
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "column", padding: 1, width: "100%", children: [_jsx(Text, { bold: true, children: t('Select Model') }), _jsx(Box, { marginTop: 1, children: _jsx(DescriptiveRadioButtonSelect, { items: MODEL_OPTIONS, onSelect: handleSelect, initialIndex: initialIndex, showNumbers: true }) }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsx(Text, { color: theme.text.secondary, children: t('(Press Esc to close)') }) })] }));
}
//# sourceMappingURL=ModelDialog.js.map