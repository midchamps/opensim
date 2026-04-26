/**
 * ODE archetype visualization exports.
 *
 * After the Phase-1 cp this overrides the empty barrel from
 * `templates/core/src/lab/visualization/index.ts`.
 *
 * Both components subscribe directly to a `BaseSolver` and update
 * their internal sample buffer on every notify — agent code only
 * needs to pass the solver + selector, never plumbs samples by
 * hand.
 */
export { TimeSeriesPlot, type TimeSeriesPlotProps } from './TimeSeriesPlot';
export { PhasePortrait, type PhasePortraitProps } from './PhasePortrait';
