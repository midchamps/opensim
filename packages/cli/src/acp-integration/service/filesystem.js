/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * ACP client-based implementation of FileSystemService
 */
export class AcpFileSystemService {
    client;
    sessionId;
    capabilities;
    fallback;
    constructor(client, sessionId, capabilities, fallback) {
        this.client = client;
        this.sessionId = sessionId;
        this.capabilities = capabilities;
        this.fallback = fallback;
    }
    async readTextFile(filePath) {
        if (!this.capabilities.readTextFile) {
            return this.fallback.readTextFile(filePath);
        }
        const response = await this.client.readTextFile({
            path: filePath,
            sessionId: this.sessionId,
            line: null,
            limit: null,
        });
        if (response.content.startsWith('ERROR: ENOENT:')) {
            // Treat ACP error strings as structured ENOENT errors without
            // assuming a specific platform format.
            const match = /^ERROR:\s*ENOENT:\s*(?<path>.*)$/i.exec(response.content);
            const err = new Error(response.content);
            err.code = 'ENOENT';
            err.errno = -2;
            const rawPath = match?.groups?.['path']?.trim();
            err['path'] = rawPath
                ? rawPath.replace(/^['"]|['"]$/g, '') || filePath
                : filePath;
            throw err;
        }
        return response.content;
    }
    async writeTextFile(filePath, content) {
        if (!this.capabilities.writeTextFile) {
            return this.fallback.writeTextFile(filePath, content);
        }
        await this.client.writeTextFile({
            path: filePath,
            content,
            sessionId: this.sessionId,
        });
    }
    findFiles(fileName, searchPaths) {
        return this.fallback.findFiles(fileName, searchPaths);
    }
}
//# sourceMappingURL=filesystem.js.map