# `agent_based` Archetype Template

Phase-6 deliverable. After the agent's Phase-1 cp, the contents of
`src/` here merge into the user's working `src/`, layering the
agent-based solver and lab catalog on top of the universal
`templates/core/` scaffold.

## What this module ships

```
src/
├── solvers/
│   ├── BaseAgent.ts        # extends BaseSolver, adds updateAgent + neighbor query
│   ├── _TemplateAgent.ts   # copy-and-customise scaffold (boids worked example in docstring)
│   └── index.ts            # barrel re-export (also re-exports BaseSolver)
└── lab/
    ├── lab_objects/
    │   ├── AgentSwarm.tsx  # InstancedMesh of one shape per agent, oriented along velocity
    │   └── index.ts
    └── visualization/
        ├── TimeSeriesPlot.tsx  # subscribes to BaseSolver, plots selector(state) vs t
        └── index.ts
```

## How the agent uses it

1. `classify_simulation_type` → `agent_based`.
2. `cp -r templates/core/* ./` → universal Three.js + r3f scaffold +
   the `lab/` instruments + `simConfig.json`.
3. `cp -r templates/modules/agent_based/src/* ./src/` → adds the
   solver and overrides the empty `lab_objects/index.ts` and
   `lab/visualization/index.ts` with the agent-based exports.
4. `generate_protocol` → six-section Protocol Document.
5. Agent reads `docs/modules/agent_based/template_api.md`, then
   copies `_TemplateAgent.ts` → `MyFlockAgent.ts`, overrides
   `initialState()` and `updateAgent(self, neighbors, dt)`, mounts
   an `<AgentSwarm>` + dials + buttons + a `<TimeSeriesPlot>` on
   some swarm-level scalar (e.g. average speed) in `App.tsx`.

The Gate 6 target is a 3D boids flocking simulator end-to-end from a
one-line prompt.
