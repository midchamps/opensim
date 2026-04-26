/**
 * Static / runtime guard against non-finite values in the simulation
 * state. The Phase-6 self-test in agent-written simulations should
 * `NaNDetector.check(solver.state)` after every N steps; if anything
 * goes NaN / Infinity / -Infinity the test fails immediately rather
 * than letting the value propagate silently into observables.
 *
 * KEEP — agent code calls these statics; never modify the
 * implementation.
 */
export class NaNDetector {
  /**
   * Throws if any element of `state` is non-finite.
   * Useful inside vitest tests AND inside live solver loops.
   */
  static check(
    state: ArrayLike<number>,
    label: string = 'state',
  ): void {
    for (let i = 0; i < state.length; i++) {
      const v = state[i];
      if (!Number.isFinite(v)) {
        throw new Error(
          `NaNDetector: ${label}[${i}] is non-finite (${v}). ` +
            'Common causes: dt too large for the chosen integrator, ' +
            'stiff equations needing an implicit / adaptive solver, ' +
            'or a bug in rhs(t, y) that returns NaN.',
        );
      }
    }
  }

  /** Convenience predicate — `false` on any non-finite element. */
  static isFinite(state: ArrayLike<number>): boolean {
    for (let i = 0; i < state.length; i++) {
      if (!Number.isFinite(state[i])) return false;
    }
    return true;
  }
}
