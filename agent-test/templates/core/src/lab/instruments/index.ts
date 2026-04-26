/**
 * Measurement & control widgets (3D meshes on the workbench).
 *
 *   - Dial — rotating knob bound to a numeric simConfig field
 *   - Button3D — Run / Pause / Reset / Step / Export, with depress feedback
 *   - DigitalReadout — LCD-style numeric display for live observables
 *   - ChartMonitor (Phase 2.3) — Plotly-style time-series on a wall mesh
 *
 * All instruments are KEEP — the agent imports and parameterizes them,
 * never rewrites the internals.
 */
export { Dial, type DialProps } from './Dial';
export { Button3D, type Button3DProps, type Button3DKind } from './Button3D';
export { DigitalReadout, type DigitalReadoutProps } from './DigitalReadout';
