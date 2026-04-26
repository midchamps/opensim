import { jsx as _jsx } from "react/jsx-runtime";
import { Box } from 'ink';
import { MarkdownDisplay } from '../../utils/MarkdownDisplay.js';
import { theme } from '../../semantic-colors.js';
/**
 * Continuation component for thought messages, similar to GeminiMessageContent.
 * Used when a thought response gets too long and needs to be split for performance.
 */
export const GeminiThoughtMessageContent = ({ text, isPending, availableTerminalHeight, terminalWidth }) => {
    const originalPrefix = '✦ ';
    const prefixWidth = originalPrefix.length;
    return (_jsx(Box, { flexDirection: "column", paddingLeft: prefixWidth, marginBottom: 1, children: _jsx(MarkdownDisplay, { text: text, isPending: isPending, availableTerminalHeight: availableTerminalHeight, terminalWidth: terminalWidth, textColor: theme.text.secondary }) }));
};
//# sourceMappingURL=GeminiThoughtMessageContent.js.map