import type {
  ProjectSnapshot,
  ClassificationResult,
  NumericProfile,
  TemplateLibrary,
  TemplateFamily,
} from './types.js';
import { getClassifierConfig, type LLMConfig } from './config.js';

// =============================================================================
// Classifier — Library-aware, archetype-anchored simulator classification
//
// Key design principle: the FIVE canonical archetypes from the upstream
// `simulation-type-classifier` tool (ode_system / pde_grid / agent_based /
// monte_carlo / cellular_automata) are the default labels. The library is
// allowed to discover refined sub-labels (e.g. "ode_system:stiff",
// "agent_based:flocking") only when an existing family has clearly diverged.
// - When the library is empty, the LLM names the archetype using the
//   canonical five.
// - When the library already has families, the LLM is shown each family's
//   numeric profile and decides whether to reuse the family or split.
// - The rule-based fallback also uses library state, matching against code
//   signatures previously recorded in each family.
// =============================================================================

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

const CANONICAL_ARCHETYPES = [
  'ode_system',
  'pde_grid',
  'agent_based',
  'monte_carlo',
  'cellular_automata',
] as const;

// -----------------------------------------------------------------------------
// Prompt construction
// -----------------------------------------------------------------------------

function buildSystemPrompt(library: TemplateLibrary): string {
  const familySection =
    library.families.length > 0
      ? buildExistingFamiliesSection(library.families)
      : `## Existing Families\nNone yet. Use one of the five canonical archetypes for the first family.\n`;

  return `# OpenSim Project Numerical-Scheme Classifier

You analyze COMPLETED simulator project source code to determine which
NUMERICAL ARCHETYPE its solver belongs to. You do NOT rely on scientific
domain (biology vs. physics vs. economics) — you observe the actual solver
class hierarchy, state shape, and integration scheme in the code.

## Five Canonical Archetypes

1. **ode_system** — finite state vector y(t), evolution dy/dt = F(t, y),
   solver class is a time integrator (RK4, RK45, Euler-Maruyama).
   Evidence: \`extends RK4\`, \`extends BaseODE\`, \`rhs(t, y)\` method,
   state is a number[] of size 2-10.

2. **pde_grid** — fields u(x, y, t) on a regular grid, evolution by
   spatial stencil (Laplacian, gradient). Solver class applies a
   per-step finite-difference stencil.
   Evidence: \`extends BasePDE\`, Float64Array fields, dx/dy/dt config,
   stencil math in step().

3. **agent_based** — list of autonomous agents with local rules and
   neighbor queries. Solver class iterates per-agent updates with a
   spatial-neighbor lookup.
   Evidence: \`extends BaseAgent\`, agent record { position, velocity, ... },
   updateAgent(self, neighbors, dt), neighborRadius.

4. **monte_carlo** — statistical estimators built up by repeated
   random sampling. Solver class accumulates samples and reports a
   running mean/variance.
   Evidence: \`extends BaseMC\`, sample accumulator, variance reduction,
   step() draws an RNG sample.

5. **cellular_automata** — grid of cells in a finite alphabet,
   synchronous local update rule.
   Evidence: \`extends BaseCA\`, cell grid (Uint8Array or 2D number[]),
   neighbor masks, transition rule.

${familySection}
## Your Task

1. Determine the **NumericProfile** by reading the solver / state code:
   - **hasSpatialDomain**: does the simulation live on a spatial domain
     (true for pde_grid, agent_based, cellular_automata; false for
     ode_system and monte_carlo).
   - **timeEvolution**: 'continuous' for ODE/PDE, 'discrete' for the
     other three.
   - **stochastic**: true if RNG is core to the dynamics
     (monte_carlo, sometimes agent_based, sometimes ode_system with
     Euler-Maruyama).
   - **solverClass**: 'time_integrator' / 'pde_stencil' / 'agent_step'
     / 'sampler' / 'cell_update' (one-to-one with archetype).

2. Decide classification:
${
  library.families.length > 0
    ? `   - If the numeric profile MATCHES an existing family, reuse its archetype.
   - Only mint a refined sub-label (e.g. "ode_system:stiff",
     "agent_based:flocking") if the new project clearly deserves a
     separate family within the same canonical archetype.
   - If the project doesn't fit any of the five canonical archetypes,
     report archetype "unknown" with low confidence rather than
     inventing one — that signals a Phase-7-skill out-of-scope project.`
    : `   - Use one of the five canonical archetypes for the label.
   - If the project doesn't fit any of the five, report archetype
     "unknown" with low confidence.`
}

## Output Format

Respond with ONLY a JSON object:
{
  "archetype": "ode_system" | "pde_grid" | "agent_based" | "monte_carlo" | "cellular_automata" | "<refined sublabel>" | "unknown",
  "reasoning": "Brief explanation citing specific code evidence (file path, class name, hook signature)",
  "numericProfile": {
    "hasSpatialDomain": true | false,
    "timeEvolution": "continuous" | "discrete",
    "stochastic": true | false,
    "solverClass": "time_integrator" | "pde_stencil" | "agent_step" | "sampler" | "cell_update"
  },
  "confidence": 0.0 to 1.0
}`;
}

function buildExistingFamiliesSection(families: TemplateFamily[]): string {
  const lines = ['## Existing Families in the Library\n'];
  for (const f of families) {
    const np = f.numericProfile;
    lines.push(
      `### "${f.archetype}" (stability: ${(f.stability * 100).toFixed(0)}%, projects: ${f.contributingProjects.length})`,
    );
    lines.push(
      `- spatial: ${np.hasSpatialDomain}, time: ${np.timeEvolution}, stochastic: ${np.stochastic}, solver: ${np.solverClass}`,
    );
    lines.push(`- summary: ${f.summary}`);
    lines.push('');
  }
  lines.push(
    'If the new project clearly fits one of these, reuse its archetype name.',
  );
  lines.push(
    'Only create a refined sub-label if the numeric profile deserves a split within the same canonical archetype.\n',
  );
  return lines.join('\n');
}

function buildUserPrompt(snapshot: ProjectSnapshot): string {
  const truncatedSummary = snapshot.codeSummary.slice(0, 12_000);
  return `Classify this completed simulator project based on its source code.

## File Tree
${snapshot.fileTree.join('\n')}

## Code Analysis
${truncatedSummary}

Analyze the SOLVER CLASS HIERARCHY, STATE SHAPE, and INTEGRATION SCHEME in the actual code. Output JSON only.`;
}

// -----------------------------------------------------------------------------
// LLM call
// -----------------------------------------------------------------------------

async function callLLM(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LLM API ${response.status}: ${body}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    if (data.error) throw new Error(`LLM Error: ${data.error.message}`);

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM returned empty content');
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

// -----------------------------------------------------------------------------
// Parse LLM response
// -----------------------------------------------------------------------------

function defaultProfileFor(arch: string): NumericProfile {
  switch (arch) {
    case 'pde_grid':
      return {
        hasSpatialDomain: true,
        timeEvolution: 'continuous',
        stochastic: false,
        solverClass: 'pde_stencil',
      };
    case 'agent_based':
      return {
        hasSpatialDomain: true,
        timeEvolution: 'discrete',
        stochastic: true,
        solverClass: 'agent_step',
      };
    case 'monte_carlo':
      return {
        hasSpatialDomain: false,
        timeEvolution: 'discrete',
        stochastic: true,
        solverClass: 'sampler',
      };
    case 'cellular_automata':
      return {
        hasSpatialDomain: true,
        timeEvolution: 'discrete',
        stochastic: false,
        solverClass: 'cell_update',
      };
    case 'ode_system':
    default:
      return {
        hasSpatialDomain: false,
        timeEvolution: 'continuous',
        stochastic: false,
        solverClass: 'time_integrator',
      };
  }
}

function parseClassification(raw: string): ClassificationResult {
  let jsonStr = raw.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr
      .replace(/```json?\n?/g, '')
      .replace(/```/g, '')
      .trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    const archetype = (parsed.archetype as string) ?? 'unknown';
    return {
      archetype,
      reasoning: parsed.reasoning ?? '',
      numericProfile: parsed.numericProfile ?? defaultProfileFor(archetype),
      confidence: parsed.confidence ?? 0.5,
    };
  } catch {
    return classifyByCodeHeuristics(raw, []);
  }
}

// -----------------------------------------------------------------------------
// Rule-based fallback — anchored to the five canonical archetypes
//
// Each archetype gets a list of code-pattern fingerprints. We score the
// snapshot against each archetype's patterns and pick the highest-scoring.
// -----------------------------------------------------------------------------

interface ArchetypeFingerprint {
  archetype: (typeof CANONICAL_ARCHETYPES)[number];
  patterns: RegExp[];
  profile: NumericProfile;
}

const ARCHETYPE_FINGERPRINTS: ArchetypeFingerprint[] = [
  {
    archetype: 'ode_system',
    patterns: [
      /extends\s+RK4\b/,
      /extends\s+BaseODE\b/,
      /\brhs\s*\(/,
      /BaseSolver<\s*ODEState\s*>/,
      /\bRK45\b/,
    ],
    profile: defaultProfileFor('ode_system'),
  },
  {
    archetype: 'pde_grid',
    patterns: [
      /extends\s+BasePDE\b/,
      /Laplacian5\b/,
      /\bdx\b.*\bdy\b/,
      /Float64Array\(\s*\w+\s*\*\s*\w+\s*\)/,
      /\bstencil\b/i,
    ],
    profile: defaultProfileFor('pde_grid'),
  },
  {
    archetype: 'agent_based',
    patterns: [
      /extends\s+BaseAgent\b/,
      /updateAgent\s*\(/,
      /\bneighborRadius\b/,
      /findNeighbors\s*\(/,
      /\b(?:position|velocity)\s*:\s*\[/,
    ],
    profile: defaultProfileFor('agent_based'),
  },
  {
    archetype: 'monte_carlo',
    patterns: [
      /extends\s+BaseMC\b/,
      /\bsamples?Mean\b/i,
      /\bvarianceReduction\b/i,
      /Math\.random\(\)\s*[<>]/,
      /\b(?:antithetic|importance)Sampling\b/i,
    ],
    profile: defaultProfileFor('monte_carlo'),
  },
  {
    archetype: 'cellular_automata',
    patterns: [
      /extends\s+BaseCA\b/,
      /Uint8Array\(\s*\w+\s*\*\s*\w+\s*\)/,
      /\btransitionRule\b/i,
      /\bneighborMask\b/i,
      /\bcellGrid\b/i,
    ],
    profile: defaultProfileFor('cellular_automata'),
  },
];

/**
 * Detect archetype-specific code fingerprints. Then try to match
 * against existing families before falling back to the canonical
 * archetype label.
 */
export function classifyByCodeHeuristics(
  code: string,
  existingFamilies: TemplateFamily[],
): ClassificationResult {
  const scores: Array<{ fp: ArchetypeFingerprint; score: number }> = [];
  for (const fp of ARCHETYPE_FINGERPRINTS) {
    let score = 0;
    for (const pat of fp.patterns) {
      if (pat.test(code)) score += 1;
    }
    scores.push({ fp, score });
  }

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0]!;
  const totalMatches = scores.reduce((s, v) => s + v.score, 0);

  if (totalMatches === 0) {
    return {
      archetype: 'unknown',
      reasoning:
        'No canonical-archetype code fingerprint matched. Either the project is out of OpenSim scope or the solver names have been renamed.',
      numericProfile: defaultProfileFor('ode_system'),
      confidence: 0.1,
    };
  }

  const detectedProfile = best.fp.profile;

  // Try to match an existing family on numeric profile
  for (const family of existingFamilies) {
    const fp = family.numericProfile;
    if (
      fp.hasSpatialDomain === detectedProfile.hasSpatialDomain &&
      fp.timeEvolution === detectedProfile.timeEvolution &&
      fp.stochastic === detectedProfile.stochastic &&
      fp.solverClass === detectedProfile.solverClass
    ) {
      return {
        archetype: family.archetype,
        reasoning:
          `Heuristic match to existing family "${family.archetype}" ` +
          `(canonical archetype: ${best.fp.archetype}, fingerprints: ${best.score}/${totalMatches})`,
        numericProfile: detectedProfile,
        confidence: totalMatches > 0 ? best.score / totalMatches : 0.2,
      };
    }
  }

  return {
    archetype: best.fp.archetype,
    reasoning:
      `Canonical archetype "${best.fp.archetype}" detected by code fingerprints ` +
      `(score: ${best.score}/${totalMatches})`,
    numericProfile: detectedProfile,
    confidence: totalMatches > 0 ? best.score / totalMatches : 0.2,
  };
}

// -----------------------------------------------------------------------------
// Main entry point
// -----------------------------------------------------------------------------

/**
 * Classify a completed simulator project's archetype.
 *
 * The classifier is LIBRARY-AWARE:
 * - It receives the current library state so it can compare against
 *   existing families before creating a new (sub-)archetype label.
 * - When the library is empty, it labels the project using one of
 *   the five canonical archetypes.
 * - Tries LLM first; falls back to code-fingerprint heuristics.
 */
export async function classifyProject(
  snapshot: ProjectSnapshot,
  library: TemplateLibrary,
): Promise<ClassificationResult> {
  const config = getClassifierConfig();

  const allCode = snapshot.files
    .filter((f) => f.extension === '.ts' || f.extension === '.tsx')
    .map((f) => f.content)
    .join('\n');

  if (config.apiKey) {
    try {
      console.log(
        `[Classifier] Calling LLM (${config.modelName}), ` +
          `library has ${library.families.length} existing families...`,
      );
      const systemPrompt = buildSystemPrompt(library);
      const userPrompt = buildUserPrompt(snapshot);
      const raw = await callLLM(config, systemPrompt, userPrompt);
      const result = parseClassification(raw);
      console.log(
        `[Classifier] LLM result: "${result.archetype}" (confidence: ${result.confidence})`,
      );
      return result;
    } catch (e) {
      console.warn(`[Classifier] LLM failed, falling back to heuristics: ${e}`);
    }
  } else {
    console.log(
      '[Classifier] No API key configured, using heuristic classification',
    );
  }

  const result = classifyByCodeHeuristics(allCode, library.families);
  console.log(
    `[Classifier] Heuristic result: "${result.archetype}" (confidence: ${result.confidence})`,
  );
  return result;
}
