# `ode_system` Design Rules

Domain-specific Protocol-authoring guide for the ODE archetype. The
`generate_protocol` tool feeds this file into the LLM as a system
prompt addendum so the resulting Protocol Document is concrete and
opinionated rather than generic.

---

## When to use this archetype

- The state is a **finite vector** y(t) — typically 2 to 10 entries.
- The only independent variable is **time** (no spatial extent).
- Evolution is described by **ordinary differential equations** of
  the form `dy/dt = F(t, y)` — possibly with stochastic kicks
  (Euler-Maruyama) or constraints (DAEs), but predominantly ODE.

If the system has spatial extent (heat in a rod, gas in a box,
fluid flow), use `pde_grid` instead. If "many independent agents"
is the headline (boids, SIR-with-individuals, traffic), use
`agent_based`.

## Protocol Section choices

### Section 2 — Variables & Units

Every numeric must declare a SI `unit`. Common units in ODE
problems:

| Quantity                  | Unit         |
| ------------------------- | ------------ |
| Length                    | `m`          |
| Mass                      | `kg`         |
| Time                      | `s`          |
| Velocity                  | `m/s`        |
| Angle                     | `rad`        |
| Angular velocity          | `rad/s`      |
| Force                     | `N`          |
| Energy                    | `J`          |
| Damping (linear in v / ω) | `1/s`        |
| Spring stiffness          | `N/m`        |
| Charge                    | `C`          |
| Voltage                   | `V`          |
| Current                   | `A`          |
| Resistance                | `Ω`          |
| Capacitance               | `F`          |
| Inductance                | `H`          |
| Population (continuous)   | `-`          |
| Reaction rate             | `1/s`        |

`-` (single dash) marks a dimensionless quantity. Use it for ratios,
counts, and probabilities so the unit-consistency validator knows
to skip the field rather than complain about a missing unit.

Always include `simulationTimeStep` (`s`) and `simulationDuration`
(`s`) so the agent can wire the solver constructor and the
visualization window. A typical pendulum needs `dt ≈ 0.01 s`; a
stiffer chemical-kinetics problem may need `dt ≈ 1e-5 s` (or RK45
adaptive — see Section 3).

### Section 3 — Numerical Scheme

Decision tree:

1. **Non-stiff and well-behaved (pendulum, Lotka-Volterra, simple
   orbital, RC, RLC)**: pick `RK4` with a fixed `dt` chosen so the
   smallest natural period of the system is resolved by ≥ 50 steps.
2. **Stiff or with widely separated timescales (chemical kinetics
   with fast/slow modes, populations of vastly different scales)**:
   `RK45` adaptive (Phase-4 ships `RK4` only; if the simulation
   really requires adaptive stepping, prefer to let `RK4` succeed
   with a tiny `dt` and document the trade-off in the Protocol).
3. **Stochastic ODE (SDE, Langevin equation)**: `EulerMaruyama` —
   not yet shipped; fall back to `RK4` for the deterministic part.

State the right-hand side as a literal mathematical expression:

```text
y = [theta, omega]
d(theta)/dt = omega
d(omega)/dt = -(g/L) * sin(theta) - b * omega
```

…and reference the simConfig fields used (`g = simConfig.gravity.value`,
etc.) so the implementing code is mechanical.

### Section 4 — Lab Layout & Visualization

Default ODE workbench (use this unless the simulation specifically
needs a different shape):

| Component        | Count | Position pattern                          | Bound to                         |
| ---------------- | ----- | ----------------------------------------- | -------------------------------- |
| `<Pendulum>` /   |       |                                           |                                  |
|   `<Spring>`     | 1     | `[0, 0, 0]` (centre)                      | `length`, `mass`, `angle`/`x`    |
| `<Dial>`         | 3-5   | `[-0.85 + 0.3*i, 0, 0.7]` for i = 0..N-1   | one per Section-2 numeric        |
| `<Button3D>`     | 2     | `[0.85, 0, 0.7]` and `[1.10, 0, 0.7]`      | Run/Pause and Reset              |
| `<DigitalReadout>`| 2-4  | `[0.20 + 0.20*i, 0, 0.7]`, `rotationY: -0.3` | one per observable (θ, ω, t, E) |
| `<ChartMonitor>` |       |                                           |                                  |
|   (TimeSeriesPlot)| 1   | `[0,  0.50, -0.9]`                         | observable vs time               |
|   (PhasePortrait) | 1   | `[0, -0.20, -0.9]`                         | (state[0], state[1])             |

Always include at least one PhasePortrait — for ODE systems it
visually reveals conservation / damping / limit cycles and is a
free Phase-6 sanity check.

### Section 5 — Observables & Roadmap

Standard observables for mechanical ODE systems:

- `t` — simulation time, unit `s`.
- `θ` (or `x`) — primary state.
- `ω` (or `v`) — first derivative.
- `KE` — kinetic energy.
- `PE` — potential energy.
- `E_total = KE + PE` — total energy. Tracked specifically for the
  Phase-6 conservation validator.

Roadmap typically has exactly 4 file operations:

1. UPDATE `src/simConfig.json` ← Section 2.
2. CREATE `src/<NameOfYourODE>ODE.ts` ← copy `_TemplateODE.ts`,
   override `initialState()` and `rhs()`.
3. UPDATE `src/App.tsx` ← see `template_api.md` §5 worked example.
4. (optional) CREATE `src/observables.ts` ← derive KE/PE/E_total
   from the current state if the Protocol's Section 6 requires
   conservation tracking.

### Section 6 — Validation Targets

Default targets every ODE Protocol should include:

- **NaN propagation** — solver state stays finite.
- **Unit consistency** — Section-2 units balance across `rhs`.
- **Energy conservation (when undamped)** — when the damping
  coefficient is set to 0, `E_total` should drift by less than 1%
  over 100 natural periods.
- **Analytic baseline** — at small initial displacement and zero
  damping, the observed period should match the closed-form
  expression within 2%.

For systems without a closed-form analytic baseline (Lotka-Volterra,
chemical kinetics with > 2 species), substitute a "long-time
qualitative" target — e.g. for predator-prey, population should
exhibit closed limit cycles in the phase portrait.

---

## Forbidden in ODE Protocols

- Hand-rolled integrators (`y[i+1] = y[i] + dt * F(t, y)` Euler).
  Always use `RK4` or `RK45`.
- Hard-coded numeric values in `rhs()`. Read every constant from
  `simConfig.<field>.value`.
- Mutating `y` inside `rhs()` — RK4 calls it four times per step
  with intermediate state. Mutation breaks the integrator silently.
- Skipping Section 6 conservation checks. Even if your specific
  simulation has no closed-form solution, document the qualitative
  validation target.
