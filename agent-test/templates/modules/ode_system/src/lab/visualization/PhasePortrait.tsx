import { useEffect, useState, useRef } from 'react';
import { ChartMonitor, type ChartMonitorProps } from '../instruments';
import type { BaseSolver } from '../../solvers';

/**
 * State-space trajectory plot. Renders the (selectorX(state),
 * selectorY(state)) pair on a `<ChartMonitor>` — for a pendulum
 * that's typically (θ vs ω), giving the classic phase portrait.
 *
 * Differs from TimeSeriesPlot in that the X axis is a state
 * variable, not time. Time-marching the simulation traces a curve
 * through state space, and damping/conservation properties are
 * visually obvious (closed loop = conservative, inward spiral =
 * damped).
 *
 * KEEP — agent code uses it as a drop-in 2D phase plot.
 */
export interface PhasePortraitProps<S>
  extends Omit<ChartMonitorProps, 'data' | 'xLabel' | 'yLabel'> {
  solver: BaseSolver<S>;
  selectorX: (state: S) => number;
  selectorY: (state: S) => number;
  /** Optional point-count cap. Default 4000. */
  maxPoints?: number;
  xLabel?: string;
  yLabel?: string;
}

export function PhasePortrait<S>({
  solver,
  selectorX,
  selectorY,
  maxPoints = 4000,
  xLabel = 'x',
  yLabel = 'y',
  ...chartProps
}: PhasePortraitProps<S>) {
  const [samples, setSamples] = useState<Array<{ x: number; y: number }>>([]);
  const xRef = useRef(selectorX);
  const yRef = useRef(selectorY);
  xRef.current = selectorX;
  yRef.current = selectorY;

  useEffect(() => {
    return solver.subscribe((t, state) => {
      const sample = { x: xRef.current(state), y: yRef.current(state) };
      setSamples((prev) => {
        if (t === 0) return [sample];
        const next = [...prev, sample];
        return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
      });
    });
  }, [solver, maxPoints]);

  return (
    <ChartMonitor
      {...chartProps}
      data={samples}
      xLabel={xLabel}
      yLabel={yLabel}
    />
  );
}
