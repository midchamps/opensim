/**
 * Universal solver lifecycle (Phase 4.1).
 *
 * `BaseSolver` is the play/pause/reset/subscribe machinery every
 * archetype's solver inherits. Archetype-specific solvers
 * (`BaseODE`, `BasePDE`, `BaseAgent`, `BaseMC`, `BaseCA`) live in
 * each module's own `solvers/` directory and extend this base.
 */
export { BaseSolver, type BaseSolverConfig, type SolverObserver } from './BaseSolver';
