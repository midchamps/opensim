/**
 * Compare a simulator's observed value to a closed-form analytical
 * expectation. Use cases:
 *   - Period of a small-angle pendulum: T = 2π√(L/g).
 *   - Steady-state amplitude of a damped driven oscillator.
 *   - Final temperature of a 1D heat-equation slab in equilibrium.
 *
 * Plus a helper that detects oscillation period from a (t, y) sample
 * stream — the most common ODE benchmark scaffolding.
 *
 * KEEP — agent calls `compareToAnalytic` / `detectPeriodFromZeroCrossings`
 * from vitest; never modify the math.
 */

export interface AnalyticBenchmarkResult {
  name: string;
  observed: number;
  expected: number;
  relativeError: number;
  tolerance: number;
  passed: boolean;
}

/** Compare an observed scalar to an expected scalar within `tolerance` (relative). */
export function compareToAnalytic(
  name: string,
  observed: number,
  expected: number,
  tolerance: number,
): AnalyticBenchmarkResult {
  if (!Number.isFinite(observed) || !Number.isFinite(expected)) {
    throw new Error(
      `AnalyticBenchmark[${name}]: observed=${observed}, expected=${expected} — non-finite input`,
    );
  }
  if (!Number.isFinite(tolerance) || tolerance < 0) {
    throw new Error(
      `AnalyticBenchmark[${name}]: tolerance must be a non-negative finite number`,
    );
  }
  const denominator = Math.abs(expected);
  const relativeError = denominator > 0
    ? Math.abs(observed - expected) / denominator
    : Math.abs(observed - expected);
  return {
    name,
    observed,
    expected,
    relativeError,
    tolerance,
    passed: relativeError <= tolerance,
  };
}

export type CrossingDirection = 'rising' | 'falling' | 'either';

export interface PeriodSample {
  t: number;
  y: number;
}

/**
 * Estimate an oscillation period by averaging consecutive zero
 * crossings of `y(t)`. Returns `null` if fewer than two crossings
 * are found.
 *
 * Uses linear interpolation between samples for sub-step accuracy,
 * so the result is much better than a naive count when the time
 * step is coarse. `direction='rising'` (default) measures one full
 * period per consecutive pair (peak-to-peak via velocity zero
 * crossings, for instance); `'either'` doubles the count and halves
 * the per-pair gap, so use it only if you know what you're doing.
 */
export function detectPeriodFromZeroCrossings(
  samples: ReadonlyArray<PeriodSample>,
  direction: CrossingDirection = 'rising',
): number | null {
  if (samples.length < 2) return null;
  const crossings: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1];
    const curr = samples[i];
    let isCrossing = false;
    if (direction === 'rising' && prev.y <= 0 && curr.y > 0) {
      isCrossing = true;
    } else if (direction === 'falling' && prev.y >= 0 && curr.y < 0) {
      isCrossing = true;
    } else if (direction === 'either') {
      isCrossing = (prev.y <= 0 && curr.y > 0) || (prev.y >= 0 && curr.y < 0);
    }
    if (isCrossing) {
      // Linear interpolation: y = 0 between prev.y (< 0) and curr.y (> 0)
      const dy = curr.y - prev.y;
      const fraction = dy === 0 ? 0 : -prev.y / dy;
      crossings.push(prev.t + fraction * (curr.t - prev.t));
    }
  }
  if (crossings.length < 2) return null;
  let total = 0;
  for (let i = 1; i < crossings.length; i++) {
    total += crossings[i] - crossings[i - 1];
  }
  return total / (crossings.length - 1);
}
