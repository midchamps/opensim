/**
 * Numerical-validation toolkit (Phase 5).
 *
 * Each validator is a small, focused helper the agent imports from a
 * vitest test file in Phase 6. They produce structured results
 * (passed / drift / observed-vs-expected) so test failures point at
 * the *physical* reason the simulation is wrong, not just at a
 * generic assertion failure.
 *
 *   - `NaNDetector.check(state)`            — guard against non-finite values.
 *   - `checkUnitConsistency(simConfig)`     — every numeric field declares a `unit`.
 *   - `checkConservation(solver, spec)`     — relative drift of a conserved scalar.
 *   - `compareToAnalytic(name, ...)`        — observed vs closed-form expected.
 *   - `detectPeriodFromZeroCrossings(...)`  — measure oscillation period from samples.
 *
 * Future phases add:
 *   - `checkCFLCondition(...)` — PDE stability gate for `pde_grid` archetype.
 *   - `checkMonteCarloConvergence(...)` — variance / confidence-interval check.
 */
export { NaNDetector } from './NaNDetector';
export {
  checkUnitConsistency,
  type UnitIssue,
  type CheckOptions,
} from './UnitConsistency';
export {
  checkConservation,
  type ConservationCheckSpec,
  type ConservationResult,
  type SteppableSolver,
} from './ConservationLaw';
export {
  compareToAnalytic,
  detectPeriodFromZeroCrossings,
  type AnalyticBenchmarkResult,
  type PeriodSample,
  type CrossingDirection,
} from './AnalyticBenchmark';
