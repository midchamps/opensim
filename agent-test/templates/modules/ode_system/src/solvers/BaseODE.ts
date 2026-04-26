// Path is relative to the AGENT'S deployed simulation tree, not the
// template source repo. After the Phase-1 cp, this file ends up at
// `./src/solvers/BaseODE.ts` and BaseSolver at `./src/solvers/BaseSolver.ts`,
// both in the same directory.
import { BaseSolver, type BaseSolverConfig } from './BaseSolver';

/**
 * Generic ODE state — a flat numeric vector. The solver doesn't
 * care what the entries mean; the agent's subclass interprets them
 * via `rhs(t, y)` and `initialState()`.
 *
 * For most simulations the state is small (2 for a pendulum, 4 for
 * Lotka-Volterra with two species, 6 for Newtonian particle in 3D).
 * Use a plain `number[]` rather than typed arrays for maximum
 * readability; switch to `Float64Array` if profiling shows it's a
 * hotspot.
 */
export type ODEState = number[];

/**
 * BaseODE — abstract solver for systems of the form `dy/dt = F(t, y)`.
 * The agent overrides:
 *   - `initialState()` — returns the y vector at t = 0.
 *   - `rhs(t, y)` — returns the derivative dy/dt as a same-length array.
 *
 * Pick a concrete integrator (RK4 / RK45 / EulerMaruyama) by extending
 * the corresponding subclass instead of BaseODE directly.
 *
 * KEEP — agent-written code never modifies BaseODE itself; it
 * subclasses RK4 (which subclasses BaseODE) and overrides the two
 * abstracts.
 */
export abstract class BaseODE extends BaseSolver<ODEState> {
  protected y: ODEState;

  constructor(config: BaseSolverConfig) {
    super(config);
    this.y = this.initialState();
  }

  override get state(): ODEState {
    return this.y;
  }

  /** Return the state vector at t = 0. */
  abstract override initialState(): ODEState;

  /**
   * Right-hand side of the ODE. Given the current time `t` and state
   * `y`, return `dy/dt` as an array of the same length.
   *
   * Must be a pure function — do not mutate `y`, do not rely on
   * external state changing between calls within a single step
   * (RK4 calls this four times per step).
   */
  abstract rhs(t: number, y: ODEState): ODEState;

  protected override afterReset(): void {
    this.y = this.initialState();
  }
}
