import { RK4, type ODEState } from './RK4';
import simConfig from '../simConfig.json';

/**
 * Copy this file to your simulation file (e.g., `DampedPendulumODE.ts`)
 * and customise:
 *
 *   1. Rename the class to match your simulation.
 *   2. Implement `initialState()` — return the y vector at t = 0
 *      using values from `simConfig.json`.
 *   3. Implement `rhs(t, y)` — return dy/dt = F(t, y).
 *
 * Example: damped pendulum
 *
 * ```ts
 * import { RK4, type ODEState } from './RK4';
 * import simConfig from '../simConfig.json';
 *
 * export class DampedPendulumODE extends RK4 {
 *   constructor() {
 *     super({ dt: simConfig.simulationTimeStep.value });
 *   }
 *
 *   initialState(): ODEState {
 *     return [
 *       simConfig.initialAngle.value,
 *       simConfig.initialAngularVelocity.value,
 *     ];
 *   }
 *
 *   rhs(_t: number, y: ODEState): ODEState {
 *     const [theta, omega] = y;
 *     const g = simConfig.gravity.value;
 *     const L = simConfig.length.value;
 *     const b = simConfig.dampingCoefficient.value;
 *     return [
 *       omega,
 *       -(g / L) * Math.sin(theta) - b * omega,
 *     ];
 *   }
 * }
 * ```
 *
 * Read this file as a template; never import `_TemplateODE` from
 * agent-written code.
 */
export class _TemplateODE extends RK4 {
  constructor() {
    super({
      // TODO: replace with your simConfig field for the integration step
      dt: simConfig.simulationTimeStep?.value ?? 0.01,
    });
  }

  override initialState(): ODEState {
    // TODO: return your initial state vector, e.g. [position, velocity]
    return [0, 0];
  }

  override rhs(_t: number, y: ODEState): ODEState {
    // TODO: return dy/dt as a number[] of the same length as y
    // Example: simple harmonic oscillator d²x/dt² = -x
    return [y[1], -y[0]];
  }
}
