import * as fs from 'fs/promises';
import * as path from 'path';
import type { FileEntry, ProjectSnapshot } from './types.js';

const INCLUDED_EXTENSIONS = new Set(['.ts', '.tsx', '.json', '.js', '.md']);

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.qwen',
  'dist',
  'coverage',
  '.cursor',
  'output',
]);

const EXCLUDED_FILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]);

/**
 * Recursively collect files from a project directory.
 */
async function walkDir(
  dir: string,
  rootDir: string,
  files: FileEntry[],
  tree: string[],
  depth: number = 0,
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(rootDir, fullPath);
    const indent = '  '.repeat(depth);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      tree.push(`${indent}${entry.name}/`);
      await walkDir(fullPath, rootDir, files, tree, depth + 1);
    } else if (entry.isFile()) {
      if (EXCLUDED_FILES.has(entry.name)) continue;
      const ext = path.extname(entry.name);
      tree.push(`${indent}${entry.name}`);

      if (INCLUDED_EXTENSIONS.has(ext)) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          files.push({ relativePath, content, extension: ext });
        } catch {
          // skip unreadable files
        }
      }
    }
  }
}

/**
 * Try to read and parse simConfig.json from common locations.
 */
async function loadSimConfig(
  projectPath: string,
): Promise<Record<string, unknown> | null> {
  const candidates = [
    path.join(projectPath, 'src', 'simConfig.json'),
    path.join(projectPath, 'simConfig.json'),
  ];
  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, 'utf-8');
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Build a concise code summary for LLM context.
 * Focuses on solver / validator / lab files and the simConfig schema.
 */
function buildCodeSummary(
  files: FileEntry[],
  simConfig: Record<string, unknown> | null,
): string {
  const sections: string[] = [];

  // File tree (TS / TSX only)
  const codeFiles = files.filter(
    (f) => f.extension === '.ts' || f.extension === '.tsx',
  );
  sections.push(
    '## Source Files\n' +
      codeFiles.map((f) => `- ${f.relativePath}`).join('\n'),
  );

  // Config top-level keys (skip the universal infrastructure namespaces)
  if (simConfig) {
    const keys = Object.keys(simConfig).filter(
      (k) => !['screenSize', 'renderConfig', 'debugConfig'].includes(k),
    );
    sections.push(
      '## simConfig.json top-level keys (excluding screenSize / renderConfig / debugConfig)\n' +
        keys.join(', '),
    );
  }

  // Key file snippets (first 80 lines)
  const keyPatterns = [
    /solvers?\//i,
    /validators?\//i,
    /lab\//i,
    /observables\.ts$/i,
    /\bApp\.tsx$/,
    /\bmain\.tsx$/,
    /test\/validation/i,
  ];
  for (const file of codeFiles) {
    if (keyPatterns.some((p) => p.test(file.relativePath))) {
      const lines = file.content.split('\n').slice(0, 80).join('\n');
      sections.push(
        `## ${file.relativePath} (first 80 lines)\n\`\`\`typescript\n${lines}\n\`\`\``,
      );
    }
  }

  return sections.join('\n\n');
}

/**
 * Collect a complete snapshot of a finished simulator project.
 */
export async function collectProject(
  projectPath: string,
): Promise<ProjectSnapshot> {
  const absPath = path.resolve(projectPath);

  // Verify directory exists
  try {
    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${absPath}`);
    }
  } catch (e) {
    throw new Error(`Cannot access project directory: ${absPath} — ${e}`);
  }

  const files: FileEntry[] = [];
  const fileTree: string[] = [];

  await walkDir(absPath, absPath, files, fileTree);

  const simConfig = await loadSimConfig(absPath);
  const codeSummary = buildCodeSummary(files, simConfig);

  console.log(`[Collector] Collected ${files.length} files from ${absPath}`);

  return {
    projectPath: absPath,
    files,
    fileTree,
    simConfig,
    codeSummary,
  };
}
