# `lab/` — Virtual Lab Catalog (KEEP area)

This directory holds the **3D virtual-lab building blocks** that an
OpenSim agent run composes into a simulation. Everything here is
"engine" — the agent reads the `template_api.md` for each subdirectory
and **attaches** these components to its archetype scene. The agent
should never modify files inside `lab/`; it should only import them.

This is the simulator-domain analogue of OpenGame's `behaviors/`,
`systems/`, and `ui/` directories.

## Subdirectories

| Path             | Purpose                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `scenes/`        | Standard 3D environments. `BaseLabScene` (desk + lighting + OrbitControls) is the root every simulation extends. |
| `instruments/`   | Measurement & control widgets — `Dial`, `Button3D`, `DigitalReadout`, `ChartMonitor`.                            |
| `lab_objects/`   | Experiment subjects — `Pendulum`, `Spring`, `Beaker`, `GridSurface`, `ParticleEmitter`, `PetriDish`, etc.        |
| `interactions/`  | User-input mappings — `DragRotate` (knobs), `ClickPress` (buttons), `HoverInfo` (tooltips).                      |
| `visualization/` | Data-to-mesh adapters — `TimeSeriesPlot`, `PhasePortrait`, `HeatmapPanel`, `Trajectory3D`.                       |

## Phase status

Phase 1.2 (this commit) creates the empty scaffold and barrel
`index.ts` files for each subdirectory. Phase 1.3 implements the first
real component, `scenes/BaseLabScene`. Phase 2 fills in five
instruments. Phase 4 adds the first lab objects (`Pendulum`, `Spring`)
along with the `ode_system` archetype.
