# `ode_system/src/` — Phase 4 placeholder

When Phase 4 lands this directory will contain:

- `BaseODE.ts` — abstract base for `dy/dt = F(t, y)` solvers.
- `_TemplateODE.ts` — copy-and-customise scaffold the agent uses.
- `solvers/`
  - `RK4.ts` — fixed-step 4th-order Runge-Kutta.
  - `RK45.ts` — adaptive (Dormand-Prince).
  - `EulerMaruyama.ts` — for SDEs.
- `lab_objects/`
  - `Pendulum.tsx` — rod + bob mesh, `setAngle(theta)` only.
  - `Spring.tsx` — coil mesh, `setExtension(x)`.
- `visualization/`
  - `TimeSeriesPlot.tsx` — wraps `<ChartMonitor>` with auto-update.
  - `PhasePortrait.tsx` — 2-D state-space trajectory.

For now this file just keeps the directory tracked so
`classify_simulation_type`'s `cp -r .../src/* ./src/` succeeds.
