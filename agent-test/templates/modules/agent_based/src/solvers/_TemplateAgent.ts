import { BaseAgent, type Agent } from './BaseAgent';
import simConfig from '../simConfig.json';

/**
 * Copy this file to your simulation file (e.g. `BoidFlockAgent.ts`)
 * and customise:
 *
 *   1. Rename the class to match your simulation.
 *   2. Define the agent shape (extend `Agent` if you need extra
 *      per-agent state like `species` or `status`).
 *   3. Implement `initialState()` — return the initial agent list,
 *      reading counts and ranges from `simConfig.json`.
 *   4. Implement `updateAgent(self, neighbors, dt)` — return the
 *      next state for one agent. Reading other agents goes through
 *      `neighbors`; do NOT touch `this.agents` directly.
 *   5. Set `this.neighborRadius` in the constructor (max of any
 *      simConfig radius the agent will inspect).
 *
 * Worked example: minimal boids
 *
 * ```ts
 * import { BaseAgent, type Agent } from './BaseAgent';
 * import simConfig from '../simConfig.json';
 *
 * export class BoidFlockAgent extends BaseAgent<Agent> {
 *   constructor() {
 *     super({ dt: simConfig.simulationTimeStep.value });
 *     this.neighborRadius = Math.max(
 *       simConfig.separationRadius.value,
 *       simConfig.cohesionRadius.value,
 *     );
 *   }
 *
 *   initialState(): Agent[] {
 *     const N = simConfig.agentCount.value;
 *     const R = simConfig.spawnRadius.value;
 *     const out: Agent[] = [];
 *     for (let i = 0; i < N; i++) {
 *       out.push({
 *         position: [randIn(-R, R), randIn(-R, R), randIn(-R, R)],
 *         velocity: [randIn(-0.5, 0.5), randIn(-0.5, 0.5), randIn(-0.5, 0.5)],
 *       });
 *     }
 *     return out;
 *   }
 *
 *   updateAgent(self: Agent, neighbors: Agent[], dt: number): Agent {
 *     // Three steering rules. Each contributes a force; sum + clamp.
 *     const sep = separation(self, neighbors, simConfig.separationRadius.value);
 *     const ali = alignment(self, neighbors);
 *     const coh = cohesion(self, neighbors);
 *     const ax = sep[0] * simConfig.separationWeight.value
 *              + ali[0] * simConfig.alignmentWeight.value
 *              + coh[0] * simConfig.cohesionWeight.value;
 *     // ... ay, az
 *     const vx = clamp(self.velocity[0] + ax * dt, -V_MAX, V_MAX);
 *     // ... vy, vz
 *     return {
 *       position: [self.position[0] + vx * dt, ...],
 *       velocity: [vx, vy, vz],
 *     };
 *   }
 * }
 * ```
 *
 * Read this file as a template; never import `_TemplateAgent` from
 * agent-written code.
 */
export class _TemplateAgent extends BaseAgent<Agent> {
  constructor() {
    super({
      // TODO: replace with your simConfig field for the integration step
      dt: simConfig.simulationTimeStep?.value ?? 0.05,
    });
    // TODO: set to the largest interaction radius your rules use
    this.neighborRadius = 1.0;
  }

  override initialState(): Agent[] {
    // TODO: return your initial agent list
    return [{ position: [0, 0, 0], velocity: [0, 0, 0] }];
  }

  override updateAgent(self: Agent, _neighbors: Agent[], dt: number): Agent {
    // TODO: compute next state from self + neighbors + dt
    // Default: ballistic motion (no interaction).
    return {
      position: [
        self.position[0] + self.velocity[0] * dt,
        self.position[1] + self.velocity[1] * dt,
        self.position[2] + self.velocity[2] * dt,
      ],
      velocity: self.velocity,
    };
  }
}
