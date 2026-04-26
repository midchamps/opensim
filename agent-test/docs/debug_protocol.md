# Debug Protocol — OpenSim (Phase 3 placeholder)

> **Scope**: Pre-build verification, numerical-validation strategy, error diagnosis, forbidden operations.
> Phase 5 of the OpenSim plan replaces this with executable validators (NaN, units, conservation, analytic).

---

## 0. Pre-Build Verification Checklist (MUST READ BEFORE `npm run build`)

### 0.1 Config

- [ ] `simConfig.json` still contains `screenSize`, `renderConfig`, `debugConfig` at the top level (the lab scene crashes on mount without them).
- [ ] Every numeric field added in Phase 4 declares a `unit`. Reasonable units include `m`, `kg`, `s`, `1/s`, `K`, `mol`, `V`, `-` (dimensionless).
- [ ] All values use the wrapper format `{ "value": X, "type": "...", "unit": "...", "description": "..." }` and are read in code via `.value`.

### 0.2 Solver / Scene Wiring

- [ ] Every solver class extends a `Base*` from the archetype's `solvers/` directory and overrides only the documented hooks.
- [ ] No `RK4` / `Laplacian5` / RNG re-implemented in agent-written files. They live exclusively in `templates/modules/<archetype>/solvers/` and are imported.
- [ ] Every `<Dial>` in `App.tsx` is bound to a `simConfig` field via `value={cfg.X.value}` + `onChange`.
- [ ] `BaseLabScene` is mounted from `App.tsx` (not extended, not modified).

### 0.3 Imports

- [ ] Classes imported without `type`, interfaces with `type`:
  ```typescript
  import { BaseODE, type ODEConfig } from '../BaseODE';   // CORRECT
  import { BaseODE, ODEConfig } from '../BaseODE';        // build error
  ```
- [ ] No circular references between solver / lab_object / visualization files.

### 0.4 Asset keys

- [ ] Every dataset/parameter_table key referenced in code exists in `public/assets/asset-pack.json`.
- [ ] If Protocol Section 1 was empty, the simulator must NOT read any asset file.

---

## 1. Build / Test / Run Order

```
npm run build    # tsc --noEmit && vite build
npm run test     # vitest, including numerical validators (Phase 5)
npm run dev      # vite dev server, then open the URL it prints
```

If `npm run build` fails: read the FULL error message, jump to the
exact file and line, fix the root cause. **Do NOT guess.** Common
causes:
- A solver hook signature was invented instead of read from
  `template_api.md`.
- A simConfig field was renamed or removed and a code reference
  is now stale.

---

## 2. Phase-5 Numerical Validators (preview)

Phase 5 plugs in automated checks the agent's verify step runs after
each `npm run build`:

| Validator             | Detects                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `NaNDetector`         | Solver state goes non-finite within N steps.                      |
| `UnitConsistency`     | simConfig units don't balance across a solver expression.         |
| `ConservationLaw`     | Energy / mass / momentum drifts beyond Section-6 tolerance.       |
| `AnalyticBenchmark`   | Numerical answer disagrees with closed-form solution.             |
| `CFLCondition`        | (PDE only) dt is too large for the chosen dx and stencil.         |

For now those are spec only. Phase-5 will introduce executable code
under `packages/core/src/validators/`.

---

This document is a Phase-3 placeholder; Phase 5 expands it with
executable validators and a richer pre-build checklist tuned to each
archetype.
