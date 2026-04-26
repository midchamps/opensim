/**
 * agent_based archetype solver re-exports. After the agent's Phase-1
 * cp, this file overrides the empty barrel from
 * templates/core/src/solvers/.
 *
 * The agent imports from `./solvers` and gets:
 *   - BaseSolver — universal lifecycle (carried over from core).
 *   - BaseAgent / Agent / AgentState — agent-based base + types.
 *   - _TemplateAgent — copy-and-customise scaffold.
 */
export {
  BaseSolver,
  type BaseSolverConfig,
  type SolverObserver,
} from './BaseSolver';
export { BaseAgent, type Agent, type AgentState } from './BaseAgent';
export { _TemplateAgent } from './_TemplateAgent';
