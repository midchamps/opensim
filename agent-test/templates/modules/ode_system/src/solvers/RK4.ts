import { BaseODE, type ODEState } from './BaseODE';

/**
 * Fixed-step 4th-order Runge-Kutta integrator.
 *
 * Standard textbook scheme:
 *   k1 = F(t, y)
 *   k2 = F(t + dt/2, y + dt*k1/2)
 *   k3 = F(t + dt/2, y + dt*k2/2)
 *   k4 = F(t + dt, y + dt*k3)
 *   y_next = y + dt/6 * (k1 + 2*k2 + 2*k3 + k4)
 *
 * Accuracy: O(dt^5) per step, O(dt^4) global. Good default for
 * well-behaved non-stiff ODEs (pendulum, Lotka-Volterra, RC circuit,
 * orbital mechanics within reasonable timescales).
 *
 * For stiff systems (chemical kinetics with fast/slow modes) prefer
 * an implicit / adaptive method like RK45 or LSODA. RK4 will be
 * stable but inefficient — you'd need a tiny dt.
 *
 * KEEP — agent-written code subclasses RK4 and overrides
 * `initialState()` and `rhs(t, y)`. Do not touch the math here.
 */
export abstract class RK4 extends BaseODE {
  override step(dt: number): void {
    const t = this._t;
    const y = this.y;
    const n = y.length;

    const k1 = this.rhs(t, y);
    const yk2 = new Array<number>(n);
    for (let i = 0; i < n; i++) yk2[i] = y[i] + (dt / 2) * k1[i];
    const k2 = this.rhs(t + dt / 2, yk2);

    const yk3 = new Array<number>(n);
    for (let i = 0; i < n; i++) yk3[i] = y[i] + (dt / 2) * k2[i];
    const k3 = this.rhs(t + dt / 2, yk3);

    const yk4 = new Array<number>(n);
    for (let i = 0; i < n; i++) yk4[i] = y[i] + dt * k3[i];
    const k4 = this.rhs(t + dt, yk4);

    const next = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      next[i] = y[i] + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }
    this.y = next;
  }
}

export type { ODEState };
