// Path is relative to the AGENT'S deployed simulation tree, not the
// template source repo. After the Phase-1 cp this file ends up at
// `./src/solvers/BaseAgent.ts` and BaseSolver at
// `./src/solvers/BaseSolver.ts`, both in the same directory.
import { BaseSolver, type BaseSolverConfig } from './BaseSolver';

/**
 * Minimum shape every agent must satisfy: a 3D position and 3D
 * velocity. Subclasses extend this with archetype-specific fields
 * (e.g. SIR adds `status: 'S' | 'I' | 'R'`, traffic adds `lane`,
 * boids may add `species`).
 *
 * Position/velocity are plain tuples rather than three.js Vector3 so
 * the state can be JSON-cloned, snapshotted, and serialized without
 * a renderer dependency.
 */
export interface Agent {
  position: [number, number, number];
  velocity: [number, number, number];
}

/** Generic agent-based state — a flat list of agent records. */
export type AgentState<A extends Agent> = A[];

/**
 * BaseAgent — abstract solver for agent-based models. The agent
 * overrides:
 *   - `initialState()` — return the initial agent list at t = 0.
 *   - `updateAgent(self, neighbors, dt)` — return the next-tick state
 *     of one agent given its current state and the neighbors within
 *     `neighborRadius`.
 *
 * The base class handles the standard double-buffered tick:
 *   1. snapshot all agents,
 *   2. compute each next-state from the snapshot (so updates are
 *      simultaneous, not sequential — order-independence is a
 *      defining property of agent-based models),
 *   3. install the new list as `this.agents`.
 *
 * Neighbor queries are O(N²) by default (suitable for N up to ~500).
 * Override `findNeighbors` for a spatial-hash speed-up if needed.
 *
 * KEEP — agent-written code subclasses BaseAgent and implements
 * `initialState()` and `updateAgent()`. Do not touch `step()`.
 */
export abstract class BaseAgent<A extends Agent> extends BaseSolver<
  AgentState<A>
> {
  protected agents: A[];
  /**
   * Search radius (scene units) used by the default `findNeighbors`.
   * Subclasses set this in the constructor based on simConfig.
   */
  protected neighborRadius = 1.0;

  constructor(config: BaseSolverConfig) {
    super(config);
    this.agents = this.initialState();
  }

  override get state(): AgentState<A> {
    return this.agents;
  }

  /** Return the initial agent list at t = 0. Must NOT mutate `this`. */
  abstract override initialState(): A[];

  /**
   * Return the next-tick state for one agent. `neighbors` is the
   * pre-computed list of agents within `neighborRadius` of `self`,
   * NOT including `self`.
   *
   * Must be a pure function of (self, neighbors, dt) — do not mutate
   * `self` or `neighbors`, do not read `this.agents` directly. The
   * snapshot semantics depend on it.
   */
  abstract updateAgent(self: A, neighbors: A[], dt: number): A;

  override step(dt: number): void {
    const snapshot = this.agents;
    const next = new Array<A>(snapshot.length);
    for (let i = 0; i < snapshot.length; i++) {
      const self = snapshot[i];
      const neighbors = this.findNeighbors(self, this.neighborRadius, snapshot);
      next[i] = this.updateAgent(self, neighbors, dt);
    }
    this.agents = next;
  }

  /**
   * Naive O(N²) Euclidean neighbor query. Returns all agents within
   * `radius` of `self`, excluding `self` itself.
   *
   * Override with a uniform-grid hash or kd-tree if profiling shows
   * this is the hotspot for your N. For N ≤ 500 the naive scan is
   * faster than maintaining a spatial index.
   */
  protected findNeighbors(self: A, radius: number, all: A[]): A[] {
    const r2 = radius * radius;
    const out: A[] = [];
    const [sx, sy, sz] = self.position;
    for (const other of all) {
      if (other === self) continue;
      const dx = other.position[0] - sx;
      const dy = other.position[1] - sy;
      const dz = other.position[2] - sz;
      if (dx * dx + dy * dy + dz * dz < r2) out.push(other);
    }
    return out;
  }

  protected override afterReset(): void {
    this.agents = this.initialState();
  }
}
