/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
export const QWEN_DIR = '.qwen';
export const GOOGLE_ACCOUNTS_FILENAME = 'google_accounts.json';
export const OAUTH_FILE = 'oauth_creds.json';
const TMP_DIR_NAME = 'tmp';
const BIN_DIR_NAME = 'bin';
const PROJECT_DIR_NAME = 'projects';
const IDE_DIR_NAME = 'ide';
export class Storage {
    targetDir;
    constructor(targetDir) {
        this.targetDir = targetDir;
    }
    static getGlobalQwenDir() {
        const homeDir = os.homedir();
        if (!homeDir) {
            return path.join(os.tmpdir(), '.qwen');
        }
        return path.join(homeDir, QWEN_DIR);
    }
    static getMcpOAuthTokensPath() {
        return path.join(Storage.getGlobalQwenDir(), 'mcp-oauth-tokens.json');
    }
    static getGlobalSettingsPath() {
        return path.join(Storage.getGlobalQwenDir(), 'settings.json');
    }
    static getInstallationIdPath() {
        return path.join(Storage.getGlobalQwenDir(), 'installation_id');
    }
    static getGoogleAccountsPath() {
        return path.join(Storage.getGlobalQwenDir(), GOOGLE_ACCOUNTS_FILENAME);
    }
    static getUserCommandsDir() {
        return path.join(Storage.getGlobalQwenDir(), 'commands');
    }
    static getGlobalMemoryFilePath() {
        return path.join(Storage.getGlobalQwenDir(), 'memory.md');
    }
    static getGlobalTempDir() {
        return path.join(Storage.getGlobalQwenDir(), TMP_DIR_NAME);
    }
    static getGlobalIdeDir() {
        return path.join(Storage.getGlobalQwenDir(), IDE_DIR_NAME);
    }
    static getGlobalBinDir() {
        return path.join(Storage.getGlobalQwenDir(), BIN_DIR_NAME);
    }
    getQwenDir() {
        return path.join(this.targetDir, QWEN_DIR);
    }
    getProjectDir() {
        const projectId = this.sanitizeCwd(this.getProjectRoot());
        const projectsDir = path.join(Storage.getGlobalQwenDir(), PROJECT_DIR_NAME);
        return path.join(projectsDir, projectId);
    }
    getProjectTempDir() {
        const hash = this.getFilePathHash(this.getProjectRoot());
        const tempDir = Storage.getGlobalTempDir();
        return path.join(tempDir, hash);
    }
    ensureProjectTempDirExists() {
        fs.mkdirSync(this.getProjectTempDir(), { recursive: true });
    }
    static getOAuthCredsPath() {
        return path.join(Storage.getGlobalQwenDir(), OAUTH_FILE);
    }
    getProjectRoot() {
        return this.targetDir;
    }
    getFilePathHash(filePath) {
        return crypto.createHash('sha256').update(filePath).digest('hex');
    }
    getHistoryDir() {
        const hash = this.getFilePathHash(this.getProjectRoot());
        const historyDir = path.join(Storage.getGlobalQwenDir(), 'history');
        return path.join(historyDir, hash);
    }
    getWorkspaceSettingsPath() {
        return path.join(this.getQwenDir(), 'settings.json');
    }
    getProjectCommandsDir() {
        return path.join(this.getQwenDir(), 'commands');
    }
    getProjectTempCheckpointsDir() {
        return path.join(this.getProjectTempDir(), 'checkpoints');
    }
    getExtensionsDir() {
        return path.join(this.getQwenDir(), 'extensions');
    }
    getExtensionsConfigPath() {
        return path.join(this.getExtensionsDir(), 'qwen-extension.json');
    }
    getUserSkillsDir() {
        return path.join(Storage.getGlobalQwenDir(), 'skills');
    }
    getHistoryFilePath() {
        return path.join(this.getProjectTempDir(), 'shell_history');
    }
    sanitizeCwd(cwd) {
        return cwd.replace(/[^a-zA-Z0-9]/g, '-');
    }
}
//# sourceMappingURL=storage.js.map