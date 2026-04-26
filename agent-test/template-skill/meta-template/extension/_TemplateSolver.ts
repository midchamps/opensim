import { BaseSolver, type BaseSolverConfig } from '../core/src/solvers';

/**
 * Minimal copy-and-customise scaffold for the OpenSim meta-template.
 *
 * After Phase-1 of the agent's six-phase workflow, this file is the
 * generic starting point — the agent classifies the simulation idea
 * into an archetype (ode_system / pde_grid / agent_based / monte_carlo
 * / cellular_automata), then overlays the archetype-specific module
 * which ships its own richer scaffold (`_TemplateODE.ts`,
 * `_TemplateAgent.ts`, etc.).
 *
 * If the archetype overlay hasn't been chosen yet (or for a "fresh
 * untyped solver" experiment), copy this file, rename the class,
 * pick a state shape (number[] for vectors, Record<...> for fields,
 * Agent[] for swarms), and implement the two abstract hooks.
 */

export type MyState = number[];

export class _TemplateSolver extends BaseSolver<MyState> {
  private y: MyState;

  constructor(config: BaseSolverConfig) {
    super(config);
    this.y = this.initialState();
  }

  override get state(): MyState {
    return this.y;
  }

  override initialState(): MyState {
    // TODO: return the state vector / field / agent list at t = 0
    return [0, 0];
  }

  override step(_dt: number): void {
    // TODO: advance `this.y` by one fixed `dt` step.
    // Concrete archetype subclasses (RK4, Laplacian5, BaseAgent.step,
    // sampler, cell update) implement this — the meta-template just
    // shows the override surface.
  }

  protected override afterReset(): void {
    this.y = this.initialState();
  }
}
