# Debug Protocol — OpenSim (Phase 5)

> **Scope**: Pre-build verification, executable numerical validators, error diagnosis, forbidden operations.
> The validator helpers referenced below ship in `templates/core/src/validators/` and end up in the agent's working `src/validators/` after the Phase-1 cp.

---

## 0. Pre-Build Verification Checklist (MUST READ BEFORE `npm run build`)

### 0.1 Config

- [ ] `simConfig.json` still contains `screenSize`, `renderConfig`, `debugConfig` at the top level (the lab scene crashes on mount without them).
- [ ] Every numeric field added in Phase 4 declares a `unit`. Reasonable units include `m`, `kg`, `s`, `1/s`, `K`, `mol`, `V`, `-` (dimensionless). The `checkUnitConsistency` validator below enforces this.
- [ ] All values use the wrapper format `{ "value": X, "type": "...", "unit": "...", "description": "..." }` and are read in code via `.value`.

### 0.2 Solver / Scene Wiring

- [ ] Every solver class extends a `Base*` from the archetype's `solvers/` directory and overrides only the documented hooks.
- [ ] No `RK4` / `Laplacian5` / RNG re-implemented in agent-written files. They live exclusively in `templates/modules/<archetype>/solvers/` and are imported.
- [ ] Every `<Dial>` in `App.tsx` is bound to a `simConfig` field via `value={cfg.X.value}` + `onChange`. The `onChange` handler MUST update both the React state AND `simConfig.<field>.value` so the solver's `rhs(t, y)` sees the new value.
- [ ] `BaseLabScene` is mounted from `App.tsx` (not extended, not modified).

### 0.3 Imports

- [ ] Classes imported without `type`, interfaces with `type`:
  ```typescript
  import { BaseODE, type ODEState } from './solvers';        // CORRECT
  import { BaseODE, ODEState } from './solvers';             // build error
  ```
- [ ] No circular references between solver / lab_object / visualization files.

### 0.4 Asset keys

- [ ] Every dataset / parameter_table key referenced in code exists in `public/assets/asset-pack.json`. Most ODE simulations should have ZERO asset references.

---

## 1. Build / Test / Run Order

```
npm install               # always run AT LEAST ONCE in a fresh output dir
npm run build             # tsc --noEmit && vite build
npm run test              # vitest, including Phase-5 numerical validators
npm run dev               # vite dev server, then open the URL it prints
```

### Common build failure: "Cannot find module '../lib/tsc.js'"

This means `node_modules/typescript` is corrupted or missing. Recovery:

```bash
rm -rf node_modules package-lock.json
npm install
```

Do NOT try to install `typescript` standalone with `npm install typescript` — the workspace `package.json` already pins it; the corruption is the issue, not the absence.

---

## 2. Phase-5 Executable Validators

All four ship in `src/validators/` after the Phase-1 cp. The agent imports them in a vitest test file (commonly `src/test/validation.test.ts`) and asserts on their results. Failing tests block Gate-6 sign-off.

### 2.1 `NaNDetector` — runtime guard

```typescript
import { NaNDetector } from '../validators';

it('solver state stays finite for the entire simulation', () => {
  const solver = new DampedPendulumODE();
  const totalSteps = simConfig.simulationDuration.value / simConfig.simulationTimeStep.value;
  for (let i = 0; i < totalSteps; i++) {
    solver.step(simConfig.simulationTimeStep.value);
    NaNDetector.check(solver.state, 'pendulum.state');
  }
});
```

Catches: `dt` too large for the integrator, stiff equations needing implicit / adaptive solver, bug in `rhs()` returning NaN.

### 2.2 `checkUnitConsistency` — static config audit

```typescript
import { checkUnitConsistency } from '../validators';
import simConfig from '../simConfig.json';

it('every numeric simConfig field declares a unit', () => {
  expect(checkUnitConsistency(simConfig)).toEqual([]);
});
```

The infrastructure fields (`screenSize`, `renderConfig`, `debugConfig`) are skipped automatically. To skip your own infrastructure namespace, pass `{ skipPaths: ['myInfra', 'myInfra.flag'] }`.

### 2.3 `checkConservation` — drift bound on a conserved scalar

```typescript
import { checkConservation } from '../validators';
import { calculateObservables } from '../observables';

it('energy is conserved when damping = 0 (1% over 100 periods)', () => {
  simConfig.dampingCoefficient.value = 0;
  const solver = new DampedPendulumODE();
  const T = 2 * Math.PI * Math.sqrt(simConfig.length.value / simConfig.gravity.value);

  const result = checkConservation(solver, {
    name: 'Energy',
    compute: ([theta, omega]) => calculateObservables(theta, omega).E_total,
    tolerance: 0.01,
    totalTime: 100 * T,
  });

  expect(result.passed).toBe(true);
});
```

Returns `{ initialValue, finalValue, drift, tolerance, passed, totalSteps }`. On failure, the values pinpoint whether drift was tiny-but-over or massive (the latter usually means the integrator is wrong, not just dt).

### 2.4 `compareToAnalytic` + `detectPeriodFromZeroCrossings`

```typescript
import { compareToAnalytic, detectPeriodFromZeroCrossings } from '../validators';

it('small-angle period matches T = 2π√(L/g) within 2%', () => {
  simConfig.initialAngle.value = 0.05;
  simConfig.dampingCoefficient.value = 0;
  const solver = new DampedPendulumODE();

  const samples: Array<{ t: number; y: number }> = [];
  let t = 0;
  for (let i = 0; i < 2000; i++) {
    solver.step(simConfig.simulationTimeStep.value);
    t += simConfig.simulationTimeStep.value;
    // Use angular velocity ω as the oscillating signal; rising zero
    // crossings of ω happen once per period at the bottom of the swing.
    samples.push({ t, y: solver.state[1] });
  }

  const observed = detectPeriodFromZeroCrossings(samples, 'rising');
  expect(observed).not.toBeNull();
  const T = 2 * Math.PI * Math.sqrt(simConfig.length.value / simConfig.gravity.value);
  const result = compareToAnalytic('Pendulum period', observed!, T, 0.02);
  expect(result.passed).toBe(true);
});
```

`detectPeriodFromZeroCrossings` does sub-step linear interpolation, so the result is much more accurate than a naive count even at `dt = 0.01`.

---

## 3. Pendulum-archetype Phase-6 minimum test (`src/test/validation.test.ts`)

The agent SHOULD ship a test file containing all four validators above plus the `simConfig` reset block in `beforeEach`. A passing test file means:

1. Section-2 units are complete.
2. The integrator preserves energy when damping is 0.
3. The integrator reproduces the small-angle pendulum period.
4. Nothing goes NaN inside the simulation duration.

If any of those fail, Gate-6 is NOT passed regardless of what the visual workbench looks like.

---

## 4. Forbidden during debugging

- Do NOT comment out validator assertions to make tests pass — that defeats the entire Phase-5 mechanism.
- Do NOT raise the `tolerance` past Section-6 declared tolerances. If the simulator can't meet them, the integrator / scheme is wrong; revisit Phase 3.
- Do NOT delete `node_modules` mid-run if the dev server is open in another terminal — kill the server first.
- Do NOT `npm install <random-package>` to fix an error. Every dependency the templates need is already pinned in `templates/core/package.json`.

---

This document supersedes the Phase-3 placeholder. Phase 6+ adds archetype-specific extensions (CFL condition for `pde_grid`, convergence-rate test for `monte_carlo`, pattern-stability for `cellular_automata`).
