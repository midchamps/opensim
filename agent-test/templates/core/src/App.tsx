import { BaseLabScene } from './lab/scenes';

/**
 * Root React component for an OpenSim simulation.
 *
 * Phase 1 Commit 3 — mount `BaseLabScene` so the empty workbench
 * (Gate 1) is visible. Future commits will pass archetype-specific
 * children (Pendulum, Beaker, Dial, ChartMonitor, ...) into the
 * scene; the agent customises a simulation by replacing the body of
 * this `<App>` component, never by modifying `BaseLabScene` itself.
 */
export function App() {
  return <BaseLabScene />;
}
