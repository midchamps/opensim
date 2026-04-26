# OpenSim Starter Template

Minimal React + react-three-fiber scaffold that an OpenSim agent run copies
into the user's working directory. The agent then layers a simulation
archetype module (`templates/modules/<archetype>/`) on top to produce a
runnable 3D virtual lab.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev

# Type-check + production build
npm run build
```

## Layout (after Phase 1)

```
templates/core/
├── package.json                # react / three / @react-three/fiber / drei / leva
├── index.html                  # #root mount point
├── tsconfig.json               # JSX-enabled bundler-mode TS
├── vite.config.js              # @vitejs/plugin-react
├── postcss.config.js           # Tailwind pipeline
├── tailwind.config.js
└── src/
    ├── main.tsx                # React + StrictMode mount
    ├── App.tsx                 # Root component (mounts BaseLabScene)
    ├── simConfig.json          # Numeric config with `unit` field
    ├── styles/                 # Tailwind global CSS
    └── lab/                    # 3D virtual-lab catalog (Phase 1.2+)
        ├── scenes/             # BaseLabScene, _TemplateLabScene
        ├── instruments/        # Dial, Button3D, DigitalReadout, ChartMonitor
        ├── lab_objects/        # Pendulum, Spring, Beaker, GridSurface, ...
        ├── interactions/       # DragRotate, ClickPress, HoverInfo
        └── visualization/      # TimeSeriesPlot, PhasePortrait, HeatmapPanel
```

## Authoring rules (for the agent)

- `lab/scenes/BaseLabScene.tsx` is **KEEP** — never modify. Compose your
  simulation by mounting it from `App.tsx` and adding archetype-specific
  children.
- `lab/instruments/`, `lab/lab_objects/`, `lab/interactions/`,
  `lab/visualization/` are **KEEP** — attach existing components, do not
  rewrite them.
- `simConfig.json` follows the OpenSim wrapper format
  `{ "value": X, "type": "...", "unit": "...", "description": "..." }`.
  Read values via `.value`, never hardcode.
- All numeric quantities used in solvers must declare a `unit` field for
  the unit-consistency validator (Phase 5).
