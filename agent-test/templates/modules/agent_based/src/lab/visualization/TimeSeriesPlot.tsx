import { useEffect, useState, useRef } from 'react';
import { ChartMonitor, type ChartMonitorProps } from '../instruments';
import type { BaseSolver } from '../../solvers';

/**
 * Wraps `<ChartMonitor>` with a rolling buffer that subscribes to a
 * `BaseSolver`. The agent passes:
 *   - the solver instance,
 *   - a `selector(state)` that returns the scalar to plot,
 *   - axis labels and an optional fixed window in seconds.
 *
 * Plot updates whenever the solver notifies (every frame while
 * running). When `windowSeconds` is set, only the most recent
 * `windowSeconds` worth of samples are kept.
 *
 * KEEP — agent code uses this as a drop-in chart for any single
 * scalar observable.
 */
export interface TimeSeriesPlotProps<S> extends Omit<
  ChartMonitorProps,
  'data' | 'xLabel' | 'yLabel'
> {
  /** Source of truth for the simulation state. */
  solver: BaseSolver<S>;
  /** Pulls the scalar to plot out of the state vector / object. */
  selector: (state: S) => number;
  /** Optional fixed-duration window. When set, older samples are dropped. */
  windowSeconds?: number;
  /** X-axis label. Default `t (s)`. */
  xLabel?: string;
  /** Y-axis label. Default `value`. */
  yLabel?: string;
}

export function TimeSeriesPlot<S>({
  solver,
  selector,
  windowSeconds,
  xLabel = 't (s)',
  yLabel = 'value',
  ...chartProps
}: TimeSeriesPlotProps<S>) {
  const [samples, setSamples] = useState<Array<{ x: number; y: number }>>([]);
  // Cache the latest selector in a ref so we don't re-subscribe just
  // because the parent re-defined the callback inline.
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  useEffect(() => {
    return solver.subscribe((t, state) => {
      const y = selectorRef.current(state);
      setSamples((prev) => {
        const next = [...prev, { x: t, y }];
        if (windowSeconds !== undefined) {
          const cutoff = t - windowSeconds;
          let firstKeep = 0;
          while (firstKeep < next.length && next[firstKeep].x < cutoff)
            firstKeep++;
          return firstKeep > 0 ? next.slice(firstKeep) : next;
        }
        // Hard cap so memory doesn't grow forever in undamped runs.
        return next.length > 4000 ? next.slice(next.length - 4000) : next;
      });
    });
  }, [solver, windowSeconds]);

  // Reset samples when the solver does (subscribe always fires once
  // with current state, so a reset to t=0 lands here).
  useEffect(() => {
    return solver.subscribe((t) => {
      if (t === 0) setSamples([]);
    });
  }, [solver]);

  return (
    <ChartMonitor
      {...chartProps}
      data={samples}
      xLabel={xLabel}
      yLabel={yLabel}
    />
  );
}
