import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  type ToolInvocation,
  type ToolResult,
} from './tools.js';
import { ToolErrorType } from './tool-error.js';
// eslint-disable-next-line import/no-internal-modules
import type { Config } from '../config/config.js';
import { ToolNames, ToolDisplayNames } from './tool-names.js';
// eslint-disable-next-line import/no-internal-modules
import { resolveProviderConfig } from '../services/providerConfig.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { SimulationArchetype } from './simulation-type-classifier.js';

/**
 * OpenSim's simulation analogue of generate_gdd.
 *
 * Reads the universal protocol rules + archetype-specific design /
 * template-api docs (when they exist), then asks the reasoning model
 * to produce a six-section *Experiment Protocol Document* — the
 * "contract" each later phase consumes. Same contract pattern as the
 * GDD: each section maps 1:1 to a downstream tool / file.
 */
export interface GenerateProtocolParams {
  /** User's free-form simulation idea (echoed straight from the prompt). */
  raw_user_requirement: string;
  /** Simulation archetype, supplied by classify_simulation_type. */
  archetype: SimulationArchetype;
  /** Optional config summary if the agent already read simConfig.json. */
  config_summary?: string;
}

export interface ProtocolModelConfig {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  temperature?: number;
  timeout?: number;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

class GenerateProtocolInvocation extends BaseToolInvocation<
  GenerateProtocolParams,
  ToolResult
> {
  /** Lazy-resolved on first execute() so missing keys surface as tool errors. */
  private resolvedModelConfig?: ProtocolModelConfig;

  constructor(
    private config: Config,
    params: GenerateProtocolParams,
    private overrideModelConfig?: ProtocolModelConfig,
  ) {
    super(params);
  }

  private get modelConfig(): ProtocolModelConfig {
    if (this.overrideModelConfig) return this.overrideModelConfig;
    if (!this.resolvedModelConfig) {
      this.resolvedModelConfig = GenerateProtocolTool.resolveModelConfig(
        this.config,
      );
    }
    return this.resolvedModelConfig;
  }

  getDescription(): string {
    return `Generate Protocol for ${this.params.archetype}.`;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    try {
      const systemPrompt = await this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt();
      const response = await this.callModel(systemPrompt, userPrompt, signal);

      const llmContent = `<protocol-content>
${response}
</protocol-content>

<system-reminder>
PROTOCOL DOCUMENT GENERATED for archetype: **${this.params.archetype}**

## NOW: Save Protocol
Save the content between <protocol-content> tags to \`PROTOCOL.md\`.

## Next Steps (follow Protocol sections):

### Phase 3: Assets (use Protocol Section 1 — Assets / Data)
- Read \`docs/asset_protocol.md\` for the simulator-domain asset rules.
- Call \`generate_simulation_assets\` if any datasets / parameter tables
  / external lookups are required by Section 1. Most ODE simulations
  need NOTHING here and should skip straight to Phase 4.

### Phase 4: Config (use Protocol Section 2 — Variables & Units)
- MERGE Protocol Section 2 fields INTO the existing
  \`src/simConfig.json\`. Every field must use the wrapper format
  \`{ "value": X, "type": "...", "unit": "...", "description": "..." }\`.
  Never delete the infrastructure fields (\`screenSize\`,
  \`renderConfig\`, \`debugConfig\`).

### Phase 5: Code Implementation (use Protocol Sections 0, 3, 4, 5)
- **Section 0** — system overview & hypothesis.
- **Section 3** — numerical scheme: pick the solver from
  \`docs/modules/${this.params.archetype}/template_api.md\`,
  configure dt / tolerances.
- **Section 4** — lab layout: which lab_objects + instruments +
  visualization to mount in App.tsx (children of \`<BaseLabScene>\`).
- **Section 5** — observables: which DigitalReadout / ChartMonitor
  shows what.

### Phase 6: Verify
- Read \`docs/debug_protocol.md\` (numerical-validation checklist).
- Run \`npm run build\` and \`npm run dev\`. Validators check NaN
  propagation, unit consistency, and any conservation laws stated
  in Section 6.

DO NOT STOP. CONTINUE TO PHASE 3 NOW.
</system-reminder>`;

      return {
        llmContent,
        returnDisplay: this.formatDisplayOutput(response),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        llmContent: `Error generating Protocol: ${message}`,
        returnDisplay: `**Protocol Generation Failed**\n\nError: ${message}`,
        error: { message, type: ToolErrorType.EXECUTION_FAILED },
      };
    }
  }

  /**
   * Combine universal protocol rules + archetype-specific design and
   * template-API docs into a single system prompt. Each doc is read
   * from disk if present and falls back to a terse built-in stub if
   * not — that keeps Gate 3 unblocked while Phase 4+ fills in the
   * archetype docs.
   */
  private async buildSystemPrompt(): Promise<string> {
    const docsDir = await this.findDocsDir();
    const archetype = this.params.archetype;

    let core = '';
    if (docsDir) {
      core = await readIfExists(path.join(docsDir, 'protocol', 'core.md'));
    }
    let designRules = '';
    let templateApi = '';
    if (docsDir) {
      designRules = await readIfExists(
        path.join(docsDir, 'modules', archetype, 'design_rules.md'),
      );
      templateApi = await readIfExists(
        path.join(docsDir, 'modules', archetype, 'template_api.md'),
      );
    }

    let prompt = `# Experiment Protocol Document Generator

You are a numerical-experiment design engineer. Produce a *technical
Protocol Document* — a specification where every section maps to a
downstream tool input or code file, exactly the way OpenGame's GDD
does for games.

**Archetype**: ${archetype}

**Core Rules:**
1. **Faithful**: implement the user's stated experiment, no creative
   additions.
2. **Config-First**: every numeric value goes in \`simConfig.json\`
   using \`{ "value": X, "type": "...", "unit": "...", "description": "..." }\`.
3. **Zero Custom Solvers**: use solvers / stencils / RNGs from the
   archetype's \`template_api.md\`. Do not reinvent RK4.
4. **Hook Integrity**: every hook name you reference in Section 4–5
   MUST exist in \`template_api.md\`. Inventing one will break the build.
5. **Units Everywhere**: every numeric field in Section 2 must declare
   a SI \`unit\`. The Phase-5 unit-consistency validator depends on this.

`;

    prompt += core
      ? `---\n\n## Universal Protocol Rules\n\n${core}\n\n`
      : this.getBuiltinCoreRules();
    prompt += designRules
      ? `---\n\n## ${archetype.toUpperCase()} Design Guide\n\n${designRules}\n\n`
      : this.getBuiltinArchetypeStub(archetype);
    if (templateApi) {
      prompt += `---\n\n## ${archetype.toUpperCase()} Template Capabilities\n\n${templateApi}\n\n`;
    }
    return prompt;
  }

  private buildUserPrompt(): string {
    const cfg = this.params.config_summary
      ? `\n\nExisting simConfig.json summary:\n${this.params.config_summary}\n`
      : '';
    return `Produce the six-section Protocol Document for this simulation:

"${this.params.raw_user_requirement}"

Archetype: ${this.params.archetype}${cfg}

Output the document as Markdown with the six numbered sections defined
in the rules. Do NOT wrap in code fences.`;
  }

  /** Walk up from project root looking for a \`docs/\` directory. */
  private async findDocsDir(): Promise<string | null> {
    const projectRoot = this.config.getProjectRoot();
    let dir = projectRoot;
    while (dir !== path.dirname(dir)) {
      const candidate = path.join(dir, 'docs');
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        dir = path.dirname(dir);
      }
    }
    return null;
  }

  private async callModel(
    systemPrompt: string,
    userPrompt: string,
    signal: AbortSignal,
  ): Promise<string> {
    // `thinking: { type: 'enabled' }` is an Anthropic/Claude-specific extended
    // thinking parameter. Gemini's OpenAI-compat surface (and OpenAI proper)
    // reject unknown fields with a 400, so only include it when the endpoint
    // is Anthropic-shaped. This mirrors the patch in generate-gdd.ts.
    const isGeminiEndpoint = this.modelConfig.baseUrl.includes(
      'generativelanguage.googleapis.com',
    );
    const isAnthropicLike =
      this.modelConfig.baseUrl.includes('anthropic') ||
      this.modelConfig.modelName.startsWith('claude');

    const payload: Record<string, unknown> = {
      model: this.modelConfig.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: this.modelConfig.temperature ?? 0.7,
      max_tokens: 10000,
      stream: false,
    };
    if (!isGeminiEndpoint && isAnthropicLike) {
      payload['thinking'] = { type: 'enabled' };
    }

    const response = await fetch(
      `${this.modelConfig.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.modelConfig.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API Request Failed: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }
    const data = (await response.json()) as ChatCompletionResponse;
    if (data.error) {
      throw new Error(`Model API Error: ${data.error.message}`);
    }
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from the model');
    }
    return content;
  }

  private formatDisplayOutput(content: string): string {
    const preview = content.slice(0, 800);
    return `**Protocol Document Generated** (\`${this.params.archetype}\`)

${preview}${content.length > 800 ? '\n\n... (truncated, save full content to PROTOCOL.md)' : ''}

---
Next: save to \`PROTOCOL.md\` and proceed to Phase 3 (assets) or Phase 4 (config).`;
  }

  // -------------------------------------------------------------
  // Built-in fallbacks used while docs/protocol/core.md and
  // docs/modules/<archetype>/* are still being authored.
  // -------------------------------------------------------------

  private getBuiltinCoreRules(): string {
    return `---

## Universal Protocol Rules (Built-in fallback)

The Protocol Document is a **Technical Specification**. Each section is the contract for one downstream step:

| Section | Title                          | Downstream Consumer                                     |
| ------- | ------------------------------ | ------------------------------------------------------- |
| **0**   | System Overview & Hypothesis   | Documentation, Lab title, README                        |
| **1**   | Assets / External Data         | \`generate_simulation_assets\` — datasets, lookups      |
| **2**   | Variables & Units              | \`src/simConfig.json\` — config merge                   |
| **3**   | Numerical Scheme               | Solver / stencil / RNG selection from template_api      |
| **4**   | Lab Layout & Visualization     | \`src/App.tsx\` children: lab_objects + instruments     |
| **5**   | Observables & Roadmap          | DigitalReadout / ChartMonitor + per-file todo list      |
| **6**   | Validation Targets             | Phase-6 validators (NaN, units, conservation, analytic) |

### Section Guidelines

**Section 0 — System Overview**: One paragraph stating the system, the hypothesis under test, and the qualitative outcome the user should observe.

**Section 1 — Assets / External Data**: Table with columns \`type\` (dataset / parameter_table / lookup), \`key\`, \`description\`, \`source\`. **Most ODE simulations need NOTHING here**. Empty table is acceptable.

**Section 2 — Variables & Units**: COMPLETE \`simConfig.json\` content (no truncation). Every field must use the wrapper format \`{ "value": X, "type": "number"|"boolean"|"string", "unit": "<SI>", "min": number, "max": number, "description": "..." }\`. Examples of units: \`"m"\`, \`"kg"\`, \`"s"\`, \`"1/s"\`, \`"K"\`, \`"mol"\`, \`"V"\`, \`"-"\` (dimensionless).

**Section 3 — Numerical Scheme**: Pick the solver/stencil/RNG, integration step (dt) or grid spacing (dx), tolerance, and the BaseSolver hooks to override. Reference \`template_api.md\` exactly — never invent a hook name.

**Section 4 — Lab Layout & Visualization**: Bullet list of which \`lab_objects\` (Pendulum, Spring, GridSurface, ...), \`instruments\` (Dial, Button3D, DigitalReadout, ChartMonitor), \`visualization\` (TimeSeriesPlot, PhasePortrait, HeatmapPanel) to mount, with their props and approximate \`position\` on the desk. Reuse instruments — every Section-2 numeric becomes one Dial.

**Section 5 — Observables & Roadmap**: Numbered list of file-level operations:
\`\`\`
1. UPDATE simConfig.json: paste Section 2
2. CREATE src/MySolver.ts: extend BaseSolver, override step()
3. UPDATE App.tsx: mount <BaseLabScene> with <Pendulum />, <Dial> x3, <Button3D> x3, <ChartMonitor>
4. ...
\`\`\`

**Section 6 — Validation Targets**: List every conservation law / analytic-solution benchmark / sanity check the simulation must satisfy. The Phase-6 validators read this section and run automated checks.

### Forbidden in Protocol

- "Implement custom solver from scratch" — use existing components from template_api.
- Numeric values without a \`unit\` field.
- Hook names that aren't in \`template_api.md\`.
- Section 4 references to lab_objects that don't exist for this archetype.

`;
  }

  private getBuiltinArchetypeStub(arch: SimulationArchetype): string {
    const blurbs: Record<SimulationArchetype, string> = {
      ode_system:
        'Use a time integrator (RK4 / RK45). State is a finite vector y(t). Section 3 must specify dt, tolerance (if adaptive), and the F(t, y) right-hand side. Section 6 should include energy / momentum conservation when applicable.',
      pde_grid:
        'Use a finite-difference / finite-volume stencil on a uniform grid. Section 3 must specify dx, dt, and the CFL-bound check. Section 6 should include grid-refinement convergence.',
      agent_based:
        'Per-agent step rule + spatial index for neighbour queries. Section 3 must specify the population size, the neighbour radius, and any rule weights. Section 6 should include emergent-statistic targets (cluster size, equilibrium ratio).',
      monte_carlo:
        'Random sampler + variance-reduction strategy. Section 3 must specify the RNG, sample count, and convergence criterion. Section 6 should include analytic-baseline comparisons where available.',
      cellular_automata:
        'Cell grid + local transition rule. Section 3 must specify grid size, rule definition, and (sync vs async) update mode. Section 6 should include pattern-stability checks (density, period detection).',
      interactive_protocol:
        'Discrete protocol state machine + drag/click handlers. Section 3 must list the procedure as ordered steps, each with id / title / instruction / required-action-count. Section 6 should include step-machine integrity, no-skipping enforcement, and qualitative end-state checks (visual outcome matches real-world expectation).',
    };
    return `---

## ${arch.toUpperCase()} Design Guide (Built-in stub)

${blurbs[arch]}

> Note: this stub will be replaced by a richer \`docs/modules/${arch}/design_rules.md\` once Phase 4 (or the corresponding archetype rollout) ships.

`;
  }
}

async function readIfExists(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export class GenerateProtocolTool extends BaseDeclarativeTool<
  GenerateProtocolParams,
  ToolResult
> {
  static readonly Name: string = ToolNames.GENERATE_PROTOCOL;

  /**
   * Resolve the protocol-generator's reasoning-model config from
   * env / settings.json. Throws `MissingProviderConfigError` when
   * nothing is configured. Lazy so registration doesn't crash on a
   * fresh install.
   */
  static resolveModelConfig(config?: Config): ProtocolModelConfig {
    const providers = config?.getOpenGameProviders();
    const resolved = resolveProviderConfig('reasoning', providers);
    return {
      apiKey: resolved.apiKey,
      baseUrl: resolved.baseUrl,
      modelName: resolved.model,
      temperature: 0.7,
      timeout: 120_000,
    };
  }

  constructor(
    private config: Config,
    private modelConfig?: ProtocolModelConfig,
  ) {
    super(
      GenerateProtocolTool.Name,
      ToolDisplayNames.GENERATE_PROTOCOL,
      `Generate a six-section Experiment Protocol Document for an OpenSim simulation. Reads docs/protocol/core.md plus archetype-specific design_rules.md / template_api.md (when present), then asks the reasoning model to fill in the contract that the rest of the build phases consume. Call this AFTER classify_simulation_type and BEFORE writing any solver / scene code.`,
      Kind.Think,
      {
        type: 'object',
        properties: {
          raw_user_requirement: {
            type: 'string',
            description:
              "The user's simulation idea, verbatim. Echo back what they typed in the prompt.",
          },
          archetype: {
            type: 'string',
            enum: [
              'ode_system',
              'pde_grid',
              'agent_based',
              'monte_carlo',
              'cellular_automata',
            ],
            description:
              'Simulation archetype, as returned by classify_simulation_type. REQUIRED.',
          },
          config_summary: {
            type: 'string',
            description:
              'Optional. If you already read simConfig.json, paste a one-paragraph summary here so the protocol reflects existing config. Skip if you have not read it yet.',
          },
        },
        required: ['raw_user_requirement', 'archetype'],
      },
      false,
      true,
    );
  }

  protected override validateToolParamValues(
    params: GenerateProtocolParams,
  ): string | null {
    if (
      !params.raw_user_requirement ||
      params.raw_user_requirement.trim() === ''
    ) {
      return 'raw_user_requirement must be a non-empty string';
    }
    if (!params.archetype) return 'archetype is required';
    return null;
  }

  protected createInvocation(
    params: GenerateProtocolParams,
  ): ToolInvocation<GenerateProtocolParams, ToolResult> {
    return new GenerateProtocolInvocation(
      this.config,
      params,
      this.modelConfig,
    );
  }
}
