# `agent_based` Design Rules

Domain-specific Protocol-authoring guide for the agent_based
archetype. The `generate_protocol` tool feeds this file into the
LLM as a system prompt addendum so the resulting Protocol Document
is concrete and opinionated rather than generic.

---

## When to use this archetype

- The state is a **list of independent entities** (50–500 agents)
  each with their own position / velocity / status.
- Updates are governed by **local interaction rules** — each agent
  reads only its neighbors within some radius, not the global state.
- **Emergent behaviour is the point** (flocking, segregation,
  epidemic spread with explicit individuals, traffic jams).

If the state is a finite vector y(t) governed by `dy/dt = F(t, y)`,
use `ode_system` instead. If the state is a field on a regular grid
updated by stencils, use `pde_grid`. If cells in a finite alphabet
update by deterministic local rules each tick, use
`cellular_automata`.

## Protocol Section choices

### Section 2 — Variables & Units

Every numeric must declare a SI `unit`. Common units in agent-based
problems:

| Quantity                                     | Unit   |
| -------------------------------------------- | ------ |
| Position / spawn radius / interaction radius | `m`    |
| Velocity                                     | `m/s`  |
| Maximum speed                                | `m/s`  |
| Steering weight (separation/align/cohesion)  | `-`    |
| Confinement spring constant                  | `1/s²` |
| Time                                         | `s`    |
| Agent count                                  | `-`    |
| Infection rate (SIR)                         | `1/s`  |
| Recovery period                              | `s`    |

`-` (single dash) marks a dimensionless quantity. Use it for
weights, ratios, counts, and probabilities so the unit-consistency
validator skips the field rather than flagging a missing unit.

Always include `simulationTimeStep` (`s`) and `simulationDuration`
(`s`). Typical agent-based `dt ≈ 0.05 s` (20 Hz). Going much smaller
just slows the visual; much larger lets agents tunnel through each
other's interaction radii in one tick and the rules become noisy.

### Section 3 — Numerical Scheme

The "scheme" for an agent-based model is just the per-agent rule.
State it as pseudocode:

```text
For each agent self:
  neighbors = agents within neighborRadius of self  (excluding self)
  a = sum_of_steering_forces(self, neighbors)
  v_new = clamp(self.v + a * dt, -vMax, +vMax)
  x_new = self.x + v_new * dt
Output: { position: x_new, velocity: v_new }
```

Decisions to spell out:

1. **Neighborhood** — fixed Euclidean radius (default), k-nearest,
   topological. Most simulations want fixed radius.
2. **Steering forces** — list each contribution: separation,
   alignment, cohesion, predator avoidance, goal seeking. Each gets
   a weight (a Section-2 simConfig field).
3. **Speed clamp** — agents must be capped (`maxSpeed`) or the
   numerics blow up.
4. **Boundary handling** — toroidal wrap (most CA-flavoured
   simulations), reflective walls, or a soft confinement spring
   (best for "flock should stay roughly here" with smooth dynamics).

### Section 4 — Lab Layout & Visualization

Default agent_based workbench:

| Component          | Count | Position pattern                             | Bound to                                      |
| ------------------ | ----- | -------------------------------------------- | --------------------------------------------- | --- | --------------------------------- |
| `<AgentSwarm>`     | 1     | parent of `<BaseLabScene>` (no position)     | the solver, `count = simConfig.agentCount`    |
| `<Dial>`           | 3-5   | `[-0.85 + 0.3*i, 0, 0.7]` for i = 0..N-1     | one per Section-2 weight or radius            |
| `<Button3D>`       | 2     | `[0.85, 0, 0.7]` and `[1.10, 0, 0.7]`        | Run/Pause and Reset                           |
| `<DigitalReadout>` | 2-3   | `[0.20 + 0.30*i, 0, 0.7]`, `rotationY: -0.3` | t, mean                                       | v   | , polarization, agent count, etc. |
| `<TimeSeriesPlot>` | 1     | `[0, 0.20, -0.9]`                            | swarm scalar (mean speed, polarization, etc.) |

Notes:

- The `<AgentSwarm>` reads the solver every frame via `useFrame`, so
  it does NOT need any explicit position prop — the agent positions
  drive the visualization directly.
- For boids-flavoured simulations use `shape="cone"` so the
  direction is visible. For SIR-with-individuals use
  `shape="sphere"` and consider colouring by status (currently
  `<AgentSwarm>` ships single-colour; multi-colour by status is a
  Phase-7+ extension).
- Dial-onChange MUST update both React state AND
  `simConfig.<field>.value`, then call `solver.reset()` so the new
  parameter takes effect on a fresh agent list.

### Section 5 — Observables & Roadmap

Standard observables for agent-based simulations:

- `t` — simulation time, unit `s`.
- **Mean speed** — `(1/N) Σ |v_i|`.
- **Polarization** — `|Σ v̂_i| / N` ∈ [0, 1]. 1 = perfectly aligned.
- **RMS spread** — `√((1/N) Σ |x_i − x̄|²)`. Cohesion measure.
- **Center-of-mass position** — `(1/N) Σ x_i`. Drift indicator.
- For SIR/epidemic models: count of agents in each status.

Roadmap typically has exactly 4 file operations:

1. UPDATE `src/simConfig.json` ← Section 2.
2. CREATE `src/<NameOfYourFlock>Agent.ts` ← copy `_TemplateAgent.ts`,
   override `initialState()` and `updateAgent(self, neighbors, dt)`.
3. UPDATE `src/App.tsx` ← see `template_api.md` §5 worked example.
4. (optional) CREATE `src/observables.ts` ← derive scalar observables
   from the agent list (mean speed, polarization, RMS spread).

### Section 6 — Validation Targets

Default targets every agent_based Protocol should include:

- **NaN propagation** — solver state stays finite (positions and
  velocities never NaN over the full simulation duration).
- **Unit consistency** — Section-2 units balance.
- **Confinement** — every agent stays within the declared
  confinement region after enough warm-up time. (If you have hard
  walls this is automatic; for soft confinement, define a tolerance:
  e.g. < 5% of agents allowed outside `confinementRadius`.)
- **Population conservation** — for closed simulations (no birth /
  death), `agents.length` is constant across the entire run.
- **Optional pattern-stability target** (when applicable) — for
  flocking, polarization should rise above some threshold (e.g.
  ≥ 0.7) within `warmupTime` seconds, given non-zero alignment
  weight. For SIR, the infected fraction should peak then decay.

For unfamiliar agent-based dynamics where no closed-form analytic
target exists, fall back to qualitative validation: "after 10 s of
simulation, [polarization is high / clusters have formed / spread
has plateaued]".

---

## Forbidden in agent_based Protocols

- Reading `this.agents` from inside `updateAgent`. The double-buffer
  contract requires `updateAgent` to be a pure function of
  (self, neighbors, dt). Reading current state breaks
  order-independence.
- Mutating `self` or any element of `neighbors`. Always return a
  fresh agent record.
- Skipping speed clamping. An unclamped flock blows up numerically
  the moment alignment + cohesion overshoot.
- Hand-rolling neighbor queries when `findNeighbors` already
  exists. Override only if profiling shows the O(N²) default is the
  bottleneck.
- Hard-coded numeric values in `updateAgent`. Read every steering
  weight and radius from `simConfig.<field>.value`.
