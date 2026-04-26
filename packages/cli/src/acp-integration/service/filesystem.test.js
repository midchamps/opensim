/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, expect, it, vi } from 'vitest';
import { AcpFileSystemService } from './filesystem.js';
const createFallback = () => ({
    readTextFile: vi.fn(),
    writeTextFile: vi.fn(),
    findFiles: vi.fn().mockReturnValue([]),
});
describe('AcpFileSystemService', () => {
    describe('readTextFile ENOENT handling', () => {
        it('parses path from ACP ENOENT message (quoted)', async () => {
            const client = {
                readTextFile: vi
                    .fn()
                    .mockResolvedValue({ content: 'ERROR: ENOENT: "/remote/file.txt"' }),
            };
            const svc = new AcpFileSystemService(client, 'session-1', { readTextFile: true, writeTextFile: true }, createFallback());
            await expect(svc.readTextFile('/local/file.txt')).rejects.toMatchObject({
                code: 'ENOENT',
                path: '/remote/file.txt',
            });
        });
        it('falls back to requested path when none provided', async () => {
            const client = {
                readTextFile: vi.fn().mockResolvedValue({ content: 'ERROR: ENOENT:' }),
            };
            const svc = new AcpFileSystemService(client, 'session-2', { readTextFile: true, writeTextFile: true }, createFallback());
            await expect(svc.readTextFile('/fallback/path.txt')).rejects.toMatchObject({
                code: 'ENOENT',
                path: '/fallback/path.txt',
            });
        });
    });
});
//# sourceMappingURL=filesystem.test.js.map