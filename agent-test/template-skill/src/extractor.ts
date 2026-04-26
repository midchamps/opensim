import * as fs from 'fs/promises';
import { M0_SIM_CONFIG_PATH } from './config.js';
import type {
  ProjectSnapshot,
  ClassificationResult,
  ExtractedPatterns,
  ClassDef,
  MethodDef,
  HookDef,
  ImportEdge,
  DirectoryPattern,
  ConfigField,
} from './types.js';

// =============================================================================
// Extractor — Rule-based code pattern extraction
// =============================================================================

// -----------------------------------------------------------------------------
// 1. File structure analysis
// -----------------------------------------------------------------------------

function extractDirectoryPattern(snapshot: ProjectSnapshot): DirectoryPattern {
  const srcFiles = snapshot.files.filter(
    (f) =>
      f.relativePath.startsWith('src/') &&
      (f.extension === '.ts' || f.extension === '.tsx'),
  );

  const dirMap: Record<string, string[]> = {};

  for (const file of srcFiles) {
    const parts = file.relativePath.split('/');
    if (parts.length >= 3) {
      const subdir = parts[1]!;
      const filename = parts[parts.length - 1]!;
      if (!dirMap[subdir]) dirMap[subdir] = [];
      dirMap[subdir].push(filename);
    }
  }

  return {
    directories: Object.keys(dirMap).sort(),
    filesByDirectory: dirMap,
  };
}

// -----------------------------------------------------------------------------
// 2. Class hierarchy extraction (regex-based TS parsing)
// -----------------------------------------------------------------------------

const CLASS_REGEX =
  /^(?:export\s+)?(?:(abstract)\s+)?class\s+(\w+)(?:\s*<[^>]*>)?(?:\s+extends\s+([\w.]+(?:<[^>]+>)?))?/gm;

const METHOD_REGEX =
  /^\s*(public|protected|private)?\s*(abstract\s+)?(override\s+)?(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*[\w<>[\]| ,]+)?\s*[{;]/gm;

function extractClasses(snapshot: ProjectSnapshot): ClassDef[] {
  const classes: ClassDef[] = [];

  for (const file of snapshot.files) {
    if (file.extension !== '.ts' && file.extension !== '.tsx') continue;

    const content = file.content;
    let classMatch: RegExpExecArray | null;
    CLASS_REGEX.lastIndex = 0;

    while ((classMatch = CLASS_REGEX.exec(content)) !== null) {
      const isAbstract = classMatch[1] === 'abstract';
      const className = classMatch[2]!;
      const parentClass = classMatch[3] ?? null;

      const methods = extractMethods(content, className);

      classes.push({
        name: className,
        parentClass,
        filePath: file.relativePath,
        isAbstract,
        methods,
      });
    }
  }

  return classes;
}

function extractMethods(fileContent: string, _className: string): MethodDef[] {
  const methods: MethodDef[] = [];
  let match: RegExpExecArray | null;
  METHOD_REGEX.lastIndex = 0;

  while ((match = METHOD_REGEX.exec(fileContent)) !== null) {
    const visibility = (match[1] as MethodDef['visibility']) ?? 'public';
    const isAbstract = !!match[2];
    const isOverride = !!match[3];
    const name = match[4]!;
    const params = match[5] ?? '';

    if (name === 'constructor') continue;

    methods.push({
      name,
      visibility,
      isAbstract,
      isOverride,
      signature: `${visibility} ${isAbstract ? 'abstract ' : ''}${isOverride ? 'override ' : ''}${name}(${params})`,
    });
  }

  return methods;
}

// -----------------------------------------------------------------------------
// 3. Hook extraction
// -----------------------------------------------------------------------------

/**
 * OpenSim solver hooks: anything declared `abstract` on a BaseSolver
 * descendant (initialState, step, rhs, updateAgent, ...), plus
 * lifecycle helpers (afterReset, notify) and convention-prefixed
 * methods.
 */
function extractHooks(classes: ClassDef[]): HookDef[] {
  const hookMap = new Map<string, HookDef>();

  // Pre-defined names that are *the* solver hooks. Treat them as
  // hooks even when they aren't abstract (a leaf simulator is going
  // to override them concretely).
  const KNOWN_HOOK_NAMES = new Set([
    'initialState',
    'step',
    'rhs',
    'updateAgent',
    'transitionRule',
    'cellUpdate',
    'sample',
    'afterReset',
    'notify',
  ]);

  for (const cls of classes) {
    for (const method of cls.methods) {
      const isHook =
        method.isAbstract ||
        KNOWN_HOOK_NAMES.has(method.name) ||
        (method.visibility === 'protected' &&
          (method.name.startsWith('on') ||
            method.name.startsWith('compute') ||
            method.name.startsWith('update') ||
            method.name.startsWith('check') ||
            method.name.startsWith('apply')));

      if (!isHook) continue;

      const key = `${cls.name}::${method.name}`;
      const existing = hookMap.get(key);
      if (existing) {
        existing.occurrenceCount += 1;
      } else {
        hookMap.set(key, {
          name: method.name,
          declaringClass: cls.name,
          signature: method.signature,
          isAbstract: method.isAbstract,
          occurrenceCount: 1,
        });
      }
    }
  }

  return Array.from(hookMap.values());
}

// -----------------------------------------------------------------------------
// 4. Import graph extraction
// -----------------------------------------------------------------------------

const IMPORT_REGEX =
  /import\s+(?:(?:type\s+)?{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;

function extractImports(snapshot: ProjectSnapshot): ImportEdge[] {
  const edges: ImportEdge[] = [];

  for (const file of snapshot.files) {
    if (file.extension !== '.ts' && file.extension !== '.tsx') continue;

    let match: RegExpExecArray | null;
    IMPORT_REGEX.lastIndex = 0;

    while ((match = IMPORT_REGEX.exec(file.content)) !== null) {
      const namedImports = match[1]
        ? match[1].split(',').map((s) => s.trim().replace(/^type\s+/, ''))
        : [];
      const defaultImport = match[2];
      const fromPath = match[3]!;

      if (!fromPath.startsWith('.')) continue;

      const importedNames = defaultImport
        ? [defaultImport, ...namedImports]
        : namedImports;

      edges.push({
        fromFile: file.relativePath,
        toFile: fromPath,
        importedNames: importedNames.filter(Boolean),
      });
    }
  }

  return edges;
}

// -----------------------------------------------------------------------------
// 5. simConfig extension extraction (diff against M0)
// -----------------------------------------------------------------------------

interface ConfigWrapper {
  value?: unknown;
  type?: string;
  unit?: string;
  description?: string;
}

async function extractConfigExtensions(
  simConfig: Record<string, unknown> | null,
): Promise<ConfigField[]> {
  if (!simConfig) return [];

  let m0Config: Record<string, unknown> = {};
  try {
    const raw = await fs.readFile(M0_SIM_CONFIG_PATH, 'utf-8');
    m0Config = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // If M0 config not found, treat everything as an extension
  }

  const m0Keys = new Set(Object.keys(m0Config));
  const extensions: ConfigField[] = [];

  // simConfig has two shapes:
  //   (a) FLAT leaves: { fieldName: { value, type, unit, description } }
  //   (b) NAMESPACED:  { ns: { fieldName: { value, type, unit, description } } }
  // We walk both, skipping any path that already exists in M0.
  for (const [key, value] of Object.entries(simConfig)) {
    if (m0Keys.has(key) && isLeaf(m0Config[key]) && isLeaf(value)) continue;

    if (isLeaf(value)) {
      const wrapper = value as ConfigWrapper;
      extensions.push({
        path: key,
        value: wrapper.value,
        type: typeof wrapper.value,
        unit: wrapper.unit,
        description: wrapper.description,
      });
    } else if (value && typeof value === 'object') {
      for (const [subKey, subVal] of Object.entries(
        value as Record<string, unknown>,
      )) {
        if (!isLeaf(subVal)) continue;
        const wrapper = subVal as ConfigWrapper;
        extensions.push({
          path: `${key}.${subKey}`,
          value: wrapper.value,
          type: typeof wrapper.value,
          unit: wrapper.unit,
          description: wrapper.description,
        });
      }
    }
  }

  return extensions;
}

function isLeaf(v: unknown): boolean {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    'value' in (v as Record<string, unknown>)
  );
}

// -----------------------------------------------------------------------------
// 6. Code snippets for key files
// -----------------------------------------------------------------------------

function collectCodeSnippets(
  snapshot: ProjectSnapshot,
): Record<string, string> {
  const snippets: Record<string, string> = {};
  const keyPatterns = [
    /Base\w+\.ts$/,
    /_Template\w+\.ts$/,
    /simConfig\.json$/,
    /\bobservables\.ts$/,
    /validators\/\w+\.ts$/,
    /test\/validation\.test\.ts$/,
  ];

  for (const file of snapshot.files) {
    if (keyPatterns.some((p) => p.test(file.relativePath))) {
      snippets[file.relativePath] = file.content;
    }
  }

  return snippets;
}

// -----------------------------------------------------------------------------
// Main entry point
// -----------------------------------------------------------------------------

/**
 * Extract reusable code patterns from a completed simulator project.
 * Entirely rule-based — no LLM calls.
 */
export async function extractPatterns(
  snapshot: ProjectSnapshot,
  classification: ClassificationResult,
): Promise<ExtractedPatterns> {
  console.log('[Extractor] Analyzing file structure...');
  const fileStructure = extractDirectoryPattern(snapshot);

  console.log('[Extractor] Extracting class hierarchies...');
  const classes = extractClasses(snapshot);

  console.log('[Extractor] Extracting hooks...');
  const hooks = extractHooks(classes);

  console.log('[Extractor] Extracting import graph...');
  const imports = extractImports(snapshot);

  console.log('[Extractor] Extracting simConfig extensions...');
  const configExtensions = await extractConfigExtensions(snapshot.simConfig);

  console.log('[Extractor] Collecting code snippets...');
  const codeSnippets = collectCodeSnippets(snapshot);

  console.log(
    `[Extractor] Done: ${classes.length} classes, ${hooks.length} hooks, ` +
      `${configExtensions.length} simConfig fields, ${imports.length} imports`,
  );

  return {
    archetype: classification.archetype,
    numericProfile: classification.numericProfile,
    projectPath: snapshot.projectPath,
    fileStructure,
    classes,
    hooks,
    configExtensions,
    imports,
    codeSnippets,
  };
}
