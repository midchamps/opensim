# `interactive_protocol` Design Rules

Domain-specific Protocol-authoring guide for the interactive_protocol
archetype. The `generate_protocol` tool feeds this file into the LLM
as a system-prompt addendum so the resulting Protocol Document is
concrete and opinionated rather than generic.

---

## When to use this archetype

- The simulation is a **discrete-step laboratory procedure** the user
  walks through by clicking, dragging, or pressing 3D lab objects.
- Each step has a physically meaningful **action** (drag bottle to
  beaker → pour; click strawberry → mash; click stopcock → drip).
- The "state" is best described as a **state machine over named steps**,
  not a continuous numerical state vector.
- The educational value is in **observing the procedure** as the user
  performs it, not in observing emergent dynamics.

If the simulation is truly numerical (pendulum dynamics, heat
diffusion, flocking, MC sampling, CA pattern), use one of the five
numerical archetypes — that's a much better fit.

If the simulation has BOTH a procedural setup AND continuous dynamics
(e.g. user mixes reactants → then watches a reaction-diffusion PDE),
prefer `pde_grid` and bake the "setup" into a few simConfig dials.

## Protocol Section choices

### Section 2 — Variables & Units

Procedural simulations have FEWER simConfig fields than numerical
ones. Typical fields:

| Quantity                      | Unit        |
| ----------------------------- | ----------- |
| Initial volume of reagent     | `mL` or `-` |
| Concentration                 | `M`         |
| Number of agent clicks needed | `-`         |
| Timer / pacing                | `s`         |

Use the dimensionless unit `-` for counts, ratios, indices.

Avoid simConfig fields for things the user MANIPULATES via UI — those
belong in the protocol state, not in simConfig.

### Section 3 — Numerical Scheme (= protocol structure)

For procedural simulators, this section defines the **STATE MACHINE**:

1. **Step list** — IDs in order. Always include `intro` (welcome /
   start button) and `done` (success state with summary). The
   substantive steps go in between.

2. **Per-step action requirement**:
   - `required = 1`: one click / drag-drop. Used for most pour /
     mix / dispense actions.
   - `required = N` (N > 1): the user must perform the action N times
     (e.g. crush 5 times, drip 6 times).
   - `required = 0`: terminal step (no further input expected).

3. **Transition speed** — fraction of animProgress per second.
   Default 0.6 = ~1.7 s per transition. Faster (1.0+) feels snappy
   for short pours, slower (0.4) feels deliberate for long mixes.

4. **Active target object per step** — exactly ONE lab object responds
   to user input on each step. Other objects must NOT respond (or the
   user can break the protocol order).

### Section 4 — Lab Layout & Visualization

Default interactive_protocol workbench:

| Component              | Count | Position pattern             | Bound to                                 |
| ---------------------- | ----- | ---------------------------- | ---------------------------------------- |
| `<InstructionPanel>`   | 1     | `[0, 1.30, -0.85]`           | currentStep + progress                   |
| `<StepIndicator>`      | 1     | `[0, 1.05, -0.85]`           | currentIndex                             |
| Lab objects (Beaker,   | 3-6   | spread along z=0 desk centre | per-step active target wired up          |
| ReagentBottle, Funnel, |       | with reasonable spacing      |                                          |
| GlassRod, Bag)         |       |                              |                                          |
| `<PouringStream>`      | per   | source spout → target rim    | `extend` and `retract` from animProgress |
|                        | pour  |                              |                                          |
| `<Splash>`             | per   | at impact point              | active during pour mid-phase             |
|                        | pour  |                              |                                          |
| `<DropTargetRing>`     | per   | at target on desk surface    | visible only while a drag is in progress |
|                        | drag  |                              |                                          |
| `<Button3D>` Reset     | 1     | `[0.95, 0, 0.7]`             | `protocol.reset()`                       |

Source containers must have **two distinct visual modes**:

- **Drag mode** (during user pickup): position = home + dragOffset,
  lift = 0.15, no tilt. Drop-target ring shows.
- **Auto-pour mode** (after drop, during transition animation):
  position = home + nudgeShape(a), tilt = tiltShape(a), lift = liftShape(a).
  Stream + splash render.

### Section 5 — Observables & Roadmap

Standard observables for procedural simulations:

- `currentStep.id` — for instruction panel
- `progress / required` — for the progress counter
- Per-step visual state (e.g., bag fill level, beaker liquid color)
  derived from animProgress AND step index

Roadmap typically has 4 file operations:

1. UPDATE `src/simConfig.json` ← Section 2 (often minimal — 1-3 fields).
2. CREATE `src/<NameOfYourProtocol>.ts` ← copy `_TemplateProtocol.ts`,
   define `StepId` union and `STEPS` array.
3. UPDATE `src/App.tsx` ← see `template_api.md` §6 worked example.
4. (optional) CREATE `src/<NameOfYourProtocol>LabObjects.tsx` ← any
   simulation-specific 3D shapes (e.g. Strawberry, DnaStrand, custom
   reactant bottles) that aren't part of the generic template lab
   catalogue.

### Section 6 — Validation Targets

Default targets every interactive_protocol Protocol should include:

- **NaN propagation** — same as numerical archetypes (animProgress and
  any derived numbers stay finite).
- **Step-machine integrity** — calling `registerAction` exactly
  `required` times advances exactly one step; calling more in the
  same step (during transition) is a no-op.
- **Reset behaviour** — `protocol.reset()` returns to step 0 with
  progress 0 and re-runs the same sequence cleanly.
- **No skipping** — the user cannot complete step N+1 before N (the
  active-target gating must enforce this).

For physical realism validators (energy conservation, analytic
benchmarks), interactive_protocol typically has none — the dynamics
are scripted, not derived. Substitute "qualitative storytelling": after
the procedure, the visible result must match the real-world
expectation (e.g. DNA visible as white wispy precipitate at the
ethanol/water boundary; titration endpoint marked by colour change).

---

## Forbidden in interactive_protocol Protocols

- Multiple lab objects responding to the same click during the same
  step (breaks the state machine — only the ACTIVE object responds).
- Time-driven state evolution that bypasses the step machine (use
  `ode_system` if dynamics are continuous).
- Drag-and-drop that doesn't snap-test against a target zone — drops
  must either register the action OR animate the source back home.
  No third state.
- Hand-rolling a step counter outside `BaseProtocol.registerAction()`.
- Mounting more than one `<PouringStream>` for the same pour
  simultaneously (use a single stream with `extend`/`retract`).
