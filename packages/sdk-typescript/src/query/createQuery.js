/**
 * Factory function for creating Query instances.
 */
import { serializeJsonLine } from '../utils/jsonLines.js';
import { ProcessTransport } from '../transport/ProcessTransport.js';
import { parseExecutableSpec } from '../utils/cliPath.js';
import { Query } from './Query.js';
import { QueryOptionsSchema } from '../types/queryOptionsSchema.js';
import { SdkLogger } from '../utils/logger.js';
const logger = SdkLogger.createLogger('createQuery');
export function query({ prompt, options = {}, }) {
    const parsedExecutable = validateOptions(options);
    const isSingleTurn = typeof prompt === 'string';
    const pathToQwenExecutable = options.pathToQwenExecutable ?? parsedExecutable.executablePath;
    const abortController = options.abortController ?? new AbortController();
    const transport = new ProcessTransport({
        pathToQwenExecutable,
        cwd: options.cwd,
        model: options.model,
        permissionMode: options.permissionMode,
        env: options.env,
        abortController,
        debug: options.debug,
        stderr: options.stderr,
        logLevel: options.logLevel,
        maxSessionTurns: options.maxSessionTurns,
        coreTools: options.coreTools,
        excludeTools: options.excludeTools,
        allowedTools: options.allowedTools,
        authType: options.authType,
        includePartialMessages: options.includePartialMessages,
    });
    const queryOptions = {
        ...options,
        abortController,
    };
    const queryInstance = new Query(transport, queryOptions, isSingleTurn);
    if (isSingleTurn) {
        const stringPrompt = prompt;
        const message = {
            type: 'user',
            session_id: queryInstance.getSessionId(),
            message: {
                role: 'user',
                content: stringPrompt,
            },
            parent_tool_use_id: null,
        };
        (async () => {
            try {
                await queryInstance.initialized;
                transport.write(serializeJsonLine(message));
            }
            catch (err) {
                logger.error('Error sending single-turn prompt:', err);
            }
        })();
    }
    else {
        queryInstance
            .streamInput(prompt)
            .catch((err) => {
            logger.error('Error streaming input:', err);
        });
    }
    return queryInstance;
}
function validateOptions(options) {
    const validationResult = QueryOptionsSchema.safeParse(options);
    if (!validationResult.success) {
        const errors = validationResult.error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join('; ');
        throw new Error(`Invalid QueryOptions: ${errors}`);
    }
    let parsedExecutable;
    try {
        parsedExecutable = parseExecutableSpec(options.pathToQwenExecutable);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid pathToQwenExecutable: ${errorMessage}`);
    }
    return parsedExecutable;
}
//# sourceMappingURL=createQuery.js.map