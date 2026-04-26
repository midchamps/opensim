/**
 * Static check: every numeric field in `simConfig.json` MUST declare
 * a `unit` string. Catches the most common Phase-2 mistake (forgetting
 * to add `unit: "m"` to a length config) before it propagates into a
 * solver that mixes incompatible quantities.
 *
 * NOTE: this validator does NOT do dimensional analysis on solver
 * expressions. It only enforces that every numeric in `simConfig`
 * has DECLARED a unit, so a future static analyzer can read
 * declarations without hunting them down. Dimensional analysis is
 * out of scope for Phase 5.
 *
 * KEEP — agent code calls `checkUnitConsistency(simConfig)` from a
 * vitest test; never modify the implementation.
 */

interface ConfigField {
  value: unknown;
  type?: string;
  unit?: string;
  description?: string;
  min?: number;
  max?: number;
}

export interface UnitIssue {
  /** Dot-path in the config object, e.g. "pendulum.length". */
  path: string;
  reason: string;
}

const DEFAULT_SKIP_PATHS = new Set([
  // Three.js render infrastructure has no physical units.
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

export interface CheckOptions {
  /** Additional paths to ignore (e.g. user's own infrastructure). */
  skipPaths?: string[];
  /**
   * If `true`, also flag fields that have a `unit` set to the empty
   * string. Default `true`.
   */
  rejectEmptyUnit?: boolean;
}

/**
 * Walk `config` and return a list of issues. Empty array = clean.
 *
 * @example
 *   import simConfig from '../simConfig.json';
 *   import { checkUnitConsistency } from './validators';
 *   it('every numeric simConfig field declares a unit', () => {
 *     expect(checkUnitConsistency(simConfig)).toEqual([]);
 *   });
 */
export function checkUnitConsistency(
  config: unknown,
  options: CheckOptions = {},
): UnitIssue[] {
  const skip = new Set([...DEFAULT_SKIP_PATHS, ...(options.skipPaths ?? [])]);
  const rejectEmpty = options.rejectEmptyUnit ?? true;
  const issues: UnitIssue[] = [];
  walk(config, '', issues, skip, rejectEmpty);
  return issues;
}

function walk(
  value: unknown,
  path: string,
  issues: UnitIssue[],
  skip: Set<string>,
  rejectEmpty: boolean,
): void {
  if (skip.has(path)) return;
  if (!isPlainObject(value)) return;
  const obj = value as Record<string, unknown>;

  // A leaf field is anything with a `value` key. Anything else is a
  // namespace (recurse).
  if ('value' in obj) {
    const field = obj as unknown as ConfigField;
    if (typeof field.value === 'number') {
      if (
        field.unit === undefined ||
        (rejectEmpty &&
          typeof field.unit === 'string' &&
          field.unit.trim() === '')
      ) {
        issues.push({
          path: path || '<root>',
          reason: 'numeric field is missing a `unit` declaration',
        });
      } else if (typeof field.unit !== 'string') {
        issues.push({
          path: path || '<root>',
          reason: `\`unit\` must be a string, got ${typeof field.unit}`,
        });
      }
    }
    return;
  }

  for (const [k, v] of Object.entries(obj)) {
    walk(v, path ? `${path}.${k}` : k, issues, skip, rejectEmpty);
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
