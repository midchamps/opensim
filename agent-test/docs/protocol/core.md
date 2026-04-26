# Protocol Core Rules (Universal)

> Applies to ALL simulation archetypes. Config-First philosophy.

---

## Design Philosophy

1. **Config-Driven** — every numeric value lives in `simConfig.json` with a declared `unit`. Never hard-code.
2. **Solver-Based** — use existing solvers / stencils / RNGs from the archetype's `template_api.md`. Never write your own RK4.
3. **Hook-Oriented** — extend `Base*` classes via documented hook overrides; don't modify the base classes themselves.
4. **Template-First** — copy `_Template*` files into your simulation, then customize.

---

## Output Structure (6 Sections)

The Protocol Document is a **Technical Specification** — every section is a contract for one execution step:

| Section | Title                          | Downstream Consumer                                                |
| ------- | ------------------------------ | ------------------------------------------------------------------ |
| **0**   | System Overview & Hypothesis   | README, simulator title, App.tsx page metadata                    |
| **1**   | Assets / External Data         | `generate_simulation_assets` — datasets, lookups, parameter tables |
| **2**   | Variables & Units              | `src/simConfig.json` — config merge                                |
| **3**   | Numerical Scheme               | Solver / stencil / RNG selection from `template_api.md`            |
| **4**   | Lab Layout & Visualization     | `src/App.tsx` children: lab_objects + instruments + visualization  |
| **5**   | Observables & Roadmap          | DigitalReadout / ChartMonitor mappings + per-file todo list        |
| **6**   | Validation Targets             | Phase-6 numerical validators                                       |

---

## Section Guidelines

### Section 0 — System Overview & Hypothesis

One paragraph. State:
- The system being simulated (e.g. "a damped pendulum of length L and mass m").
- The hypothesis or question (e.g. "verify that period T = 2π√(L/g) holds for small angles, and observe how damping affects amplitude decay").
- The qualitative outcome the user should observe at runtime.

### Section 1 — Assets / External Data

Empty for most archetypes. When present:

| type              | key                  | description                                       | source                          |
| ----------------- | -------------------- | ------------------------------------------------- | ------------------------------- |
| `dataset`         | `co2_history`        | Mauna Loa CO₂ measurements 1958–2024              | https://gml.noaa.gov/ccgg/...    |
| `parameter_table` | `arrhenius_kinetics` | Pre-Boltzmann factors and activation energies     | NIST Webbook                    |
| `initial_condition` | `solar_system_t0` | Position + velocity of planets at J2000.0          | JPL Horizons                    |
| `lookup`          | `viscosity_water`    | Dynamic viscosity μ(T) for liquid water           | CRC Handbook                    |

If no external data is needed, write **"None — closed-form simulation"** and skip to Section 2.

### Section 2 — Variables & Units

Write the COMPLETE `simConfig.json` content (no truncation). Every entry is wrapped:

```json
"length": {
  "value": 1.5,
  "type": "number",
  "unit": "m",
  "min": 0.5,
  "max": 3.0,
  "description": "Pendulum length from pivot to bob centre"
}
```

Required fields per entry:
- `value` — initial / default numeric, boolean, or string.
- `type` — `"number" | "boolean" | "string"`.
- `unit` — SI unit string (`"m"`, `"kg"`, `"s"`, `"1/s"`, `"K"`, `"V"`, `"-"` for dimensionless). REQUIRED for numeric fields. The Phase-6 unit-consistency validator depends on it.
- `description` — one short sentence.

Optional fields:
- `min`, `max` — bounds. Drive the range of `<Dial>` widgets.
- `step` — granularity hint.

### Section 3 — Numerical Scheme

Pick ONE solver / stencil / RNG from `docs/modules/{archetype}/template_api.md` and configure it. State:
- The solver class (e.g. `RK4`, `RK45`, `Mulberry32`, `Laplacian5`, `UniformGrid2D`).
- Step size (dt for time-marching, dx for spatial grids).
- Tolerances if adaptive.
- The hook you override to specify the right-hand side / transition rule / sample function.
- The reason the chosen scheme is appropriate (one sentence on stability or accuracy).

### Section 4 — Lab Layout & Visualization

List the 3D children of `<BaseLabScene>` in `App.tsx`:

| Component       | Purpose                          | Approximate position on desk      |
| --------------- | -------------------------------- | --------------------------------- |
| `<Pendulum>`    | The dynamic experimental object  | `[0, 0, 0]` (centre)              |
| `<Dial>` × 3    | Length / Mass / Damping inputs   | `[-0.7..-0.1, 0, 0.7]`            |
| `<Button3D>` × 2 | Run/Pause + Reset                | `[0.85..1.1, 0, 0.7]`             |
| `<DigitalReadout>` × N | Live measurements          | Middle of desk, slight rotation   |
| `<ChartMonitor>` × M | Time series, phase portrait | Wall behind desk `[0, 0, -0.9]`   |

Reuse the catalog — every Section-2 numeric becomes one `<Dial>`, every Section-5 observable becomes one `<DigitalReadout>` and/or one `<ChartMonitor>` series.

### Section 5 — Observables & Roadmap

List measurement quantities (each one becomes a DigitalReadout / ChartMonitor):
- Symbol & name (e.g. `T — period`).
- Unit.
- How it is computed from solver state.

Then number a file-level roadmap:
```
1. UPDATE simConfig.json: paste Section 2.
2. UPDATE LevelManager.ts (if present): set entry-point scene key.
3. CREATE src/PendulumODE.ts: extends BaseODE, override rhs(t, y).
4. UPDATE src/App.tsx: mount <BaseLabScene> with <Pendulum>, three <Dial>, ...
5. CREATE src/observables.ts: derive period, amplitude, energy from state.
6. ...
```

### Section 6 — Validation Targets

List the numerical-validation checks the simulator must pass:

| Check                | Expectation                                                            | Tolerance       |
| -------------------- | ---------------------------------------------------------------------- | --------------- |
| NaN propagation      | Solver state stays finite for the entire run.                          | hard            |
| Unit consistency     | Section-2 units balance across solver math.                            | hard (static)    |
| Energy conservation  | E = ½mv² + mgh(1−cosθ) drifts < 1% over 100 periods.                   | 1%               |
| Analytic baseline    | At small angle, observed period within 2% of T = 2π√(L/g).              | 2%               |
| Grid refinement      | (PDE only) halving dx changes outcome < 5%.                            | 5%               |

Phase-6 validators read this section and run automated comparisons.

---

## Forbidden in PROTOCOL

Do NOT write:

- "Implement custom solver from scratch."
- "Create custom Three.js mesh."
- "Write new lab_object component."
- Numeric values without a `unit`.
- Hook names that aren't in `template_api.md`.

Instead write:

- "Use `RK4` with dt=0.01 s, override `rhs(t, y)` to return `[v, -g/L * sin(theta) - damping * v]`."
- "Mount `<Pendulum length={cfg.length.value} mass={cfg.mass.value} angle={state.theta}>` at `[0, 0, 0]`."
- "Bind `<Dial label='Length' value={cfg.length.value} unit={cfg.length.unit} onChange={...}>` to simConfig.length."
