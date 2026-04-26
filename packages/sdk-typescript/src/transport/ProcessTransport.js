import { spawn } from 'node:child_process';
import * as readline from 'node:readline';
import { parseJsonLinesStream } from '../utils/jsonLines.js';
import { prepareSpawnInfo } from '../utils/cliPath.js';
import { AbortError } from '../types/errors.js';
import { SdkLogger } from '../utils/logger.js';
const logger = SdkLogger.createLogger('ProcessTransport');
export class ProcessTransport {
    childProcess = null;
    childStdin = null;
    childStdout = null;
    options;
    ready = false;
    _exitError = null;
    closed = false;
    abortController;
    processExitHandler = null;
    abortHandler = null;
    constructor(options) {
        this.options = options;
        this.abortController =
            this.options.abortController ?? new AbortController();
        SdkLogger.configure({
            debug: options.debug,
            stderr: options.stderr,
            logLevel: options.logLevel,
        });
        this.initialize();
    }
    initialize() {
        try {
            if (this.abortController.signal.aborted) {
                throw new AbortError('Transport start aborted');
            }
            const cliArgs = this.buildCliArguments();
            const cwd = this.options.cwd ?? process.cwd();
            const env = { ...process.env, ...this.options.env };
            const spawnInfo = prepareSpawnInfo(this.options.pathToQwenExecutable);
            const stderrMode = this.options.debug || this.options.stderr ? 'pipe' : 'ignore';
            logger.debug(`Spawning CLI (${spawnInfo.type}): ${spawnInfo.command} ${[...spawnInfo.args, ...cliArgs].join(' ')}`);
            this.childProcess = spawn(spawnInfo.command, [...spawnInfo.args, ...cliArgs], {
                cwd,
                env,
                stdio: ['pipe', 'pipe', stderrMode],
                signal: this.abortController.signal,
            });
            this.childStdin = this.childProcess.stdin;
            this.childStdout = this.childProcess.stdout;
            if (this.options.debug || this.options.stderr) {
                this.childProcess.stderr?.on('data', (data) => {
                    logger.debug(data.toString());
                });
            }
            const cleanup = () => {
                if (this.childProcess && !this.childProcess.killed) {
                    this.childProcess.kill('SIGTERM');
                }
            };
            this.processExitHandler = cleanup;
            this.abortHandler = cleanup;
            process.on('exit', this.processExitHandler);
            this.abortController.signal.addEventListener('abort', this.abortHandler);
            this.setupEventHandlers();
            this.ready = true;
            logger.info('CLI process started successfully');
        }
        catch (error) {
            this.ready = false;
            logger.error('Failed to initialize CLI process:', error);
            throw error;
        }
    }
    setupEventHandlers() {
        if (!this.childProcess)
            return;
        this.childProcess.on('error', (error) => {
            this.ready = false;
            if (this.abortController.signal.aborted) {
                this._exitError = new AbortError('CLI process aborted by user');
            }
            else {
                this._exitError = new Error(`CLI process error: ${error.message}`);
                logger.error(this._exitError.message);
            }
        });
        this.childProcess.on('close', (code, signal) => {
            this.ready = false;
            if (this.abortController.signal.aborted) {
                this._exitError = new AbortError('CLI process aborted by user');
            }
            else {
                const error = this.getProcessExitError(code, signal);
                if (error) {
                    this._exitError = error;
                    logger.error(error.message);
                }
            }
        });
    }
    getProcessExitError(code, signal) {
        if (code !== 0 && code !== null) {
            return new Error(`CLI process exited with code ${code}`);
        }
        else if (signal) {
            return new Error(`CLI process terminated by signal ${signal}`);
        }
        return undefined;
    }
    buildCliArguments() {
        const args = [
            '--input-format',
            'stream-json',
            '--output-format',
            'stream-json',
            '--channel=SDK',
        ];
        if (this.options.model) {
            args.push('--model', this.options.model);
        }
        if (this.options.permissionMode) {
            args.push('--approval-mode', this.options.permissionMode);
        }
        if (this.options.maxSessionTurns !== undefined) {
            args.push('--max-session-turns', String(this.options.maxSessionTurns));
        }
        if (this.options.coreTools && this.options.coreTools.length > 0) {
            args.push('--core-tools', this.options.coreTools.join(','));
        }
        if (this.options.excludeTools && this.options.excludeTools.length > 0) {
            args.push('--exclude-tools', this.options.excludeTools.join(','));
        }
        if (this.options.allowedTools && this.options.allowedTools.length > 0) {
            args.push('--allowed-tools', this.options.allowedTools.join(','));
        }
        if (this.options.authType) {
            args.push('--auth-type', this.options.authType);
        }
        if (this.options.includePartialMessages) {
            args.push('--include-partial-messages');
        }
        return args;
    }
    async close() {
        if (this.childStdin) {
            this.childStdin.end();
            this.childStdin = null;
        }
        if (this.processExitHandler) {
            process.off('exit', this.processExitHandler);
            this.processExitHandler = null;
        }
        if (this.abortHandler) {
            this.abortController.signal.removeEventListener('abort', this.abortHandler);
            this.abortHandler = null;
        }
        if (this.childProcess && !this.childProcess.killed) {
            this.childProcess.kill('SIGTERM');
            setTimeout(() => {
                if (this.childProcess && !this.childProcess.killed) {
                    this.childProcess.kill('SIGKILL');
                }
            }, 5000);
        }
        this.ready = false;
        this.closed = true;
    }
    async waitForExit() {
        if (!this.childProcess) {
            if (this._exitError) {
                throw this._exitError;
            }
            return;
        }
        if (this.childProcess.exitCode !== null || this.childProcess.killed) {
            if (this._exitError) {
                throw this._exitError;
            }
            return;
        }
        return new Promise((resolve, reject) => {
            const exitHandler = (code, signal) => {
                if (this.abortController.signal.aborted) {
                    reject(new AbortError('Operation aborted'));
                    return;
                }
                const error = this.getProcessExitError(code, signal);
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            };
            this.childProcess.once('close', exitHandler);
            const errorHandler = (error) => {
                this.childProcess.off('close', exitHandler);
                reject(error);
            };
            this.childProcess.once('error', errorHandler);
            this.childProcess.once('close', () => {
                this.childProcess.off('error', errorHandler);
            });
        });
    }
    write(message) {
        if (this.abortController.signal.aborted) {
            throw new AbortError('Cannot write: operation aborted');
        }
        if (!this.ready || !this.childStdin) {
            throw new Error('Transport not ready for writing');
        }
        if (this.closed) {
            throw new Error('Cannot write to closed transport');
        }
        if (this.childStdin.writableEnded) {
            throw new Error('Cannot write to ended stream');
        }
        if (this.childProcess?.killed || this.childProcess?.exitCode !== null) {
            throw new Error('Cannot write to terminated process');
        }
        if (this._exitError) {
            throw new Error(`Cannot write to process that exited with error: ${this._exitError.message}`);
        }
        logger.debug(`Writing to stdin (${message.length} bytes): ${message.trim()}`);
        try {
            const written = this.childStdin.write(message);
            if (!written) {
                logger.warn(`Write buffer full (${message.length} bytes), data queued. Waiting for drain event...`);
            }
            else {
                logger.debug(`Write successful (${message.length} bytes)`);
            }
        }
        catch (error) {
            this.ready = false;
            const errorMsg = `Failed to write to stdin: ${error instanceof Error ? error.message : String(error)}`;
            logger.error(errorMsg);
            throw new Error(errorMsg);
        }
    }
    async *readMessages() {
        if (!this.childStdout) {
            throw new Error('Cannot read messages: process not started');
        }
        const rl = readline.createInterface({
            input: this.childStdout,
            crlfDelay: Infinity,
            terminal: false,
        });
        try {
            for await (const message of parseJsonLinesStream(rl, 'ProcessTransport')) {
                yield message;
            }
            await this.waitForExit();
        }
        finally {
            rl.close();
        }
    }
    get isReady() {
        return this.ready;
    }
    get exitError() {
        return this._exitError;
    }
    endInput() {
        if (this.childStdin) {
            this.childStdin.end();
        }
    }
    getInputStream() {
        return this.childStdin || undefined;
    }
    getOutputStream() {
        return this.childStdout || undefined;
    }
}
//# sourceMappingURL=ProcessTransport.js.map