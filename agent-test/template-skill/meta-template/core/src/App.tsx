import { BaseLabScene } from './lab/scenes';
import { InstrumentDemo } from './InstrumentDemo';

/**
 * Root React component for an OpenSim simulation.
 *
 * Default — mount `BaseLabScene` so the empty workbench (Gate 1) is
 * visible. The agent customises a real simulation by replacing this
 * with archetype-specific children passed into BaseLabScene.
 *
 * Dev-only demo — `?demo=instruments` URL query renders the
 * InstrumentDemo (Gate 2) which exercises every Phase-2 widget on
 * the workbench. This is a developer-only escape hatch and is never
 * touched by agent runs.
 */
export function App() {
  const demo =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('demo');

  if (demo === 'instruments') return <InstrumentDemo />;
  return <BaseLabScene />;
}
