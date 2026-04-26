import * as fs from 'fs/promises';
import * as path from 'path';
const INCLUDED_EXTENSIONS = new Set(['.ts', '.json', '.js', '.md']);
const EXCLUDED_DIRS = new Set([
    'node_modules',
    '.git',
    '.qwen',
    'dist',
    'coverage',
    '.cursor',
]);
const EXCLUDED_FILES = new Set([
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
]);
/**
 * Recursively collect files from a project directory.
 */
async function walkDir(dir, rootDir, files, tree, depth = 0) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(rootDir, fullPath);
        const indent = '  '.repeat(depth);
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(entry.name))
                continue;
            tree.push(`${indent}${entry.name}/`);
            await walkDir(fullPath, rootDir, files, tree, depth + 1);
        }
        else if (entry.isFile()) {
            if (EXCLUDED_FILES.has(entry.name))
                continue;
            const ext = path.extname(entry.name);
            tree.push(`${indent}${entry.name}`);
            if (INCLUDED_EXTENSIONS.has(ext)) {
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    files.push({ relativePath, content, extension: ext });
                }
                catch {
                    // skip unreadable files
                }
            }
        }
    }
}
/**
 * Try to read and parse gameConfig.json from common locations.
 */
async function loadGameConfig(projectPath) {
    const candidates = [
        path.join(projectPath, 'src', 'gameConfig.json'),
        path.join(projectPath, 'gameConfig.json'),
    ];
    for (const p of candidates) {
        try {
            const raw = await fs.readFile(p, 'utf-8');
            return JSON.parse(raw);
        }
        catch {
            continue;
        }
    }
    return null;
}
/**
 * Build a concise code summary for LLM context.
 * Focuses on scene files, base classes, config, and directory structure.
 */
function buildCodeSummary(files, gameConfig) {
    const sections = [];
    // File tree (TS files only)
    const tsFiles = files.filter((f) => f.extension === '.ts');
    sections.push('## Source Files\n' + tsFiles.map((f) => `- ${f.relativePath}`).join('\n'));
    // Config top-level keys
    if (gameConfig) {
        sections.push('## gameConfig.json top-level keys\n' +
            Object.keys(gameConfig).join(', '));
    }
    // Key file snippets (first 80 lines of scene/character/entity files)
    const keyPatterns = [
        /scenes?\//i,
        /characters?\//i,
        /entities?\//i,
        /behaviors?\//i,
        /systems?\//i,
        /towers?\//i,
        /enemies?\//i,
        /ui\//i,
    ];
    for (const file of tsFiles) {
        if (keyPatterns.some((p) => p.test(file.relativePath))) {
            const lines = file.content.split('\n').slice(0, 80).join('\n');
            sections.push(`## ${file.relativePath} (first 80 lines)\n\`\`\`typescript\n${lines}\n\`\`\``);
        }
    }
    return sections.join('\n\n');
}
/**
 * Collect a complete snapshot of a finished game project.
 */
export async function collectProject(projectPath) {
    const absPath = path.resolve(projectPath);
    // Verify directory exists
    try {
        const stat = await fs.stat(absPath);
        if (!stat.isDirectory()) {
            throw new Error(`Not a directory: ${absPath}`);
        }
    }
    catch (e) {
        throw new Error(`Cannot access project directory: ${absPath} — ${e}`);
    }
    const files = [];
    const fileTree = [];
    await walkDir(absPath, absPath, files, fileTree);
    const gameConfig = await loadGameConfig(absPath);
    const codeSummary = buildCodeSummary(files, gameConfig);
    console.log(`[Collector] Collected ${files.length} files from ${absPath}`);
    return {
        projectPath: absPath,
        files,
        fileTree,
        gameConfig,
        codeSummary,
    };
}
//# sourceMappingURL=collector.js.map