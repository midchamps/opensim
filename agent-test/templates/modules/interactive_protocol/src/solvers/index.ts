/**
 * interactive_protocol archetype solver re-exports. After the agent's
 * Phase-1 cp this overrides the empty barrel from
 * `templates/core/src/solvers/`.
 *
 *   import { BaseSolver, BaseProtocol, type StepDef, type ProtocolState }
 *     from './solvers';
 */
export {
  BaseSolver,
  type BaseSolverConfig,
  type SolverObserver,
} from './BaseSolver';
export { BaseProtocol, type StepDef, type ProtocolState } from './BaseProtocol';
export { _TemplateProtocol } from './_TemplateProtocol';
