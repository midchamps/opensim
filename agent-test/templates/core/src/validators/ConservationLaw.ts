/**
 * Run a conservation-law check on a stepping simulation. The agent
 * supplies a function that computes the conserved scalar from the
 * solver state (e.g. `E_total = KE + PE` for a pendulum) and a
 * tolerance; this helper drives the simulation forward and asserts
 * the relative drift stays within bound.
 *
 * Designed to be called from vitest tests:
 *
 * @example
 *   it('energy is conserved with damping = 0', () => {
 *     simConfig.dampingCoefficient.value = 0;
 *     const solver = new DampedPendulumODE();
 *     const periodCount = 100;
 *     const T = 2 * Math.PI * Math.sqrt(L / g);
 *     const result = checkConservation(solver, {
 *       name: 'Energy',
 *       compute: ([theta, omega]) => calculateObservables(theta, omega).E_total,
 *       tolerance: 0.01,                        // 1% drift
 *       totalTime: periodCount * T,
 *     });
 *     expect(result.passed).toBe(true);
 *   });
 *
 * KEEP — agent code calls `checkConservation`; never modify the math.
 */

export interface ConservationCheckSpec<S> {
  /** Human-readable name for error reporting (e.g. "Energy"). */
  name: string;
  /** Pure function from state to the conserved scalar. */
  compute: (state: S) => number;
  /** Allowed relative drift (e.g. 0.01 = 1%). */
  tolerance: number;
  /** Total simulated time, seconds. */
  totalTime: number;
  /**
   * Optional warm-up steps before snapshotting the initial value —
   * helps when the integrator's first step has slightly higher error.
   * Default 0.
   */
  warmupSteps?: number;
}

export interface ConservationResult {
  name: string;
  initialValue: number;
  finalValue: number;
  /** Relative drift |final - initial| / |initial|. */
  drift: number;
  tolerance: number;
  passed: boolean;
  totalSteps: number;
}

/**
 * Minimal solver shape this helper expects. Compatible with any
 * `BaseSolver<S>` subclass (RK4, RK45, etc.).
 */
export interface SteppableSolver<S> {
  readonly state: S;
  readonly dt?: number;
  step(dt: number): void;
  reset?(): void;
}

export function checkConservation<S>(
  solver: SteppableSolver<S>,
  spec: ConservationCheckSpec<S>,
): ConservationResult {
  if (!Number.isFinite(spec.tolerance) || spec.tolerance < 0) {
    throw new Error('ConservationLaw: tolerance must be a non-negative finite number');
  }
  if (!Number.isFinite(spec.totalTime) || spec.totalTime <= 0) {
    throw new Error('ConservationLaw: totalTime must be a positive finite number');
  }

  // Solver dt is exposed by BaseSolver; fall back to 0.01 if a custom
  // solver omits it.
  const dt = solver.dt ?? 0.01;
  const warmup = Math.max(0, spec.warmupSteps ?? 0);
  for (let i = 0; i < warmup; i++) solver.step(dt);

  const initial = spec.compute(solver.state);
  const totalSteps = Math.ceil(spec.totalTime / dt);
  for (let i = 0; i < totalSteps; i++) solver.step(dt);
  const finalValue = spec.compute(solver.state);

  const denominator = Math.abs(initial);
  const drift = denominator > 0
    ? Math.abs(finalValue - initial) / denominator
    : Math.abs(finalValue - initial);

  return {
    name: spec.name,
    initialValue: initial,
    finalValue,
    drift,
    tolerance: spec.tolerance,
    passed: drift <= spec.tolerance,
    totalSteps,
  };
}
