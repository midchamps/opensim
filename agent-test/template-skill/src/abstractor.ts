import type {
  ExtractedPatterns,
  AbstractedTemplates,
  TemplateFileDef,
} from './types.js';
import { getAbstractorConfig, type LLMConfig } from './config.js';

// =============================================================================
// Abstractor — LLM-driven template generalization
// =============================================================================

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

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
// System prompt for abstraction
// -----------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `# OpenSim Template Abstractor

You are a numerical-methods code analyst. Your task is to take CONCRETE
simulator code extracted from a completed project and generalize it into
REUSABLE archetype-template code suitable for being checked in under
\`agent-test/templates/modules/<archetype>/\`.

## Your Goals

1. **Identify stable patterns**: Code that would appear in ANY simulator of
   this archetype:
   - ODE: BaseODE / RK4 (KEEP), \`rhs(t, y)\` / \`initialState()\` overrides,
     observable helpers (computeKE, computePE, computeE_total).
   - PDE: BasePDE / Laplacian5 (KEEP), per-step stencil application,
     boundary-condition helpers.
   - agent_based: BaseAgent (KEEP), \`updateAgent(self, neighbors, dt)\`,
     spatial-neighbor helpers.
   - monte_carlo: BaseMC (KEEP), sampler, variance-reduction helpers.
   - cellular_automata: BaseCA (KEEP), transition rule, neighbor mask.

2. **Replace simulator-specific content** with generic placeholders:
   - Specific class names ("DampedPendulumODE") → "_TemplateODE"
   - Hardcoded values in \`rhs()\` / \`updateAgent()\` → references via
     \`simConfig.<field>.value\`
   - Specific state-vector indices ([0]=theta, [1]=omega) → TODO comment
     marking the agent should pick its own state shape
   - Specific observables (E_total) → leave a TODO showing the pattern

3. **Preserve the architecture**: Keep BaseSolver / BaseODE / BaseAgent
   class hierarchies, abstract method signatures, and lifecycle hooks
   intact. Do NOT rename hooks (\`step\`, \`rhs\`, \`updateAgent\`,
   \`initialState\`) — those names are part of the contract.

4. **Mark extension points**: Add \`// TODO\` comments where simulation-
   specific customisation should happen (RHS expression, initial
   conditions, agent count, integrator step size).

## Output Format

Return a JSON object with this structure:
{
  "templateFiles": [
    {
      "relativePath": "src/solvers/_TemplateODE.ts",
      "content": "// ... generalized TypeScript code ...",
      "role": "base_class" | "copy_template" | "integrator" | "validator" | "lab_object" | "visualization" | "utility"
    }
  ],
  "summary": "Brief description of what this archetype family provides"
}

## Rules
- Output VALID JSON only (no markdown fences around the top-level JSON).
- Template file contents must be valid TypeScript.
- Keep imports but generalize paths (use deploy-time relative paths like
  \`./BaseSolver\` not source-repo paths like \`../../core/src/solvers/BaseSolver\`).
- **base_class**: Engine code that should NOT be modified by the agent
  (BaseSolver, BaseODE, RK4, BaseAgent, NaNDetector, etc.).
- **copy_template**: Files meant to be copied and customised
  (\`_Template*.ts\`).
- **integrator**: Concrete integrators / steppers that ship with the
  archetype (RK4, RK45, Laplacian5).
- **validator**: Phase-5 validators (NaNDetector, checkUnitConsistency,
  checkConservation, compareToAnalytic).
- **lab_object**: 3D scene objects bound to solver state (Pendulum,
  AgentSwarm, HeatPanel).
- **visualization**: Wall-monitor visualisers (TimeSeriesPlot,
  PhasePortrait, Heatmap).
- **utility**: Cross-cutting helpers (observables.ts).`;
}

function buildUserPrompt(patterns: ExtractedPatterns): string {
  const parts: string[] = [];

  parts.push(`## Archetype: ${patterns.archetype}`);
  const np = patterns.numericProfile;
  parts.push(
    `## Numeric profile: spatial=${np.hasSpatialDomain}, time=${np.timeEvolution}, ` +
      `stochastic=${np.stochastic}, solver=${np.solverClass}`,
  );

  // File structure
  parts.push('\n## Directory Structure');
  for (const dir of patterns.fileStructure.directories) {
    const files = patterns.fileStructure.filesByDirectory[dir] ?? [];
    parts.push(`${dir}/: ${files.join(', ')}`);
  }

  // Class hierarchy
  parts.push('\n## Class Hierarchy');
  for (const cls of patterns.classes) {
    const ext = cls.parentClass ? ` extends ${cls.parentClass}` : '';
    const abs = cls.isAbstract ? 'abstract ' : '';
    parts.push(`- ${abs}${cls.name}${ext} (${cls.filePath})`);
    for (const m of cls.methods.filter((m) => m.isAbstract || m.isOverride)) {
      parts.push(`    ${m.signature}`);
    }
  }

  // Hooks
  parts.push('\n## Hooks');
  for (const hook of patterns.hooks) {
    const abs = hook.isAbstract ? ' [ABSTRACT]' : '';
    parts.push(`- ${hook.declaringClass}::${hook.name}${abs}`);
  }

  // Config extensions
  if (patterns.configExtensions.length > 0) {
    parts.push('\n## simConfig Extensions (beyond M0 baseline)');
    for (const cf of patterns.configExtensions) {
      const unit = cf.unit ? ` [${cf.unit}]` : '';
      parts.push(
        `- ${cf.path}: ${JSON.stringify(cf.value)} (${cf.type})${unit}`,
      );
    }
  }

  // Code snippets (limited to key files)
  parts.push('\n## Key Source Code');
  const snippetEntries = Object.entries(patterns.codeSnippets);
  for (const [filePath, code] of snippetEntries.slice(0, 8)) {
    const truncated = code.slice(0, 3000);
    parts.push(`\n### ${filePath}\n\`\`\`typescript\n${truncated}\n\`\`\``);
  }

  parts.push(
    '\n\nGeneralize this into a reusable archetype-template family for the OpenSim ' +
      'templates/modules/<archetype>/ tree. Replace simulator-specific content with ' +
      'placeholders and `simConfig.<field>.value` references. Focus on the BASE CLASSES, ' +
      'INTEGRATORS, and VALIDATOR usage that would be reusable across different ' +
      'simulators of this archetype. Output JSON only.',
  );

  return parts.join('\n');
}

// -----------------------------------------------------------------------------
// Parse LLM response
// -----------------------------------------------------------------------------

interface LLMAbstractionResponse {
  templateFiles: Array<{
    relativePath: string;
    content: string;
    role: string;
  }>;
  summary: string;
}

function parseLLMResponse(raw: string): LLMAbstractionResponse {
  let jsonStr = raw.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr
      .replace(/```json?\n?/g, '')
      .replace(/```/g, '')
      .trim();
  }
  return JSON.parse(jsonStr) as LLMAbstractionResponse;
}

// -----------------------------------------------------------------------------
// Fallback: rule-based abstraction (when LLM unavailable)
// -----------------------------------------------------------------------------

function abstractByRules(patterns: ExtractedPatterns): AbstractedTemplates {
  const templateFiles: TemplateFileDef[] = [];

  for (const [filePath, code] of Object.entries(patterns.codeSnippets)) {
    if (/Base\w+\.ts$/.test(filePath)) {
      templateFiles.push({
        relativePath: filePath,
        content: code,
        role: 'base_class',
      });
    } else if (/_Template\w+\.ts$/.test(filePath)) {
      templateFiles.push({
        relativePath: filePath,
        content: code,
        role: 'copy_template',
      });
    } else if (/(?:RK4|RK45|Laplacian|Stencil)\.ts$/.test(filePath)) {
      templateFiles.push({
        relativePath: filePath,
        content: code,
        role: 'integrator',
      });
    } else if (/validators\/\w+\.ts$/.test(filePath)) {
      templateFiles.push({
        relativePath: filePath,
        content: code,
        role: 'validator',
      });
    } else if (/lab\/lab_objects\/\w+\.tsx?$/.test(filePath)) {
      templateFiles.push({
        relativePath: filePath,
        content: code,
        role: 'lab_object',
      });
    } else if (/lab\/visualization\/\w+\.tsx?$/.test(filePath)) {
      templateFiles.push({
        relativePath: filePath,
        content: code,
        role: 'visualization',
      });
    } else if (/observables\.ts$/.test(filePath)) {
      templateFiles.push({
        relativePath: filePath,
        content: code,
        role: 'utility',
      });
    }
  }

  return {
    archetype: patterns.archetype,
    templateFiles,
    hooks: patterns.hooks,
    configSchema: patterns.configExtensions,
    summary:
      `Rule-based abstraction for ${patterns.archetype}: ` +
      `${templateFiles.length} template files, ${patterns.hooks.length} hooks`,
  };
}

// -----------------------------------------------------------------------------
// Main entry point
// -----------------------------------------------------------------------------

/**
 * Abstract extracted patterns into generalized, reusable archetype templates.
 * Tries LLM first, falls back to rule-based extraction.
 */
export async function abstractPatterns(
  patterns: ExtractedPatterns,
): Promise<AbstractedTemplates> {
  const config = getAbstractorConfig();

  if (config.apiKey) {
    try {
      console.log(`[Abstractor] Calling LLM (${config.modelName})...`);
      const systemPrompt = buildSystemPrompt();
      const userPrompt = buildUserPrompt(patterns);
      const raw = await callLLM(config, systemPrompt, userPrompt);
      const parsed = parseLLMResponse(raw);

      const templateFiles: TemplateFileDef[] = parsed.templateFiles.map(
        (f) => ({
          relativePath: f.relativePath,
          content: f.content,
          role: f.role as TemplateFileDef['role'],
        }),
      );

      console.log(
        `[Abstractor] LLM produced ${templateFiles.length} template files`,
      );

      return {
        archetype: patterns.archetype,
        templateFiles,
        hooks: patterns.hooks,
        configSchema: patterns.configExtensions,
        summary: parsed.summary,
      };
    } catch (e) {
      console.warn(`[Abstractor] LLM failed, falling back to rules: ${e}`);
    }
  } else {
    console.log('[Abstractor] No API key, using rule-based abstraction');
  }

  const result = abstractByRules(patterns);
  console.log(
    `[Abstractor] Rule-based: ${result.templateFiles.length} template files`,
  );
  return result;
}
