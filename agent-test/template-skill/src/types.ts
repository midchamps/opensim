// =============================================================================
// Template Skill — Core Type Definitions (OpenSim)
// =============================================================================

/**
 * Simulation archetype label. The five canonical archetypes are
 * `ode_system`, `pde_grid`, `agent_based`, `monte_carlo`, and
 * `cellular_automata` (mirrored from the upstream
 * `simulation-type-classifier` tool). Treated as a string here so the
 * library can also accept refined sub-archetype labels that emerge
 * over time (e.g. "ode_system:stiff", "agent_based:flocking").
 */
export type SimulationArchetype = string;

// -----------------------------------------------------------------------------
// Numeric Profile — replaces PhysicsProfile from the game-domain version
// -----------------------------------------------------------------------------

/**
 * Coarse numerical fingerprint of a simulator. Captures the four
 * dimensions the upstream `simulation-type-classifier` tool also
 * uses, so library entries are directly comparable to fresh
 * classifications coming off the prompt.
 */
export interface NumericProfile {
  hasSpatialDomain: boolean;
  timeEvolution: 'continuous' | 'discrete';
  stochastic: boolean;
  solverClass:
    | 'time_integrator'
    | 'pde_stencil'
    | 'agent_step'
    | 'sampler'
    | 'cell_update';
}

// -----------------------------------------------------------------------------
// Project Snapshot (Collector output)
// -----------------------------------------------------------------------------

export interface FileEntry {
  /** Relative path from project root, e.g. "src/DampedPendulumODE.ts" */
  relativePath: string;
  content: string;
  extension: string;
}

export interface ProjectSnapshot {
  projectPath: string;
  files: FileEntry[];
  fileTree: string[];
  /** Parsed `simConfig.json` if present, else `null`. */
  simConfig: Record<string, unknown> | null;
  /** Human-readable summary for LLM context */
  codeSummary: string;
}

// -----------------------------------------------------------------------------
// Classification Result (Classifier output)
// -----------------------------------------------------------------------------

export interface ClassificationResult {
  archetype: SimulationArchetype;
  reasoning: string;
  numericProfile: NumericProfile;
  confidence: number;
}

// -----------------------------------------------------------------------------
// Extracted Patterns (Extractor output)
// -----------------------------------------------------------------------------

export interface ClassDef {
  name: string;
  parentClass: string | null;
  filePath: string;
  isAbstract: boolean;
  methods: MethodDef[];
}

export interface MethodDef {
  name: string;
  visibility: 'public' | 'protected' | 'private';
  isAbstract: boolean;
  isOverride: boolean;
  /** Simplified signature string */
  signature: string;
}

export interface HookDef {
  name: string;
  /** Which base class declares this hook */
  declaringClass: string;
  signature: string;
  isAbstract: boolean;
  /** How many projects use this hook */
  occurrenceCount: number;
}

export interface ImportEdge {
  fromFile: string;
  toFile: string;
  importedNames: string[];
}

export interface DirectoryPattern {
  /** e.g., ["solvers", "validators", "lab"] */
  directories: string[];
  /** e.g., { "solvers": ["BaseODE.ts", "RK4.ts"], ... } */
  filesByDirectory: Record<string, string[]>;
}

export interface ConfigField {
  /** Dot path in simConfig.json, e.g. "pendulum.length" */
  path: string;
  value: unknown;
  type: string;
  /** SI unit string if present (`m`, `kg`, `s`, `1/s`, `-`). */
  unit?: string;
  description?: string;
}

export interface ExtractedPatterns {
  archetype: SimulationArchetype;
  numericProfile: NumericProfile;
  projectPath: string;
  fileStructure: DirectoryPattern;
  classes: ClassDef[];
  hooks: HookDef[];
  configExtensions: ConfigField[];
  imports: ImportEdge[];
  /** Raw code snippets for base classes / key files */
  codeSnippets: Record<string, string>;
}

// -----------------------------------------------------------------------------
// Abstracted Templates (Abstractor output)
// -----------------------------------------------------------------------------

export interface TemplateFileDef {
  /** Relative path in the family, e.g. "src/solvers/BaseODE.ts" */
  relativePath: string;
  /** Generalized content (project-specific names replaced with placeholders) */
  content: string;
  /** Role: base_class, copy_template, integrator, validator, lab_object, visualization, utility */
  role:
    | 'base_class'
    | 'copy_template'
    | 'integrator'
    | 'validator'
    | 'lab_object'
    | 'visualization'
    | 'utility';
}

export interface AbstractedTemplates {
  archetype: SimulationArchetype;
  templateFiles: TemplateFileDef[];
  hooks: HookDef[];
  configSchema: ConfigField[];
  /** Natural-language summary of what this family provides */
  summary: string;
}

// -----------------------------------------------------------------------------
// Template Family (Library unit)
// -----------------------------------------------------------------------------

export interface TemplateFamily {
  id: string;
  archetype: SimulationArchetype;
  numericProfile: NumericProfile;
  /** Which task number first discovered this family */
  discoveredAtTask: number;
  /** Paths of projects that contributed to this family */
  contributingProjects: string[];
  /** 0–1 score: higher = more projects have reinforced this family */
  stability: number;
  fileStructure: DirectoryPattern;
  baseClasses: ClassDef[];
  hooks: HookDef[];
  configExtensions: ConfigField[];
  templateFiles: TemplateFileDef[];
  summary: string;
}

// -----------------------------------------------------------------------------
// Evolution Log Entry
// -----------------------------------------------------------------------------

export interface EvolutionEntry {
  taskId: string;
  timestamp: string;
  projectPath: string;
  archetype: SimulationArchetype;
  action: 'created_family' | 'merged_to_family';
  familyId: string;
  patternsExtracted: number;
  patternsMerged: number;
}

// -----------------------------------------------------------------------------
// Template Library (top-level persistent state)
// -----------------------------------------------------------------------------

export interface TemplateLibrary {
  version: number;
  createdAt: string;
  updatedAt: string;
  metaTemplatePath: string;
  families: TemplateFamily[];
  evolutionLog: EvolutionEntry[];
}
