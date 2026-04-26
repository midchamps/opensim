# Asset Protocol — OpenSim (Phase 3 placeholder)

> **Scope**: when (rarely) a simulation needs external scientific data — datasets, parameter tables, initial conditions, lookups — that the simulator code reads at runtime.
> **NOT in scope**: 3D meshes (Three.js renders pendulums / beakers / grids from r3f primitives), charts (drawn from runtime simulation output), audio (no audio in OpenSim).

Most simulations need **NO external assets**. If your Protocol Section
1 is empty, skip Phase 3 entirely and go to Phase 4.

---

## When you DO need an asset

Call `generate_simulation_assets` with one entry per asset:

```typescript
generate_simulation_assets({
  output_dir_name: 'public/assets',
  assets: [
    { type: 'dataset',         key: 'co2_history',         description: '...', source: 'https://...' },
    { type: 'parameter_table', key: 'arrhenius_constants', description: '...', source: 'NIST WebBook' },
    { type: 'initial_condition', key: 'solar_system_t0',  description: '...', source: 'JPL Horizons' },
    { type: 'lookup',          key: 'water_viscosity',     description: '...', source: 'CRC Handbook' },
  ]
})
```

### Type semantics

| `type`              | Shape inside the JSON file              | Read pattern                                         |
| ------------------- | --------------------------------------- | ---------------------------------------------------- |
| `dataset`           | `{ rows: [{x, y, ...}, ...] }`         | Time-series or table for fitting / comparison.       |
| `parameter_table`   | `{ name → number }`                     | Look up constants by name in solver code.            |
| `initial_condition` | `{ y0: number[], t0: number }`         | Pass to `BaseSolver.reset(y0, t0)`.                  |
| `lookup`            | `{ xs: number[], ys: number[] }`       | Linear interpolation at runtime.                     |

### Phase-3 stub behaviour

The current `generate_simulation_assets` writes
`{ "status": "stub", "values": null }` — you must fill the real
values manually (or wait for a Phase-4+ fetcher implementation that
queries NIST / PubChem / Wolfram Alpha automatically).

---

## Key consistency

Every key referenced from solver code via `import data from '../assets/{key}.json'`
or via `fetch('assets/{key}.json')` MUST appear in the asset list passed
to `generate_simulation_assets`. The Phase-6 validator cross-checks
asset keys.

---

This document is a Phase-3 placeholder. Phase 4 (with the first real
archetype templates) revises it as needed once the actual data-flow
shape is exercised by a working simulation.
