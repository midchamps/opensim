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

/**
 * OpenSim simulation archetype based on the numerical scheme that
 * dominates the system, NOT the scientific domain. Two completely
 * different domains (predator-prey ecology vs. RC circuit) can both
 * be `ode_system` because they share a solver class.
 *
 * Mirrors the "physics-first classification" pattern from OpenGame's
 * GameArchetype, just translated to numerical-methods territory.
 */
export type SimulationArchetype =
  | 'ode_system'
  | 'pde_grid'
  | 'agent_based'
  | 'monte_carlo'
  | 'cellular_automata'
  | 'interactive_protocol';

export interface SimulationTypeClassifierParams {
  /** User's simulation idea, hypothesis, or problem description. */
  simulation_description: string;
}

export interface ClassifierModelConfig {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  temperature?: number;
  timeout?: number;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export interface NumericProfile {
  /** Whether the system has spatial extent (PDE / CA / agents in space). */
  hasSpatialDomain: boolean;
  /** Whether the dominant time evolution is continuous or discrete. */
  timeEvolution: 'continuous' | 'discrete';
  /** Whether randomness is core to the dynamics. */
  stochastic: boolean;
  /** Coarse solver class chosen by classification. */
  solverClass:
    | 'time_integrator'
    | 'pde_stencil'
    | 'agent_step'
    | 'sampler'
    | 'cell_update'
    | 'protocol_state_machine';
}

export interface SimulationClassificationResult {
  archetype: SimulationArchetype;
  reasoning: string;
  numericProfile: NumericProfile;
}

class SimulationTypeClassifierInvocation extends BaseToolInvocation<
  SimulationTypeClassifierParams,
  ToolResult
> {
  /** Lazily resolved on first execute() so a missing API key surfaces as a tool error. */
  private resolvedModelConfig?: ClassifierModelConfig;

  constructor(
    private config: Config,
    params: SimulationTypeClassifierParams,
    private overrideModelConfig?: ClassifierModelConfig,
  ) {
    super(params);
  }

  private get modelConfig(): ClassifierModelConfig {
    if (this.overrideModelConfig) return this.overrideModelConfig;
    if (!this.resolvedModelConfig) {
      this.resolvedModelConfig =
        SimulationTypeClassifierTool.resolveModelConfig(this.config);
    }
    return this.resolvedModelConfig;
  }

  getDescription(): string {
    return 'Classify simulation by numerical scheme (ODE / PDE / agent-based / Monte Carlo / cellular automata).';
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt();
      const result = await this.callClassifierModel(
        systemPrompt,
        userPrompt,
        signal,
      );
      const classification = this.parseClassification(result);
      return {
        llmContent: this.formatLLMContent(classification),
        returnDisplay: this.formatDisplayContent(classification),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        llmContent: `Error classifying simulation type: ${message}`,
        returnDisplay: `**Classification Failed**\n\nError: ${message}`,
        error: { message, type: ToolErrorType.EXECUTION_FAILED },
      };
    }
  }

  private buildSystemPrompt(): string {
    return `# Simulation Type Classifier

You analyze simulation requests and classify them by the *solver class that dominates the dynamics*. For NUMERICAL simulations the scientific domain doesn't matter (pendulum dynamics, predator-prey populations, and RC circuits are all the same archetype because they're all systems of ODEs). For PROCEDURAL / interactive lab simulations a separate sixth archetype applies.

## Six Archetypes

### 1. ode_system (Continuous time, finite state vector)
**State**: A finite-dimensional state vector y(t).
**Evolution**: dy/dt = F(t, y) — ordinary differential equations (or DAEs / SDEs).
**Solver**: time integrator (RK4, RK45, LSODA, Euler-Maruyama).
**Examples**: pendulum, predator-prey (Lotka-Volterra), RLC circuits, chemical reaction networks (mass-action), single-cell biology models, orbital mechanics, harmonic oscillators with damping.
**Key question**: Is the only independent variable time, with a finite-dimensional state?

### 2. pde_grid (Continuous space + time, fields on a grid)
**State**: One or more scalar/vector fields u(x, y, [z], t) sampled on a regular grid.
**Evolution**: ∂u/∂t = L[u] where L involves spatial derivatives — heat / diffusion / wave / advection / reaction-diffusion / simple Navier-Stokes.
**Solver**: finite-difference / finite-volume stencil applied each time step (explicit or implicit).
**Examples**: heat conduction in a slab, 2D wave on a membrane, gas diffusion, simple fluid flow, Schrödinger equation (1D), Gray-Scott reaction-diffusion.
**Key question**: Does the system live on a continuous spatial domain that we discretise with a grid?

### 3. agent_based (Many independent decision-makers)
**State**: A list of agents, each with its own state (position, velocity, status, ...). Number of agents may grow / shrink.
**Evolution**: per-agent update rules each tick, often with neighbor lookups.
**Solver**: agent step + spatial index for neighbor queries.
**Examples**: boids / flocking, SIR / epidemic models with explicit individuals, traffic simulation, Schelling segregation, predator-prey with individual organisms (vs. populations), opinion dynamics, ant-colony foraging.
**Key question**: Are there many autonomous entities with their own state and local rules, where emergent behaviour is the point?

### 4. monte_carlo (Stochastic sampling, statistical convergence)
**State**: Statistical estimators (mean, variance, distribution) accumulated from random samples.
**Evolution**: each step draws a sample and updates the estimator. Convergence is the goal, not trajectory.
**Solver**: random sampler + variance reduction (importance sampling, antithetic variates, stratification).
**Examples**: π estimation by needle / disc-throwing, option pricing (Black-Scholes via MC), MCMC for Bayesian posteriors, particle transport / radiative transfer, integration of high-dimensional integrals.
**Key question**: Is the answer a *statistical estimate*, where you stop when error is small enough?

### 5. cellular_automata (Discrete cells, discrete time, local rules)
**State**: A grid (1D / 2D / 3D) of cells, each in one of finitely many states.
**Evolution**: synchronous (or asynchronous) update where each cell's next state depends only on its current state + neighbors.
**Solver**: cell array + transition rule applied to all cells.
**Examples**: Conway's Game of Life, Wolfram elementary CA (Rule 30, etc.), forest-fire model, lattice-gas automata, sand-pile / Bak-Tang-Wiesenfeld, simple Ising model on a lattice (Glauber dynamics).
**Key question**: Are cells in a discrete state set updated by a *local* rule on each tick?

### 6. interactive_protocol (Discrete user-driven steps, no continuous dynamics)
**State**: A finite-state machine over named procedure steps (intro → step 1 → step 2 → … → done) plus an animProgress timer for inter-step transitions.
**Evolution**: state advances when the user PERFORMS A LAB ACTION (click, drag-drop, press) on the active object for the current step. Each step has a "required" action count.
**Solver**: protocol state machine + UI event handlers + transition tweens.
**Examples**: strawberry DNA extraction, acid-base titration, gel electrophoresis, gram staining, baking-soda + vinegar volcano, simple distillation, flame test, paper chromatography, bread-baking workflow, recipe-style chemistry experiments.
**Key question**: Is the simulation primarily a SEQUENCE OF USER ACTIONS that progress through a procedure, rather than a continuous evolution of state under solver dynamics?

## Disambiguation Rules

- A reaction-diffusion equation is **pde_grid** (continuous concentrations on a grid), even though it superficially looks like CA.
- Conway's Life is **cellular_automata**, NOT agent_based — cells aren't autonomous, they're sites with a fixed update rule.
- SIR with population compartments (S, I, R as continuous numbers) is **ode_system**. SIR with explicit individuals walking around is **agent_based**.
- Particle-in-cell methods (PIC) are best modelled as **pde_grid** with auxiliary particles; classify as pde_grid.
- A pendulum simulated with a stochastic kick is still **ode_system** (use Euler-Maruyama). Pure Monte Carlo means the trajectory itself is incidental — only statistics matter.
- A neural network simulation depends: continuous-time spiking model (Hodgkin-Huxley) → ode_system. Discrete time-step learning rules over many neurons → agent_based.
- **Procedural lab activity vs numerical**: if the user's role is to PERFORM A SEQUENCE of physical lab actions (mash this, pour that, drag here), classify as **interactive_protocol** even when the underlying chemistry is continuous. If the user's role is mostly to TWIDDLE PARAMETERS and observe emergent dynamics, classify by the underlying numerical scheme.
- A volcano (baking soda + vinegar) where the user drops vinegar to trigger a reaction is **interactive_protocol** (the reaction visual is decorative); a wave-equation simulator with a few "drop" buttons is still **pde_grid**.

## Output Format

Respond with ONLY a JSON object (no markdown fences, no commentary outside JSON):

{
  "archetype": "ode_system" | "pde_grid" | "agent_based" | "monte_carlo" | "cellular_automata" | "interactive_protocol",
  "reasoning": "One or two sentences explaining the chosen archetype based on the dominant solver / interaction pattern.",
  "numericProfile": {
    "hasSpatialDomain": true | false,
    "timeEvolution": "continuous" | "discrete",
    "stochastic": true | false,
    "solverClass": "time_integrator" | "pde_stencil" | "agent_step" | "sampler" | "cell_update" | "protocol_state_machine"
  }
}
`;
  }

  private buildUserPrompt(): string {
    return `Classify this simulation by its DOMINANT NUMERICAL SCHEME:

"${this.params.simulation_description}"

Think about: independent variables (time only / space + time / discrete), state shape (vector / field / agent list / cell grid), and what kind of solver moves it forward. Output JSON only.`;
  }

  private async callClassifierModel(
    systemPrompt: string,
    userPrompt: string,
    signal: AbortSignal,
  ): Promise<string> {
    const payload = {
      model: this.modelConfig.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: this.modelConfig.temperature ?? 0.3,
      max_tokens: 600,
      stream: false,
    };
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

  private parseClassification(result: string): SimulationClassificationResult {
    let jsonStr = result.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr
        .replace(/```json?\n?/g, '')
        .replace(/```/g, '')
        .trim();
    }
    try {
      const parsed = JSON.parse(jsonStr);
      const archetype =
        (parsed.archetype as SimulationArchetype) || 'ode_system';
      return {
        archetype,
        reasoning: parsed.reasoning || 'No reasoning provided',
        numericProfile: parsed.numericProfile ?? defaultProfile(archetype),
      };
    } catch {
      // Fallback: keyword-based detection.
      const archetypes: SimulationArchetype[] = [
        'ode_system',
        'pde_grid',
        'agent_based',
        'monte_carlo',
        'cellular_automata',
        'interactive_protocol',
      ];
      for (const arch of archetypes) {
        if (result.toLowerCase().includes(arch)) {
          return {
            archetype: arch,
            reasoning: result,
            numericProfile: defaultProfile(arch),
          };
        }
      }
      return {
        archetype: 'ode_system',
        reasoning: 'Failed to parse model output, defaulting to ode_system',
        numericProfile: defaultProfile('ode_system'),
      };
    }
  }

  private formatLLMContent(result: SimulationClassificationResult): string {
    // Allow override via env so the agent can run in a worktree without
    // hard-coded absolute paths. Falls back to the layout we ship.
    const templatesDir = process.env.SIM_TEMPLATES_DIR || '../../templates';
    const docsDir = process.env.SIM_DOCS_DIR || '../../docs';

    return `<classification>
Archetype: ${result.archetype}
Reasoning: ${result.reasoning}

Numerical Profile:
- Has Spatial Domain: ${result.numericProfile.hasSpatialDomain}
- Time Evolution: ${result.numericProfile.timeEvolution}
- Stochastic: ${result.numericProfile.stochastic}
- Solver Class: ${result.numericProfile.solverClass}
</classification>

<system-reminder>
SIMULATION TYPE CLASSIFIED: **${result.archetype}**

## Next Step: Scaffold Templates (FOUR commands)

Run these commands NOW:

\`\`\`bash
# Step 1: Copy core lab template (Three.js + r3f + lab/ catalog + simConfig)
cp -r ${templatesDir}/core/* ./

# Step 2: Copy archetype module code INTO src/ (additive merge)
cp -r ${templatesDir}/modules/${result.archetype}/src/* ./src/

# Step 3: Copy core protocol documentation
mkdir -p docs/protocol
cp ${docsDir}/protocol/core.md docs/protocol/
cp ${docsDir}/asset_protocol.md ${docsDir}/debug_protocol.md docs/

# Step 4: Copy archetype-specific documentation
mkdir -p docs/modules/${result.archetype}
cp -r ${docsDir}/modules/${result.archetype}/* docs/modules/${result.archetype}/
\`\`\`

## After Scaffolding: Proceed to Phase 2 (Protocol Document)

**Do NOT read template source files yet** — template code is only read in Phase 5 (Implementation).
Reading now wastes context window.

Next: Call \`generate_protocol\` tool with:
- \`raw_user_requirement\`: User's simulation idea
- \`archetype\`: "${result.archetype}"
</system-reminder>`;
  }

  private formatDisplayContent(result: SimulationClassificationResult): string {
    const archetypeDescriptions: Record<SimulationArchetype, string> = {
      ode_system:
        'Continuous time + finite state vector (pendulum, Lotka-Volterra, RC circuit)',
      pde_grid:
        'Continuous space + time on a grid (heat / wave / reaction-diffusion)',
      agent_based:
        'Many autonomous agents with local rules (boids, SIR with individuals, traffic)',
      monte_carlo:
        'Stochastic sampling toward statistical convergence (π estimation, MCMC, option pricing)',
      cellular_automata:
        'Discrete cells, discrete time, local rules (Conway, Wolfram, sand pile)',
      interactive_protocol:
        'User-driven discrete steps (lab procedures: DNA extraction, titration, gel electrophoresis)',
    };

    return `**Simulation Type Classification**

**Archetype**: \`${result.archetype}\`
**Description**: ${archetypeDescriptions[result.archetype]}

**Numerical Profile**:
| Property | Value |
|----------|-------|
| Spatial Domain | ${result.numericProfile.hasSpatialDomain ? 'Yes' : 'No'} |
| Time Evolution | ${result.numericProfile.timeEvolution} |
| Stochastic | ${result.numericProfile.stochastic ? 'Yes' : 'No'} |
| Solver Class | \`${result.numericProfile.solverClass}\` |

**Reasoning**: ${result.reasoning}

---
Next: Scaffold templates and generate the Protocol Document.`;
  }
}

function defaultProfile(arch: SimulationArchetype): NumericProfile {
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
    case 'interactive_protocol':
      return {
        hasSpatialDomain: false,
        timeEvolution: 'discrete',
        stochastic: false,
        solverClass: 'protocol_state_machine',
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

export class SimulationTypeClassifierTool extends BaseDeclarativeTool<
  SimulationTypeClassifierParams,
  ToolResult
> {
  static readonly Name: string = ToolNames.SIMULATION_TYPE_CLASSIFIER;

  /**
   * Resolve the classifier's reasoning-model config from env / settings.json.
   * Throws `MissingProviderConfigError` (with an actionable message) when
   * nothing is configured. Lazily called by the invocation so tool
   * registration doesn't crash on a fresh install.
   */
  static resolveModelConfig(config?: Config): ClassifierModelConfig {
    const providers = config?.getOpenGameProviders();
    const resolved = resolveProviderConfig('reasoning', providers);
    return {
      apiKey: resolved.apiKey,
      baseUrl: resolved.baseUrl,
      modelName: resolved.model,
      temperature: 0.3,
      timeout: 15000,
    };
  }

  constructor(
    private config: Config,
    /** Optional override; if omitted the invocation resolves at execute time. */
    private modelConfig?: ClassifierModelConfig,
  ) {
    super(
      SimulationTypeClassifierTool.Name,
      ToolDisplayNames.SIMULATION_TYPE_CLASSIFIER,
      `Classifies a simulation idea into one of five numerical archetypes (ode_system, pde_grid, agent_based, monte_carlo, cellular_automata) by analyzing the *solver class* that dominates the dynamics, NOT the scientific domain. Call this FIRST before scaffolding templates.`,
      Kind.Think,
      {
        type: 'object',
        properties: {
          simulation_description: {
            type: 'string',
            description:
              'The user\'s simulation idea, hypothesis, or problem description. Examples: "I want a damped pendulum simulator", "simulate a 2D heat-diffusion plate with a hot spot", "boids flocking with predator avoidance".',
          },
        },
        required: ['simulation_description'],
      },
      false,
      true,
    );
  }

  protected override validateToolParamValues(
    params: SimulationTypeClassifierParams,
  ): string | null {
    if (
      !params.simulation_description ||
      params.simulation_description.trim() === ''
    ) {
      return 'simulation_description must be a non-empty string';
    }
    if (params.simulation_description.trim().length < 3) {
      return 'Simulation description is too short (minimum 3 characters)';
    }
    return null;
  }

  protected createInvocation(
    params: SimulationTypeClassifierParams,
  ): ToolInvocation<SimulationTypeClassifierParams, ToolResult> {
    return new SimulationTypeClassifierInvocation(
      this.config,
      params,
      this.modelConfig,
    );
  }
}
