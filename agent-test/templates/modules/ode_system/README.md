# `ode_system` Archetype Template

Phase-4 deliverable. After the agent's Phase-1 cp, the contents of
`src/` here merge into the user's working `src/`, layering the
ODE-specific solver and lab catalog on top of the universal
`templates/core/` scaffold.

## What this module ships

```
src/
├── solvers/
│   ├── BaseODE.ts          # extends BaseSolver, adds rhs(t, y)
│   ├── RK4.ts              # extends BaseODE, fixed-step RK4
│   ├── _TemplateODE.ts     # copy-and-customise scaffold
│   └── index.ts            # barrel re-export (also re-exports BaseSolver)
└── lab/
    ├── lab_objects/
    │   ├── Pendulum.tsx    # rod + bob, controlled by `angle` prop
    │   └── index.ts
    └── visualization/
        ├── TimeSeriesPlot.tsx   # subscribes to BaseSolver, plots one scalar over t
        ├── PhasePortrait.tsx    # subscribes, plots (selectorX, selectorY) trajectory
        └── index.ts
```

## How the agent uses it

1. `classify_simulation_type` → `ode_system`.
2. `cp -r templates/core/* ./` → universal Three.js + r3f scaffold +
   the `lab/` instruments + `simConfig.json`.
3. `cp -r templates/modules/ode_system/src/* ./src/` → adds the
   solvers and overrides the empty `lab_objects/index.ts` and
   `lab/visualization/index.ts` with the ODE-specific exports.
4. `generate_protocol` → six-section Protocol Document.
5. Agent reads `docs/modules/ode_system/template_api.md`, then
   copies `_TemplateODE.ts` → `MyODE.ts`, overrides `initialState()`
   and `rhs(t, y)`, mounts a `<Pendulum>` + dials + buttons +
   monitors in `App.tsx`.

The MVP target (Gate 4) is a damped pendulum end-to-end from a one-line
prompt.
