import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { getSystemInfoFields, getFieldValue, } from '../../utils/systemInfoFields.js';
import { t } from '../../i18n/index.js';
export const AboutBox = (props) => {
    const fields = getSystemInfoFields(props);
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "column", padding: 1, marginY: 1, width: "100%", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: theme.text.accent, children: t('About OpenGame') }) }), fields.map((field) => (_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { width: "35%", children: _jsx(Text, { bold: true, color: theme.text.link, children: field.label }) }), _jsx(Box, { children: _jsx(Text, { color: theme.text.primary, children: getFieldValue(field, props) }) })] }, field.key)))] }));
};
//# sourceMappingURL=AboutBox.js.map