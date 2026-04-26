/**
 * ODE archetype solver re-exports. After the agent's Phase-1 cp,
 * this file overrides the empty barrel from templates/core/src/solvers/
 * (whose only purpose was to keep the directory tracked).
 *
 * The agent imports from `./solvers` and gets:
 *   - BaseSolver — universal lifecycle (carried over from core).
 *   - BaseODE / RK4 / ODEState — ODE-specific base + integrator.
 *   - _TemplateODE — copy-and-customise scaffold.
 */
export { BaseSolver, type BaseSolverConfig, type SolverObserver } from './BaseSolver';
export { BaseODE, type ODEState } from './BaseODE';
export { RK4 } from './RK4';
export { _TemplateODE } from './_TemplateODE';
