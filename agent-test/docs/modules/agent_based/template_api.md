# `agent_based` Template API

> **Read this BEFORE writing code in Phase 5.** This is the
> compressed reference for everything you'll mount or extend. The
> agent should NEVER invent solver classes, hook names, or
> component prop shapes — if a thing isn't listed here it doesn't
> exist.

---

## 1. Solvers (`src/solvers/`)

### `BaseSolver<S>` — universal lifecycle (KEEP)

Inherited by every archetype's base. Provides `t`, `isRunning`,
`state`, `play`, `pause`, `reset`, `subscribe(fn)`. See the ode_system
template_api for the full table — same surface, just `S = AgentState<A>`
for this archetype.

Constructor signature:

```ts
new SomeSolver({ dt: 0.05 }); // BaseSolverConfig: { dt: number }
```

### `Agent` (interface) — minimum agent shape

```ts
interface Agent {
  position: [number, number, number];
  velocity: [number, number, number];
}
```

Subclasses extend this with archetype-specific fields:

```ts
interface SIRAgent extends Agent {
  status: 'S' | 'I' | 'R';
  daysInfected: number;
}
```

### `BaseAgent<A extends Agent>` (extends `BaseSolver<A[]>`) — abstract

Implements the standard double-buffered tick: snapshot agents,
compute next state for each from the snapshot + its neighbors,
install new list. Subclasses override two methods:

```ts
class MyFlockAgent extends BaseAgent<Agent> {
  constructor() {
    super({ dt: simConfig.simulationTimeStep.value });
    this.neighborRadius = simConfig.cohesionRadius.value;
  }
  initialState(): Agent[] {
    /* return initial agent list */
  }
  updateAgent(self: Agent, neighbors: Agent[], dt: number): Agent {
    /* return next-tick state for one agent */
  }
}
```

| Member                                        | Type                                         | Notes                                                   |
| --------------------------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| `agents` (protected)                          | `A[]`                                        | Current agent list. `state` is a getter for this.       |
| `neighborRadius` (protected)                  | `number`                                     | Search radius for default `findNeighbors`. Set in ctor. |
| `initialState()` (abstract)                   | `() => A[]`                                  | Pure — return the agent list at t = 0.                  |
| `updateAgent(self, neighbors, dt)` (abstract) | `(self: A, neighbors: A[], dt: number) => A` | Pure — compute next state for one agent.                |
| `findNeighbors(self, r, all)` (override-able) | `(self: A, r: number, all: A[]) => A[]`      | Default O(N²) Euclidean. Override for spatial hash.     |

Constraints:

- `updateAgent` MUST be a pure function of `(self, neighbors, dt)`.
  Do not read `this.agents` inside; the snapshot is already in
  `neighbors` (filtered) or implicitly excluded from your view.
- Do NOT mutate `self`, do NOT mutate any element of `neighbors`.
  Return a fresh agent record.
- `step()` is implemented by BaseAgent; do not override it.

### `_TemplateAgent` — copy-and-customise scaffold

Use as a starting point: copy the file, rename the class, fill in
`initialState()` and `updateAgent()`. Includes a worked boids
example in the docstring.

---

## 2. Lab Objects (`src/lab/lab_objects/`)

### `<AgentSwarm>` (KEEP)

Single InstancedMesh with one instance per agent. Reads
`solver.state` every frame via `useFrame` and writes per-instance
matrices directly — bypasses React reconciliation so visual cost
stays O(N) per frame.

| Prop     | Type                  | Default     | Notes                                                               |
| -------- | --------------------- | ----------- | ------------------------------------------------------------------- |
| `solver` | `BaseSolver<A[]>`     | required    | Source of truth.                                                    |
| `count`  | `number`              | required    | Maximum number of instances. MUST be ≥ peak agent count.            |
| `shape`  | `'sphere' \| 'cone'`  | `'sphere'`  | Per-agent mesh. Cone shows direction; sphere is direction-agnostic. |
| `size`   | `number` (m)          | `0.06`      | Visual size in scene units.                                         |
| `color`  | `string` (CSS colour) | `'#ff9a3c'` | Mesh colour.                                                        |
| `orient` | `boolean`             | `true`      | When true, instance points along its velocity.                      |

Mount inside `<BaseLabScene>`. Unused instances (when current agent
count < `count`) are scaled to zero so they're invisible.

---

## 3. Visualization (`src/lab/visualization/`)

### `<TimeSeriesPlot solver selector>` (KEEP)

Drop-in time-series chart that subscribes to a `BaseSolver` and
plots `selector(state)` against `t`. For agent_based, the selector
typically reduces the agent list to a scalar:

```tsx
<TimeSeriesPlot
  solver={solver}
  selector={(agents) =>
    agents.reduce((sum, a) => sum + Math.hypot(...a.velocity), 0) /
    agents.length
  }
  title="AVERAGE SPEED"
  xLabel="t (s)"
  yLabel="|v| (m/s)"
  position={[0, 0.5, -0.9]}
  size={[1.1, 0.55]}
/>
```

Other useful selectors:

- **Polarization** — `|Σ v̂_i| / N` ∈ [0, 1]. 1 means perfectly aligned.
- **Center of mass position** — `(1/N) Σ x_i` (X, Y or Z component).
- **RMS spread** — `√((1/N) Σ |x_i − x̄|²)` for cohesion measurement.
- **SIR**: `agents.filter(a => a.status === 'I').length`.

| Prop            | Type                   | Notes                                |
| --------------- | ---------------------- | ------------------------------------ |
| `solver`        | `BaseSolver<S>`        | Source of truth.                     |
| `selector`      | `(state: S) => number` | Pulls the scalar to plot.            |
| `windowSeconds` | `number?`              | Optional rolling window. Older drop. |
| `xLabel`        | `string`               | Default `'t (s)'`.                   |
| `yLabel`        | `string`               | Default `'value'`.                   |

Resets on solver reset.

---

## 4. Instruments (KEEP, from `templates/core/src/lab/instruments/`)

Universal across archetypes — see `templates/core/src/lab/instruments/`:

- `<Dial label unit value min max onChange position>` — rotary knob bound to a numeric simConfig field.
- `<Button3D label kind onPress position>` — Run/Pause/Reset/Step/Export.
- `<DigitalReadout label value position rotationY>` — LCD-style numeric display.
- `<ChartMonitor title xLabel yLabel data position rotationY size>` — wall monitor (TimeSeriesPlot wraps this).

---

## 5. Recommended file shape

```ts
// src/BoidFlockAgent.ts — copy from _TemplateAgent.ts, customise
import { BaseAgent, type Agent } from './solvers';
import simConfig from './simConfig.json';

export class BoidFlockAgent extends BaseAgent<Agent> {
  constructor() {
    super({ dt: simConfig.simulationTimeStep.value });
    this.neighborRadius = Math.max(
      simConfig.separationRadius.value,
      simConfig.cohesionRadius.value,
    );
  }

  initialState(): Agent[] {
    const N = simConfig.agentCount.value;
    const R = simConfig.spawnRadius.value;
    const out: Agent[] = [];
    for (let i = 0; i < N; i++) {
      out.push({
        position: [
          (Math.random() * 2 - 1) * R,
          (Math.random() * 2 - 1) * R,
          (Math.random() * 2 - 1) * R,
        ],
        velocity: [
          (Math.random() * 2 - 1) * 0.5,
          (Math.random() * 2 - 1) * 0.5,
          (Math.random() * 2 - 1) * 0.5,
        ],
      });
    }
    return out;
  }

  updateAgent(self: Agent, neighbors: Agent[], dt: number): Agent {
    // Three steering rules (separation, alignment, cohesion).
    // Each contributes an acceleration; sum, clamp, integrate.
    let ax = 0,
      ay = 0,
      az = 0;

    const sepR = simConfig.separationRadius.value;
    const sepW = simConfig.separationWeight.value;
    const aliW = simConfig.alignmentWeight.value;
    const cohW = simConfig.cohesionWeight.value;

    let aliVx = 0,
      aliVy = 0,
      aliVz = 0;
    let cohX = 0,
      cohY = 0,
      cohZ = 0;
    let nNear = 0;
    for (const n of neighbors) {
      const dx = n.position[0] - self.position[0];
      const dy = n.position[1] - self.position[1];
      const dz = n.position[2] - self.position[2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < sepR * sepR && d2 > 1e-8) {
        // separation: push away, scaled by 1/d
        const d = Math.sqrt(d2);
        ax -= ((dx / d) * sepW) / d;
        ay -= ((dy / d) * sepW) / d;
        az -= ((dz / d) * sepW) / d;
      }
      aliVx += n.velocity[0];
      aliVy += n.velocity[1];
      aliVz += n.velocity[2];
      cohX += n.position[0];
      cohY += n.position[1];
      cohZ += n.position[2];
      nNear++;
    }
    if (nNear > 0) {
      // alignment: steer toward neighbor avg velocity
      ax += (aliVx / nNear - self.velocity[0]) * aliW;
      ay += (aliVy / nNear - self.velocity[1]) * aliW;
      az += (aliVz / nNear - self.velocity[2]) * aliW;
      // cohesion: steer toward neighbor center of mass
      ax += (cohX / nNear - self.position[0]) * cohW;
      ay += (cohY / nNear - self.position[1]) * cohW;
      az += (cohZ / nNear - self.position[2]) * cohW;
    }

    // soft confinement so the flock doesn't drift away
    const box = simConfig.confinementRadius.value;
    const r2 =
      self.position[0] ** 2 + self.position[1] ** 2 + self.position[2] ** 2;
    if (r2 > box * box) {
      const r = Math.sqrt(r2);
      const k = simConfig.confinementWeight.value * (r - box);
      ax -= (self.position[0] / r) * k;
      ay -= (self.position[1] / r) * k;
      az -= (self.position[2] / r) * k;
    }

    // integrate velocity, clamp to maxSpeed, integrate position
    const vMax = simConfig.maxSpeed.value;
    let vx = self.velocity[0] + ax * dt;
    let vy = self.velocity[1] + ay * dt;
    let vz = self.velocity[2] + az * dt;
    const sp = Math.hypot(vx, vy, vz);
    if (sp > vMax) {
      vx = (vx / sp) * vMax;
      vy = (vy / sp) * vMax;
      vz = (vz / sp) * vMax;
    }

    return {
      position: [
        self.position[0] + vx * dt,
        self.position[1] + vy * dt,
        self.position[2] + vz * dt,
      ],
      velocity: [vx, vy, vz],
    };
  }
}
```

```tsx
// src/App.tsx — orchestrate solver + scene
import { useEffect, useMemo, useState } from 'react';
import { BaseLabScene, Dial, Button3D, DigitalReadout } from './lab';
import { AgentSwarm } from './lab/lab_objects';
import { TimeSeriesPlot } from './lab/visualization';
import { BoidFlockAgent } from './BoidFlockAgent';
import simConfig from './simConfig.json';

export function App() {
  const [sepR, setSepR] = useState(simConfig.separationRadius.value);
  const [aliW, setAliW] = useState(simConfig.alignmentWeight.value);
  const [cohW, setCohW] = useState(simConfig.cohesionWeight.value);

  const solver = useMemo(() => new BoidFlockAgent(), []);
  const [tNow, setTNow] = useState(0);
  const [meanSpeed, setMeanSpeed] = useState(0);

  useEffect(
    () =>
      solver.subscribe((t, agents) => {
        setTNow(t);
        let s = 0;
        for (const a of agents) s += Math.hypot(...a.velocity);
        setMeanSpeed(agents.length ? s / agents.length : 0);
      }),
    [solver],
  );

  return (
    <BaseLabScene>
      <AgentSwarm
        solver={solver}
        count={simConfig.agentCount.value}
        shape="cone"
        size={0.08}
      />
      <Dial
        label="Sep R"
        unit="m"
        value={sepR}
        min={0.1}
        max={2.0}
        onChange={(v) => {
          setSepR(v);
          simConfig.separationRadius.value = v;
          solver.reset();
        }}
        position={[-0.7, 0, 0.7]}
      />
      <Dial
        label="Align"
        unit="-"
        value={aliW}
        min={0}
        max={2.0}
        onChange={(v) => {
          setAliW(v);
          simConfig.alignmentWeight.value = v;
          solver.reset();
        }}
        position={[-0.4, 0, 0.7]}
      />
      <Dial
        label="Cohes"
        unit="-"
        value={cohW}
        min={0}
        max={2.0}
        onChange={(v) => {
          setCohW(v);
          simConfig.cohesionWeight.value = v;
          solver.reset();
        }}
        position={[-0.1, 0, 0.7]}
      />
      <Button3D
        label={solver.isRunning ? 'Pause' : 'Run'}
        kind={solver.isRunning ? 'pause' : 'run'}
        onPress={() => (solver.isRunning ? solver.pause() : solver.play())}
        position={[0.85, 0, 0.7]}
      />
      <Button3D
        label="Reset"
        kind="reset"
        onPress={() => solver.reset()}
        position={[1.1, 0, 0.7]}
      />
      <DigitalReadout
        label="t"
        value={`${tNow.toFixed(2)} s`}
        position={[0.2, 0, 0.7]}
        rotationY={-0.3}
      />
      <DigitalReadout
        label="|v|"
        value={`${meanSpeed.toFixed(2)} m/s`}
        position={[0.5, 0, 0.7]}
        rotationY={-0.3}
      />
      <TimeSeriesPlot
        solver={solver}
        selector={(agents) => {
          let s = 0;
          for (const a of agents) s += Math.hypot(...a.velocity);
          return agents.length ? s / agents.length : 0;
        }}
        title="MEAN SPEED vs TIME"
        xLabel="t (s)"
        yLabel="|v|"
        position={[0, 0.2, -0.9]}
        size={[1.1, 0.55]}
      />
    </BaseLabScene>
  );
}
```

That single file plus `BoidFlockAgent.ts` is the entire MVP.
