import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  DebugProtocol,
  DebugEntry,
  ProtocolRule,
  ValidationResult,
} from './types.js';
import { getProactiveEntries } from './protocol-manager.js';

// =============================================================================
// Validator — pre-execution consistency checks guided by protocol P
// =============================================================================
//
// Corresponds to the paper's description:
//   "P includes lightweight pre-execution validations that focus on
//    high-frequency inconsistency classes discovered in prior tasks"
//
// Runs BEFORE build/test/dev to catch known issues early.
//
// Built-in proactive checks (matched by entry.signature.errorCode):
//   - SIM_CONFIG_FIELD_CONSISTENCY  — every simConfig.<field> access exists in JSON
//   - UNIT_DECLARATION              — every numeric simConfig field declares a unit
//   - SOLVER_HOOK_OVERRIDE          — every BaseSolver subclass overrides required hooks
//   - VALIDATOR_TEST_PRESENCE       — src/test/validation.test.ts uses all 4 validators
//   - DIAL_SIMCONFIG_MUTATION       — Dial onChange handlers also mutate simConfig.field.value
//   - HAND_ROLLED_INTEGRATOR        — agent code re-implements RK4 / Euler instead of subclassing
//   - IMPORT_TYPE_KEYWORD           — TypeScript "import { type … }" hygiene
// =============================================================================

/**
 * Run all proactive validations from the protocol against a project.
 *
 * @param projectDir - Absolute path to the simulator project
 * @param protocol - The current debug protocol P
 * @returns Array of validation results (one per proactive entry / rule)
 */
export async function validateProject(
  projectDir: string,
  protocol: DebugProtocol,
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  const proactiveEntries = getProactiveEntries(protocol);
  for (const entry of proactiveEntries) {
    const result = await runEntryCheck(projectDir, entry);
    results.push(result);
  }

  for (const rule of protocol.rules) {
    const result = await runRuleCheck(projectDir, rule);
    results.push(result);
  }

  return results;
}

/**
 * Run a single proactive entry check against a project.
 */
async function runEntryCheck(
  projectDir: string,
  entry: DebugEntry,
): Promise<ValidationResult> {
  const violations: string[] = [];

  switch (entry.signature.errorCode) {
    case 'SIM_CONFIG_FIELD_CONSISTENCY':
      violations.push(...(await checkSimConfigFieldConsistency(projectDir)));
      break;
    case 'UNIT_DECLARATION':
      violations.push(...(await checkUnitDeclaration(projectDir)));
      break;
    case 'SOLVER_HOOK_OVERRIDE':
      violations.push(...(await checkSolverHookOverride(projectDir)));
      break;
    case 'VALIDATOR_TEST_PRESENCE':
      violations.push(...(await checkValidatorTestPresence(projectDir)));
      break;
    case 'DIAL_SIMCONFIG_MUTATION':
      violations.push(...(await checkDialSimConfigMutation(projectDir)));
      break;
    case 'HAND_ROLLED_INTEGRATOR':
      violations.push(...(await checkHandRolledIntegrator(projectDir)));
      break;
    case 'IMPORT_TYPE_KEYWORD':
      violations.push(...(await checkImportTypeKeyword(projectDir)));
      break;
    default:
      break;
  }

  return {
    ruleId: entry.id,
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Run a generalized rule's checks against a project.
 */
async function runRuleCheck(
  projectDir: string,
  rule: ProtocolRule,
): Promise<ValidationResult> {
  const violations: string[] = [];

  for (const check of rule.checks) {
    const pattern = check.filePattern
      ? path.join(projectDir, check.filePattern)
      : projectDir;

    try {
      const files = await collectFiles(pattern);
      for (const filePath of files) {
        const content = await fs.readFile(filePath, 'utf-8');
        const regex = new RegExp(check.query, 'g');
        const matches = content.match(regex);
        if (matches) {
          violations.push(
            `${check.violationMessage} (${path.relative(projectDir, filePath)}: ${matches.length} occurrence(s))`,
          );
        }
      }
    } catch {
      // File/dir not found — skip this check
    }
  }

  return {
    ruleId: rule.id,
    passed: violations.length === 0,
    violations,
  };
}

// -----------------------------------------------------------------------------
// Concrete validation checks (OpenSim seed)
// -----------------------------------------------------------------------------

const RESERVED_CONFIG_KEYS = new Set([
  'value',
  'type',
  'unit',
  'description',
  'min',
  'max',
  'json',
  'screenSize',
  'renderConfig',
  'debugConfig',
]);

/**
 * Every `simConfig.<field>` access in code must correspond to a field
 * defined in `src/simConfig.json`.
 */
async function checkSimConfigFieldConsistency(
  projectDir: string,
): Promise<string[]> {
  const violations: string[] = [];
  const configPath = path.join(projectDir, 'src', 'simConfig.json');

  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    const allKeys = collectAllConfigKeys(config);

    const codeFiles = [
      ...(await collectFilesRecursive(path.join(projectDir, 'src'), '.ts')),
      ...(await collectFilesRecursive(path.join(projectDir, 'src'), '.tsx')),
    ];

    for (const filePath of codeFiles) {
      // Skip simConfig.json declarations themselves
      if (filePath.endsWith('simConfig.json')) continue;

      const content = await fs.readFile(filePath, 'utf-8');
      const fieldAccesses = content.matchAll(/simConfig\.(\w+)/g);
      for (const match of fieldAccesses) {
        const field = match[1]!;
        if (RESERVED_CONFIG_KEYS.has(field)) continue;
        if (!allKeys.has(field)) {
          violations.push(
            `simConfig.${field} accessed in ${path.relative(projectDir, filePath)} but not defined in src/simConfig.json`,
          );
        }
      }
    }
  } catch {
    // simConfig.json not found — skip
  }

  return violations;
}

function collectAllConfigKeys(config: Record<string, unknown>): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(config)) {
    keys.add(k);
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      !('value' in (v as Record<string, unknown>))
    ) {
      // Namespaced: collect children too so `simConfig.<ns>.field` works
      for (const subKey of Object.keys(v as Record<string, unknown>)) {
        keys.add(subKey);
      }
    }
  }
  return keys;
}

/**
 * Every leaf numeric simConfig field MUST declare a `unit`.
 * The infrastructure namespaces (screenSize / renderConfig / debugConfig)
 * are exempt and the unit `-` marks dimensionless.
 */
async function checkUnitDeclaration(projectDir: string): Promise<string[]> {
  const violations: string[] = [];
  const configPath = path.join(projectDir, 'src', 'simConfig.json');

  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(raw) as Record<string, unknown>;
    walkConfigForUnits(config, '', violations);
  } catch {
    // simConfig.json not found — skip
  }

  return violations;
}

const SKIP_UNIT_PATHS = new Set([
  'screenSize',
  'screenSize.width',
  'screenSize.height',
  'renderConfig',
  'renderConfig.shadows',
  'renderConfig.antialias',
  'debugConfig',
  'debugConfig.showGrid',
  'debugConfig.showAxes',
]);

function walkConfigForUnits(
  obj: unknown,
  pathSoFar: string,
  out: string[],
): void {
  if (SKIP_UNIT_PATHS.has(pathSoFar)) return;
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
  const record = obj as Record<string, unknown>;

  if ('value' in record) {
    if (typeof record.value === 'number') {
      const unit = record.unit;
      if (
        unit === undefined ||
        (typeof unit === 'string' && unit.trim() === '')
      ) {
        out.push(
          `simConfig field '${pathSoFar}' is numeric but missing a 'unit' declaration (use '-' for dimensionless)`,
        );
      } else if (typeof unit !== 'string') {
        out.push(
          `simConfig field '${pathSoFar}' has non-string unit (${typeof unit})`,
        );
      }
    }
    return;
  }

  for (const [k, v] of Object.entries(record)) {
    walkConfigForUnits(v, pathSoFar ? `${pathSoFar}.${k}` : k, out);
  }
}

/**
 * Every BaseSolver subclass must override the required hooks for its
 * archetype. We approximate by requiring that any class extending a
 * Base*ODE / Base*Agent / Base*PDE / etc. override at least
 * `initialState` and one of {step, rhs, updateAgent, transitionRule}.
 */
async function checkSolverHookOverride(projectDir: string): Promise<string[]> {
  const violations: string[] = [];

  const codeFiles = await collectFilesRecursive(
    path.join(projectDir, 'src'),
    '.ts',
  );

  for (const filePath of codeFiles) {
    if (/_Template\w+\.ts$/.test(filePath)) continue;
    if (/\bBase\w+\.ts$/.test(filePath)) continue;
    const content = await fs.readFile(filePath, 'utf-8');
    const classMatch = content.match(
      /class\s+(\w+)\s+extends\s+(RK4|RK45|BaseODE|BaseAgent|BasePDE|BaseMC|BaseCA)\b/,
    );
    if (!classMatch) continue;

    const className = classMatch[1]!;
    const hasInitial = /\binitialState\s*\(/.test(content);
    const hasStep =
      /\b(?:step|rhs|updateAgent|transitionRule|cellUpdate|sample)\s*\(/.test(
        content,
      );

    const missing: string[] = [];
    if (!hasInitial) missing.push('initialState()');
    if (!hasStep) missing.push('step()/rhs()/updateAgent()/...');
    if (missing.length) {
      violations.push(
        `${className} (${path.relative(projectDir, filePath)}) extends a solver base but does not override: ${missing.join(', ')}`,
      );
    }
  }

  return violations;
}

/**
 * The Phase-6 dictum: a passing simulator ships
 * `src/test/validation.test.ts` that imports every Phase-5 validator
 * and asserts on its result.
 */
async function checkValidatorTestPresence(
  projectDir: string,
): Promise<string[]> {
  const violations: string[] = [];
  const testPath = path.join(projectDir, 'src', 'test', 'validation.test.ts');

  try {
    const content = await fs.readFile(testPath, 'utf-8');
    const required = [
      'NaNDetector',
      'checkUnitConsistency',
      'checkConservation',
      'compareToAnalytic',
    ];
    for (const name of required) {
      if (!content.includes(name)) {
        violations.push(
          `src/test/validation.test.ts does not reference '${name}' — Phase-6 expects all four validators to be exercised`,
        );
      }
    }
  } catch {
    violations.push(
      'src/test/validation.test.ts is missing — Phase 6 expects it to exist with all four validators',
    );
  }

  return violations;
}

/**
 * Every `<Dial onChange={...}>` handler must update both React state
 * AND `simConfig.<field>.value` so the solver's RHS sees the new
 * value. A handler that only sets React state silently desyncs.
 */
async function checkDialSimConfigMutation(
  projectDir: string,
): Promise<string[]> {
  const violations: string[] = [];
  const codeFiles = [
    ...(await collectFilesRecursive(path.join(projectDir, 'src'), '.tsx')),
    ...(await collectFilesRecursive(path.join(projectDir, 'src'), '.ts')),
  ];

  for (const filePath of codeFiles) {
    const content = await fs.readFile(filePath, 'utf-8');
    // Find each <Dial ... onChange={(v) => ...}> block
    const dialBlocks = content.matchAll(
      /<Dial[^>]*onChange=\{([^}]+)\}[^>]*\/?>/g,
    );
    for (const m of dialBlocks) {
      const handler = m[1] ?? '';
      // The handler should mention `simConfig.` AND `.value =`. Fallback
      // patterns are also acceptable: `simConfig.x.value = v`,
      // `(simConfig as any).x.value = v`. Heuristic: search for `simConfig`.
      if (!handler.includes('simConfig')) {
        violations.push(
          `<Dial onChange> in ${path.relative(projectDir, filePath)} updates React state only — also mutate simConfig.<field>.value so the solver sees the new value`,
        );
      }
    }
  }

  return violations;
}

/**
 * Detect agent-written hand-rolled integrators — the recipe
 * `y[i+1] = y[i] + dt * F(t, y)` (Euler) or in-place RK4 outside the
 * BaseODE / RK4 hierarchy. The fix is to subclass RK4 and override
 * `rhs(t, y)`.
 */
async function checkHandRolledIntegrator(
  projectDir: string,
): Promise<string[]> {
  const violations: string[] = [];

  const codeFiles = await collectFilesRecursive(
    path.join(projectDir, 'src'),
    '.ts',
  );

  for (const filePath of codeFiles) {
    if (/(?:RK4|RK45|BaseODE|BaseSolver)\.ts$/.test(filePath)) continue;
    const content = await fs.readFile(filePath, 'utf-8');

    // Heuristic Euler: y_next = y + dt * f
    const eulerHits = content.match(/\b\w+\s*\+=\s*\bdt\s*\*\s*\w+\(/g);
    if (eulerHits && eulerHits.length > 0) {
      violations.push(
        `${path.relative(projectDir, filePath)} appears to hand-roll an Euler step (y += dt * f). Subclass RK4 and override rhs(t, y) instead.`,
      );
    }

    // Heuristic in-place RK4: declares k1, k2, k3, k4 close together
    if (
      /\bk1\b/.test(content) &&
      /\bk2\b/.test(content) &&
      /\bk3\b/.test(content) &&
      /\bk4\b/.test(content) &&
      !/\bextends\s+RK4\b/.test(content)
    ) {
      violations.push(
        `${path.relative(projectDir, filePath)} appears to re-implement RK4 (k1/k2/k3/k4) without extending the RK4 base class. Subclass RK4 instead.`,
      );
    }
  }

  return violations;
}

/**
 * Check that interface/type imports use the `type` keyword.
 */
async function checkImportTypeKeyword(projectDir: string): Promise<string[]> {
  const violations: string[] = [];
  const codeFiles = [
    ...(await collectFilesRecursive(path.join(projectDir, 'src'), '.ts')),
    ...(await collectFilesRecursive(path.join(projectDir, 'src'), '.tsx')),
  ];

  for (const filePath of codeFiles) {
    const content = await fs.readFile(filePath, 'utf-8');
    const importMatches = content.matchAll(
      /import\s*\{([^}]+)\}\s*from\s*['"](.+?)['"]/g,
    );

    for (const match of importMatches) {
      const names = match[1]!.split(',').map((n) => n.trim());
      for (const name of names) {
        if (name.startsWith('type ')) continue;
        if (
          /^I[A-Z]/.test(name) ||
          /(?:Config|Props|Options|Params|State|Result|Spec|Profile)$/.test(
            name,
          )
        ) {
          violations.push(
            `Possible interface '${name}' imported without 'type' keyword in ${path.relative(projectDir, filePath)}`,
          );
        }
      }
    }
  }

  return violations;
}

// -----------------------------------------------------------------------------
// File utilities
// -----------------------------------------------------------------------------

/** Recursively collect files matching a simple glob pattern. */
async function collectFiles(pattern: string): Promise<string[]> {
  const parts = pattern.split('**');
  if (parts.length < 2) {
    try {
      const stat = await fs.stat(pattern);
      if (stat.isFile()) return [pattern];
      return [];
    } catch {
      return [];
    }
  }

  const baseDir = parts[0]!.replace(/[/\\]$/, '');
  const ext = parts[parts.length - 1]!.replace(/^[/\\]\*/, '');

  return collectFilesRecursive(baseDir, ext);
}

async function collectFilesRecursive(
  dir: string,
  ext: string,
): Promise<string[]> {
  const result: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === '.git'
        ) {
          continue;
        }
        result.push(...(await collectFilesRecursive(fullPath, ext)));
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        result.push(fullPath);
      }
    }
  } catch {
    // Directory not accessible
  }
  return result;
}
