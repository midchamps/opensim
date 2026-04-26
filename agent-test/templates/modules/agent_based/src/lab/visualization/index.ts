/**
 * agent_based archetype visualization exports.
 *
 * After the Phase-1 cp this overrides the empty barrel from
 * `templates/core/src/lab/visualization/index.ts`.
 *
 * `TimeSeriesPlot` subscribes to a `BaseSolver` and plots
 * `selector(state)` against time. For agent_based simulations the
 * selector typically reduces the agent list to a scalar — average
 * speed, polarization, count of infected agents, etc.
 */
export { TimeSeriesPlot, type TimeSeriesPlotProps } from './TimeSeriesPlot';
