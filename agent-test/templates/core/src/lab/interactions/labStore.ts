import { create } from 'zustand';

/**
 * Tiny shared state for in-canvas interactions.
 *
 * The only flag right now is `instrumentActiveCount` — the number of
 * lab instruments currently being interacted with (drag, click, etc.).
 * BaseLabScene reads it to disable OrbitControls while the count is
 * positive, so dragging a Dial or pressing a Button3D doesn't also
 * spin the camera at the same time. Future interactions (DragMove for
 * picking up the pendulum bob, etc.) increment / decrement the same
 * counter.
 *
 * KEEP — agent-written code never reads or writes this directly. The
 * `DragRotate` / `ClickPress` primitives wire it up automatically and
 * `BaseLabScene` consumes it.
 */
interface LabState {
  /** How many concurrent instrument interactions are in progress. */
  instrumentActiveCount: number;
  /** Whether an instrument is currently being interacted with. */
  isInstrumentActive: boolean;
  beginInstrumentInteraction: () => void;
  endInstrumentInteraction: () => void;
}

export const useLabStore = create<LabState>((set, get) => ({
  instrumentActiveCount: 0,
  isInstrumentActive: false,
  beginInstrumentInteraction: () => {
    const next = get().instrumentActiveCount + 1;
    set({
      instrumentActiveCount: next,
      isInstrumentActive: next > 0,
    });
  },
  endInstrumentInteraction: () => {
    // Floor at 0 — paranoid guard for cancelled / mismatched events.
    const next = Math.max(0, get().instrumentActiveCount - 1);
    set({
      instrumentActiveCount: next,
      isInstrumentActive: next > 0,
    });
  },
}));
