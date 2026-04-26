/**
 * Universal simulation lifecycle for OpenSim. Every archetype's
 * concrete solver (BaseODE → RK4, BasePDE → finite-difference,
 * BaseAgent → step rule, BaseMC → sampler, BaseCA → cell update)
 * extends this class. The agent never writes the lifecycle itself —
 * just overrides `step()` and `initialState()` (and returns its
 * archetype's state shape via `state`).
 *
 * Lifecycle:
 *   - `play()` — start the requestAnimationFrame loop. Idempotent.
 *   - `pause()` — stop the loop, keep current state.
 *   - `reset()` — pause + restore initial state, then notify observers.
 *   - `subscribe(fn)` — receive `(t, state)` after each loop iteration.
 *
 * The loop uses an accumulator so the underlying `step(dt)` is
 * always called with the configured fixed `dt` regardless of frame
 * jitter. Caps at `MAX_STEPS_PER_FRAME` to prevent the spiral-of-death
 * when the page tab is throttled.
 *
 * KEEP — agent-written code only extends, never modifies.
 */

const MAX_STEPS_PER_FRAME = 250;

export type SolverObserver<S> = (t: number, state: S) => void;

export interface BaseSolverConfig {
  /** Fixed integration step in seconds. */
  dt: number;
}

export abstract class BaseSolver<S> {
  protected _t = 0;
  protected _running = false;
  protected _rafId: number | null = null;
  protected _lastWallTime = 0;
  protected _accumulator = 0;
  /**
   * Fixed integration step (seconds). Public so validator helpers
   * (e.g. `checkConservation`) can read it without casting through
   * `as any`. Read-only because changing dt mid-run would invalidate
   * the integrator's accuracy guarantees.
   */
  readonly dt: number;
  private observers: Set<SolverObserver<S>> = new Set();

  constructor(config: BaseSolverConfig) {
    if (!Number.isFinite(config.dt) || config.dt <= 0) {
      throw new Error(
        `BaseSolver: dt must be a positive finite number, got ${config.dt}`,
      );
    }
    this.dt = config.dt;
  }

  /** Current simulation time in seconds. */
  get t(): number {
    return this._t;
  }

  /** Whether the play loop is active. */
  get isRunning(): boolean {
    return this._running;
  }

  /** Read-only accessor for the simulation state vector / field / agent list / etc. */
  abstract get state(): S;

  /** Return the state vector at t = 0. Must NOT mutate `this`. */
  abstract initialState(): S;

  /**
   * Advance the simulation by `dt` seconds. Subclasses (RK4, RK45, ...)
   * implement the integration scheme. Always called with `this.dt`
   * by the loop — never with arbitrary values.
   */
  abstract step(dt: number): void;

  /** Begin the simulation loop. No-op if already running. */
  play(): void {
    if (this._running) return;
    this._running = true;
    this._lastWallTime = performance.now();
    this._accumulator = 0;
    this._rafId = requestAnimationFrame(this._tick);
  }

  /** Stop the simulation loop. State is preserved. */
  pause(): void {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /** Stop the loop and restore initial state at t = 0. */
  reset(): void {
    this.pause();
    this._t = 0;
    this._accumulator = 0;
    this.afterReset();
    this.notify();
  }

  /**
   * Subscribe to per-frame state notifications. Returns an
   * unsubscribe function. Every observer fires with the current
   * `(t, state)` as soon as it's added so React effects can
   * initialise their local state without waiting for the first step.
   */
  subscribe(observer: SolverObserver<S>): () => void {
    this.observers.add(observer);
    observer(this._t, this.state);
    return () => {
      this.observers.delete(observer);
    };
  }

  /** Hook for subclasses to clear caches / restore state on reset. */
  protected afterReset(): void {
    /* no-op by default */
  }

  /** Notify all observers with the current `(t, state)`. */
  protected notify(): void {
    for (const observer of this.observers) {
      observer(this._t, this.state);
    }
  }

  private _tick = (): void => {
    if (!this._running) return;
    const now = performance.now();
    const wallElapsed = Math.max(0, (now - this._lastWallTime) / 1000);
    this._lastWallTime = now;

    // Catch up on wall time using fixed dt steps. Cap to prevent
    // spiral-of-death when the tab was hidden.
    this._accumulator += wallElapsed;
    let stepsThisFrame = 0;
    while (
      this._accumulator >= this.dt &&
      stepsThisFrame < MAX_STEPS_PER_FRAME
    ) {
      this.step(this.dt);
      this._t += this.dt;
      this._accumulator -= this.dt;
      stepsThisFrame++;
    }
    if (stepsThisFrame >= MAX_STEPS_PER_FRAME) {
      // Drop the residual to avoid a runaway next frame.
      this._accumulator = 0;
    }

    this.notify();
    this._rafId = requestAnimationFrame(this._tick);
  };
}
