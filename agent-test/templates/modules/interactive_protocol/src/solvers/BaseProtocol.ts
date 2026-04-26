// Path is relative to the AGENT'S deployed simulation tree, not the
// template source repo. After the Phase-1 cp this file ends up at
// `./src/solvers/BaseProtocol.ts` and BaseSolver at
// `./src/solvers/BaseSolver.ts`, both in the same directory.
import { BaseSolver, type BaseSolverConfig } from './BaseSolver';

/**
 * Definition of one step in the procedural protocol.
 */
export interface StepDef<Id extends string = string> {
  /** Stable identifier (used by switch/case in the App's render). */
  id: Id;
  /** Title shown on the InstructionPanel. */
  title: string;
  /** One-sentence instruction shown to the user. */
  instruction: string;
  /**
   * Number of user actions required before the step auto-advances.
   * Use 1 for "click once / drag-drop once". Use n for "press n times".
   * Use 0 for terminal steps (e.g. `done`).
   */
  required: number;
}

/**
 * State shape held by BaseProtocol.
 */
export interface ProtocolState {
  /** Index into the steps array. */
  stepIndex: number;
  /** How many of the current step's `required` actions are done. */
  progress: number;
  /** Smoothly animated [0..1] within the current step's transition. */
  animProgress: number;
  /** Whether the step's transition animation is currently playing. */
  transitioning: boolean;
}

/**
 * Universal base for *interactive procedural* simulations — protocols
 * with a discrete state machine (e.g. lab procedures: DNA extraction,
 * acid-base titration, gel electrophoresis, baking-soda volcano).
 *
 * The agent's concrete subclass overrides:
 *   - `STEPS` (a static `StepDef[]` constant) — list of steps in order.
 *   - The constructor — pass STEPS into super() and any custom config.
 *
 * The agent's App orchestrates which lab object is the *active target*
 * for the current step, wires its onPointerDown / drag-handler /
 * onClick to call `protocol.registerAction()`, and renders state-driven
 * visuals (lift, tilt, stream, splash, etc.).
 *
 * Time integration: BaseProtocol uses BaseSolver's RAF loop only to
 * smoothly animate the inter-step TRANSITION (animProgress 0 → 1 over
 * ~1.7 s when speed = 0.6). User actions register synchronously via
 * registerAction() and don't depend on time.
 *
 * KEEP — agent-written code subclasses BaseProtocol and provides STEPS.
 * Do not modify the lifecycle / step machine here.
 */
export abstract class BaseProtocol<
  Id extends string = string,
> extends BaseSolver<ProtocolState> {
  protected s: ProtocolState;
  /** The protocol's step list (declared by the subclass via constructor). */
  readonly steps: ReadonlyArray<StepDef<Id>>;
  /** Transition speed, fraction of animProgress per second. Default 0.6. */
  protected readonly transitionSpeed: number;

  constructor(
    steps: ReadonlyArray<StepDef<Id>>,
    config: BaseSolverConfig = { dt: 1 / 60 },
    transitionSpeed = 0.6,
  ) {
    super(config);
    if (!steps.length)
      throw new Error('BaseProtocol: steps array must be non-empty.');
    this.steps = steps;
    this.transitionSpeed = transitionSpeed;
    this.s = this.initialState();
  }

  override get state(): ProtocolState {
    return this.s;
  }

  override initialState(): ProtocolState {
    return {
      stepIndex: 0,
      progress: 0,
      animProgress: 0,
      transitioning: false,
    };
  }

  /** Current step definition. */
  get currentStep(): StepDef<Id> {
    return this.steps[this.s.stepIndex]!;
  }

  /** Advance the smooth animation timer during transitions. */
  override step(dt: number): void {
    if (!this.s.transitioning) return;
    const next = Math.min(1, this.s.animProgress + dt * this.transitionSpeed);
    this.s = { ...this.s, animProgress: next };
    if (next >= 1) {
      // Transition complete — advance to next step.
      this.s = {
        stepIndex: Math.min(this.steps.length - 1, this.s.stepIndex + 1),
        progress: 0,
        animProgress: 0,
        transitioning: false,
      };
    }
  }

  /**
   * Record a user action against the current step. If this brings the
   * step's `progress` to its `required` count, kick off the transition
   * animation toward the next step.
   *
   * Returns the new state for convenience (useful in event handlers).
   */
  registerAction(): ProtocolState {
    const step = this.currentStep;
    if (this.s.transitioning) return this.s;
    if (this.s.stepIndex >= this.steps.length - 1 && step.required === 0)
      return this.s;

    const newProgress = this.s.progress + 1;
    if (newProgress >= step.required) {
      this.s = {
        ...this.s,
        progress: step.required,
        transitioning: true,
        animProgress: 0,
      };
    } else {
      this.s = { ...this.s, progress: newProgress };
    }
    this.notify();
    return this.s;
  }

  protected override afterReset(): void {
    this.s = this.initialState();
  }
}
