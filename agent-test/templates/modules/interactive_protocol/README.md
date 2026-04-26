# `interactive_protocol` Archetype Template

Phase-10 deliverable. After the agent's Phase-1 cp, the contents of
`src/` here merge into the user's working `src/`, layering the
protocol-specific solver and lab catalogue on top of the universal
`templates/core/` scaffold.

## What this module ships

```
src/
├── solvers/
│   ├── BaseProtocol.ts       # extends BaseSolver, adds discrete step state machine
│   ├── _TemplateProtocol.ts  # copy-and-customise scaffold (titration example in docstring)
│   └── index.ts              # barrel re-export (also re-exports BaseSolver)
├── lab/
│   ├── lab_objects/
│   │   ├── Beaker.tsx        # LatheGeometry + MeshTransmissionMaterial glass beaker
│   │   ├── ReagentBottle.tsx # generic chemical bottle with 3-line label
│   │   ├── Funnel.tsx        # cone + cheesecloth + stem
│   │   ├── GlassRod.tsx      # thin glass stirring rod
│   │   ├── Bag.tsx           # transparent containment bag
│   │   └── index.ts
│   └── visualization/
│       ├── PouringStream.tsx     # animated parabolic-arc pour with FlowDrops
│       ├── Splash.tsx            # impact droplets
│       ├── PrecipitationCloud.tsx # wispy translucent cloud at phase boundaries
│       ├── InstructionPanel.tsx  # wall-mounted step-instruction display
│       ├── StepIndicator.tsx     # row of progress dots
│       ├── DropTargetRing.tsx    # glowing target ring during drag
│       └── index.ts
└── interactions/
    ├── useDragOnPlane.ts     # raycast-to-plane drag hook for pickup-and-pour
    └── index.ts
```

## How the agent uses it

1. `classify_simulation_type` → `interactive_protocol`.
2. `cp -r templates/core/* ./` → universal Three.js + r3f scaffold +
   the universal `lab/` instruments + `simConfig.json`.
3. `cp -r templates/modules/interactive_protocol/src/* ./src/` → adds
   the protocol state machine, lab equipment, drag hook, and
   protocol-specific visualisation.
4. `generate_protocol` → six-section Protocol Document.
5. Agent reads `docs/modules/interactive_protocol/template_api.md`,
   then copies `_TemplateProtocol.ts` → `MyProtocol.ts`, defines
   `STEPS`, mounts lab objects in `App.tsx`, wires drag-to-pour and
   click-to-press handlers to the active step.

The Phase-10 reference target is a strawberry DNA extraction
simulator (6 steps: intro → crush → lysis → filter → ethanol → spool
→ done) end-to-end.

## When to choose this archetype

Use `interactive_protocol` when:

- The state advances through DISCRETE steps triggered by user actions
  (not continuous time).
- Each step has a recognisable physical action (drag, click, press).
- The visual is a sequence of laboratory operations rather than a
  continuous evolution of state vectors / fields / agents.

Examples beyond strawberry DNA: acid-base titration, gel
electrophoresis, gram staining, baking-soda volcano, simple distillation,
flame test, paper chromatography. For numerical simulations (pendulum
dynamics, heat diffusion, flocking), use `ode_system` / `pde_grid` /
`agent_based` / `monte_carlo` / `cellular_automata` instead.
