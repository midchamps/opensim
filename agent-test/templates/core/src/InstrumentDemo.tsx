import { useEffect, useState } from 'react';
import { BaseLabScene } from './lab/scenes';
import {
  Dial,
  Button3D,
  DigitalReadout,
  ChartMonitor,
} from './lab/instruments';

/**
 * Standalone demo that mounts every Phase-2 instrument on the workbench.
 * Used to verify Gate 2 — drag the dials, click the buttons, watch the
 * digital readout and chart monitor react.
 *
 * Activated by `?demo=instruments` in the URL (see App.tsx).
 *
 * The wiring here is intentionally toy:
 *   - Length / Mass / Damping dials feed nothing (just exercise the dial)
 *   - Run/Pause/Reset buttons toggle a fake "running" state that
 *     advances a sine-wave time series for the ChartMonitor
 *   - DigitalReadout shows the current Length value plus the sample
 *     count from the chart
 */
export function InstrumentDemo() {
  const [length, setLength] = useState(1.5);
  const [mass, setMass] = useState(2.0);
  const [damping, setDamping] = useState(0.1);
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const [samples, setSamples] = useState<Array<{ x: number; y: number }>>([]);

  // Tick a fake time-series while running.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setT((tt) => tt + 0.05);
    }, 50);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    setSamples((prev) => {
      const next = [
        ...prev,
        { x: t, y: Math.sin((2 * Math.PI * t) / length) * Math.exp(-damping * t) },
      ];
      // Keep the last 200 points so the chart doesn't grow unbounded.
      return next.length > 200 ? next.slice(next.length - 200) : next;
    });
  }, [t, running, length, damping]);

  const reset = () => {
    setRunning(false);
    setT(0);
    setSamples([]);
  };

  return (
    <BaseLabScene>
      {/* --- Three dials in a row at the front of the desk --- */}
      <Dial
        label="Length"
        unit="m"
        value={length}
        min={0.5}
        max={3.0}
        onChange={setLength}
        position={[-0.7, 0, 0.7]}
      />
      <Dial
        label="Mass"
        unit="kg"
        value={mass}
        min={0.1}
        max={5.0}
        onChange={setMass}
        position={[-0.4, 0, 0.7]}
      />
      <Dial
        label="Damping"
        unit="1/s"
        value={damping}
        min={0}
        max={1}
        onChange={setDamping}
        position={[-0.1, 0, 0.7]}
      />

      {/* --- Three control buttons at the right --- */}
      <Button3D
        label={running ? 'Pause' : 'Run'}
        kind={running ? 'pause' : 'run'}
        onPress={() => setRunning((r) => !r)}
        position={[0.85, 0, 0.7]}
      />
      <Button3D
        label="Reset"
        kind="reset"
        onPress={reset}
        position={[1.1, 0, 0.7]}
      />

      {/* --- Digital readouts in the middle of the desk --- */}
      <DigitalReadout
        label="LENGTH"
        value={`${length.toFixed(2)} m`}
        position={[0.4, 0, 0.5]}
        rotationY={-0.3}
      />
      <DigitalReadout
        label="SAMPLES"
        value={String(samples.length)}
        position={[0.4, 0, 0.18]}
        rotationY={-0.3}
      />

      {/* --- Wall-mounted chart at the back --- */}
      <ChartMonitor
        title="DAMPED OSCILLATION"
        xLabel="t (s)"
        yLabel="y"
        data={samples}
        position={[0, 0.05, -0.9]}
        size={[1.2, 0.65]}
      />
    </BaseLabScene>
  );
}
