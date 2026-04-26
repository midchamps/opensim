/**
 * Data → mesh adapters for plotting simulation output.
 *
 * Phase 4 (with ode_system) will add:
 *   - TimeSeriesPlot — 1-D time vs value graph on a wall monitor
 *   - PhasePortrait — 2-D state-space trajectory
 * Later:
 *   - Trajectory3D — 3-D agent path lines (agent_based)
 *   - HeatmapPanel — 2-D scalar field on a flat surface (PDE, CA)
 *   - ContourPlot — equipotential / level-set lines
 *   - HistogramPanel — distribution display (Monte Carlo)
 *
 * These read from an Observable stream produced by the simulation
 * BaseSolver and render incrementally each frame.
 */
export {};
