import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { getAllProvidersStatus, } from '@opengame/opengame-core';
import { theme } from '../semantic-colors.js';
function statusLabel(s) {
    if (!s.configured)
        return 'not set';
    return `${s.provider}/${s.model}`;
}
/**
 * Compact one-line summary of which generative-AI providers OpenGame has
 * keys for. Rendered just below the header so the user can immediately
 * see which tools will work in this session. Shows guidance to run
 * `/setup` only when at least one modality is missing.
 */
export const ProviderStatusBanner = ({ config, }) => {
    const statuses = getAllProvidersStatus(config.getOpenGameProviders());
    const anyMissing = statuses.some((s) => !s.configured);
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsxs(Box, { children: [_jsx(Text, { color: theme.text.secondary, children: "Providers: " }), statuses.map((s, i) => (_jsxs(Text, { children: [i > 0 && _jsx(Text, { color: theme.text.secondary, children: " \u00B7 " }), _jsx(Text, { color: s.configured ? theme.status.success : theme.status.warning, children: s.modality }), _jsxs(Text, { color: theme.text.secondary, children: [" ", statusLabel(s)] })] }, s.modality)))] }), anyMissing && (_jsxs(Text, { color: theme.text.secondary, children: ["Run", ' ', _jsx(Text, { bold: true, color: theme.text.accent, children: "/setup" }), ' ', "to see how to configure the missing providers."] }))] }));
};
//# sourceMappingURL=ProviderStatusBanner.js.map