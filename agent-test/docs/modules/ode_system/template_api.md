# `ode_system` Template API

> **Read this BEFORE writing code in Phase 5.** This is the
> compressed reference for everything you'll mount or extend. The
> agent should NEVER invent solver classes, hook names, or
> component prop shapes — if a thing isn't listed here it doesn't
> exist.

---

## 1. Solvers (`src/solvers/`)

### `BaseSolver<S>` — universal lifecycle (KEEP)

Inherited by every archetype's base. Provides:

| Member                       | Type                                   | Notes                                            |
| ---------------------------- | -------------------------------------- | ------------------------------------------------ |
| `t`                          | `number` (read-only)                   | Current simulation time in seconds.              |
| `isRunning`                  | `boolean` (read-only)                  | Whether the play loop is active.                 |
| `state`                      | `S` (read-only abstract)               | Defined by the archetype subclass.               |
| `play()`                     | `() => void`                           | Start the requestAnimationFrame loop.            |
| `pause()`                    | `() => void`                           | Stop the loop, keep state.                       |
| `reset()`                    | `() => void`                           | Pause + restore initial state at t = 0.          |
| `subscribe(fn)`              | `(t, state) => void) => () => void`    | Returns an unsubscribe. Fires immediately with current `(t, state)`. |
| `step(dt)` (abstract)        | `(dt: number) => void`                 | Implemented by integrator (RK4, …). Always called with the constructor `dt`. |
| `initialState()` (abstract)  | `() => S`                              | Pure — return the state vector at t = 0.        |

Constructor signature:

```ts
new SomeSolver({ dt: 0.01 });   // BaseSolverConfig: { dt: number }
```

### `BaseODE` (extends `BaseSolver<ODEState>`) — abstract

Adds `rhs(t, y): ODEState` (the right-hand side `dy/dt = F(t, y)`)
and an `ODEState` alias for `number[]`. Don't extend BaseODE directly
— pick a concrete integrator below.

### `RK4` (extends `BaseODE`) — concrete integrator

Fixed-step 4th-order Runge-Kutta. Constructor:

```ts
class MyODE extends RK4 {
  constructor() { super({ dt: simConfig.simulationTimeStep.value }); }
  initialState(): ODEState { ... }
  rhs(t: number, y: ODEState): ODEState { ... }
}
```

Override exactly two methods. Do NOT touch `step()` (the math).

### `_TemplateODE` — copy-and-customise scaffold

Use as a starting point: copy the file, rename the class, fill in
`initialState()` and `rhs()`. Includes a worked damped-pendulum
example in the docstring.

---

## 2. Lab Objects (`src/lab/lab_objects/`)

### `<Pendulum>` (KEEP)

Rod + bob mesh hung from a fixed pivot. The agent feeds `angle`
every frame; everything else is visual presentation.

| Prop        | Type                             | Default        | Notes                                          |
| ----------- | -------------------------------- | -------------- | ---------------------------------------------- |
| `length`    | `number` (m)                     | required       | Rod length from pivot to bob centre.           |
| `mass`      | `number` (kg)                    | required       | Bob radius scales as `mass^(1/3)`.              |
| `angle`     | `number` (rad)                   | required       | 0 = straight down, +CCW.                       |
| `pivot`     | `[number, number, number]`       | `[0, 1.4, 0]`  | World position of the fixed pivot.             |
| `bobColor`  | `string` (CSS colour)            | `'#bc8cff'`    | Optional override.                             |
| `rodColor`  | `string` (CSS colour)            | `'#5b6779'`    | Optional override.                             |

The `angle` prop is reactive — when the React state holding the
angle updates, the rotation re-renders. For 60+ Hz simulation,
prefer reading directly off `solver.state` via `subscribe()` and
calling `setAngle(...)` so the only re-render cost is the cheap
`<group rotation={[0, 0, angle]}>` change.

---

## 3. Visualization (`src/lab/visualization/`)

### `<TimeSeriesPlot solver selector>` (KEEP)

Drop-in time-series chart that subscribes to a `BaseSolver` and
plots `selector(state)` against `t`.

| Prop             | Type                                                    | Notes                                  |
| ---------------- | ------------------------------------------------------- | -------------------------------------- |
| `solver`         | `BaseSolver<S>`                                         | Source of truth.                       |
| `selector`       | `(state: S) => number`                                  | Pulls the scalar to plot.              |
| `windowSeconds`  | `number?`                                               | Optional rolling window. Older drop.   |
| `xLabel`         | `string`                                                | Default `'t (s)'`.                     |
| `yLabel`         | `string`                                                | Default `'value'`.                     |
| (others)         | All `<ChartMonitor>` props except `data`/`xLabel`/`yLabel` |                                        |

Resets on solver reset (subscribe always fires once with the new
`(t, state)` after a reset, including `t = 0` which clears the buffer).

### `<PhasePortrait solver selectorX selectorY>` (KEEP)

State-space trajectory. Plots (selectorX(state), selectorY(state))
as a curve.

Same prop surface as `TimeSeriesPlot` but with `selectorX` /
`selectorY` instead of one selector + an x-axis tied to time. Closed
curves indicate conservation; inward spirals indicate damping.

---

## 4. Instruments (KEEP, from `templates/core/src/lab/instruments/`)

These are universal across archetypes — see `templates/core/src/lab/instruments/`:

- `<Dial label unit value min max onChange position>` — rotary knob bound to a numeric simConfig field.
- `<Button3D label kind onPress position>` — Run/Pause/Reset/Step/Export.
- `<DigitalReadout label value position rotationY>` — LCD-style numeric display.
- `<ChartMonitor title xLabel yLabel data position rotationY size>` — wall monitor; `TimeSeriesPlot` and `PhasePortrait` wrap this.

---

## 5. Recommended file shape

```ts
// src/DampedPendulumODE.ts  — copy from _TemplateODE.ts, customise
import { RK4, type ODEState } from './solvers';
import simConfig from './simConfig.json';

export class DampedPendulumODE extends RK4 {
  constructor() {
    super({ dt: simConfig.simulationTimeStep.value });
  }
  initialState(): ODEState {
    return [
      simConfig.initialAngle.value,
      simConfig.initialAngularVelocity.value,
    ];
  }
  rhs(_t: number, y: ODEState): ODEState {
    const [theta, omega] = y;
    const g = simConfig.gravity.value;
    const L = simConfig.length.value;
    const b = simConfig.dampingCoefficient.value;
    return [
      omega,
      -(g / L) * Math.sin(theta) - b * omega,
    ];
  }
}
```

```tsx
// src/App.tsx — orchestrate solver + scene
import { useEffect, useMemo, useState } from 'react';
import { BaseLabScene, Dial, Button3D, DigitalReadout } from './lab';
import { Pendulum } from './lab/lab_objects';
import { TimeSeriesPlot, PhasePortrait } from './lab/visualization';
import { DampedPendulumODE } from './DampedPendulumODE';
import simConfig from './simConfig.json';

export function App() {
  const [length, setLength] = useState(simConfig.length.value);
  const [mass, setMass] = useState(simConfig.mass.value);
  const [damping, setDamping] = useState(simConfig.dampingCoefficient.value);

  const solver = useMemo(() => new DampedPendulumODE(), []);
  const [angle, setAngle] = useState(solver.state[0]);
  const [omega, setOmega] = useState(solver.state[1]);
  const [tNow, setTNow] = useState(0);

  useEffect(() =>
    solver.subscribe((t, [theta, w]) => {
      setAngle(theta);
      setOmega(w);
      setTNow(t);
    }),
  [solver]);

  return (
    <BaseLabScene>
      <Pendulum length={length} mass={mass} angle={angle} />
      <Dial label="Length"  unit="m"   value={length}  min={0.1} max={2.0} onChange={setLength}  position={[-0.7, 0, 0.7]} />
      <Dial label="Mass"    unit="kg"  value={mass}    min={0.1} max={5.0} onChange={setMass}    position={[-0.4, 0, 0.7]} />
      <Dial label="Damping" unit="1/s" value={damping} min={0.0} max={5.0} onChange={setDamping} position={[-0.1, 0, 0.7]} />
      <Button3D label={solver.isRunning ? 'Pause' : 'Run'} kind={solver.isRunning ? 'pause' : 'run'} onPress={() => solver.isRunning ? solver.pause() : solver.play()} position={[0.85, 0, 0.7]} />
      <Button3D label="Reset" kind="reset" onPress={() => solver.reset()} position={[1.10, 0, 0.7]} />
      <DigitalReadout label="θ"   value={`${angle.toFixed(2)} rad`}  position={[ 0.20, 0, 0.7]} rotationY={-0.3} />
      <DigitalReadout label="ω"   value={`${omega.toFixed(2)} rad/s`} position={[ 0.40, 0, 0.7]} rotationY={-0.3} />
      <DigitalReadout label="t"   value={`${tNow.toFixed(2)} s`}      position={[ 0.60, 0, 0.7]} rotationY={-0.3} />
      <TimeSeriesPlot solver={solver} selector={(y) => y[0]} title="ANGLE vs TIME" xLabel="t (s)" yLabel="θ (rad)" position={[ 0,  0.50, -0.9]} size={[1.1, 0.55]} />
      <PhasePortrait  solver={solver} selectorX={(y) => y[0]} selectorY={(y) => y[1]} title="PHASE PORTRAIT" xLabel="θ" yLabel="ω" position={[ 0, -0.20, -0.9]} size={[1.1, 0.55]} />
    </BaseLabScene>
  );
}
```

That single file plus `DampedPendulumODE.ts` is the entire MVP.
