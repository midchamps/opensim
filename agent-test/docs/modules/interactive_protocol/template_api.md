# `interactive_protocol` Template API

> **Read this BEFORE writing code in Phase 5.** This is the
> compressed reference for everything you'll mount or extend. Never
> invent component names, hooks, or props — if a thing isn't listed
> here it doesn't exist.

---

## 1. Solvers (`src/solvers/`)

### `BaseSolver<S>` — universal lifecycle (KEEP)

Same as ode_system / agent_based / etc. — `t`, `isRunning`, `state`,
`play`, `pause`, `reset`, `subscribe`. See those archetypes' template
APIs for the full table.

### `BaseProtocol<Id extends string>` (extends `BaseSolver<ProtocolState>`)

Discrete step state machine driven by user actions. Subclasses pass
their `STEPS` array into the constructor.

| Member                | Type                         | Notes                                                            |
| --------------------- | ---------------------------- | ---------------------------------------------------------------- |
| `steps`               | `ReadonlyArray<StepDef<Id>>` | Constructor argument; stable reference.                          |
| `currentStep`         | `StepDef<Id>` (getter)       | The step at `state.stepIndex`.                                   |
| `state.stepIndex`     | `number`                     | Index into steps.                                                |
| `state.progress`      | `number`                     | Counter of registered actions in this step.                      |
| `state.animProgress`  | `number` ∈ `[0, 1]`          | Smooth transition timer.                                         |
| `state.transitioning` | `boolean`                    | True while animProgress is increasing.                           |
| `registerAction()`    | `() => ProtocolState`        | Increment progress, kick off transition when `required` reached. |
| `step(dt)` (override) | (handled internally)         | Don't override.                                                  |

```ts
type StepId =
  | 'intro'
  | 'crush'
  | 'lysis'
  | 'filter'
  | 'ethanol'
  | 'spool'
  | 'done';

const STEPS: StepDef<StepId>[] = [
  {
    id: 'intro',
    title: 'Welcome',
    instruction: 'Press START to begin.',
    required: 1,
  },
  {
    id: 'crush',
    title: 'Step 1 — Crush',
    instruction: 'CLICK the strawberry to mash it (5 times).',
    required: 5,
  },
  {
    id: 'lysis',
    title: 'Step 2 — Add buffer',
    instruction: 'Drag the buffer beaker onto the bag.',
    required: 1,
  },
  {
    id: 'filter',
    title: 'Step 3 — Filter',
    instruction: 'Drag the bag onto the funnel.',
    required: 1,
  },
  {
    id: 'ethanol',
    title: 'Step 4 — Layer ethanol',
    instruction: 'Drag the ethanol bottle onto the filtrate beaker.',
    required: 1,
  },
  {
    id: 'spool',
    title: 'Step 5 — Spool DNA',
    instruction: 'Click the glass rod 3 times to wind up the DNA.',
    required: 3,
  },
  {
    id: 'done',
    title: 'Done',
    instruction: 'You extracted real DNA.',
    required: 0,
  },
];

class StrawberryDnaProtocol extends BaseProtocol<StepId> {
  constructor() {
    super(STEPS);
  }
}
```

### `_TemplateProtocol` — copy-and-customise scaffold

Use as a starting point: copy the file, rename the class, define your
`StepId` union and your `STEPS`. Includes a worked titration example
in the docstring.

---

## 2. Lab Objects (`src/lab/lab_objects/`)

### `<Beaker>` (KEEP)

Glass beaker with two stacked liquid layers + label. Tilts + lifts +
nudges for drag-to-pour.

| Prop              | Type                       | Default     | Notes                                        |
| ----------------- | -------------------------- | ----------- | -------------------------------------------- |
| `position`        | `[number, number, number]` | required    | Home position.                               |
| `liquidHeight`    | `number ∈ [0, 1]`          | required    | Primary liquid fill level.                   |
| `liquidColor`     | `string` (CSS colour)      | required    | Primary liquid colour.                       |
| `ethanolHeight`   | `number?`                  | undefined   | Optional second layer (e.g. ethanol on top). |
| `ethanolColor`    | `string?`                  | `'#e8f4ff'` | Optional second layer colour.                |
| `label`           | `string?`                  | undefined   | Rim label.                                   |
| `tilt`            | `number` (rad)             | 0           | + tips RIGHT, - tips LEFT.                   |
| `lift`            | `number`                   | 0           | Vertical lift.                               |
| `horizontalNudge` | `number`                   | 0           | Additional X translation.                    |
| `zNudge`          | `number`                   | 0           | Additional Z translation.                    |
| `onClick`         | `() => void?`              | undefined   | Click handler.                               |
| `onPointerDown`   | `(e: ThreeEvent) => void?` | undefined   | Drag-start handler.                          |

### `<ReagentBottle>` (KEEP)

Generic chemical bottle with 3-line customisable label. Same
drag/pour pose as Beaker.

| Prop                                     | Type                       | Default     | Notes                    |
| ---------------------------------------- | -------------------------- | ----------- | ------------------------ |
| `position`                               | `[number, number, number]` | required    |                          |
| `liquidLevel`                            | `number ∈ [0, 1]`          | 1           | How full.                |
| `liquidColor`                            | `string`                   | `'#e8f4ff'` | Liquid CSS colour.       |
| `glassColor`                             | `string`                   | `'#9ec0ff'` | Glass tint.              |
| `capColor`                               | `string`                   | `'#1a1f2a'` |                          |
| `labelTopLine`                           | `string`                   | `'REAGENT'` | Big text.                |
| `labelMidLine`                           | `string?`                  | undefined   | Smaller text underneath. |
| `labelBottomLine`                        | `string?`                  | undefined   | Red hazard line.         |
| `tilt / lift / horizontalNudge / zNudge` | (same as Beaker)           |             |                          |
| `onClick / onPointerDown`                | (same as Beaker)           |             |                          |

### `<Funnel>` (KEEP)

Glass cone + cheesecloth + stem. `mashAmount` shows residue draining.

| Prop         | Type                       | Default     | Notes                              |
| ------------ | -------------------------- | ----------- | ---------------------------------- |
| `position`   | `[number, number, number]` | required    |                                    |
| `mashAmount` | `number ∈ [0, 1]`          | 0           | Amount of solid sitting on filter. |
| `mashColor`  | `string`                   | `'#7a1424'` | Colour of the residue.             |
| `onClick`    | `() => void?`              | undefined   |                                    |

### `<GlassRod>` (KEEP)

Thin glass rod for stirring/spooling.

| Prop       | Type                       | Default  | Notes                                             |
| ---------- | -------------------------- | -------- | ------------------------------------------------- |
| `position` | `[number, number, number]` | required |                                                   |
| `dipping`  | `number ∈ [-1, 1]`         | required | -1 = lifted up, 0 = at origin, 1 = fully dipped.  |
| `twist`    | `number`                   | required | Rotation accumulator (multiplied by 1.5 for rad). |

### `<Bag>` (KEEP)

Transparent containment bag with content level and rim outline.

| Prop                      | Type                       | Default  | Notes                        |
| ------------------------- | -------------------------- | -------- | ---------------------------- |
| `position`                | `[number, number, number]` | required |                              |
| `contentLevel`            | `number ∈ [0, 1]`          | required | Fraction of interior filled. |
| `contentColor`            | `string`                   | required | CSS colour of the contents.  |
| `onClick / onPointerDown` | (same as Beaker)           |          |                              |

---

## 3. Visualization (`src/lab/visualization/`)

### `<PouringStream>` (KEEP)

Animated parabolic-arc pour stream with FlowDrops particles.

| Prop        | Type                       | Default  | Notes                                           |
| ----------- | -------------------------- | -------- | ----------------------------------------------- |
| `from`      | `[number, number, number]` | required | Spout world position (compute with tilt).       |
| `to`        | `[number, number, number]` | required | Target world position (slightly below the rim). |
| `color`     | `string`                   | required | Liquid colour.                                  |
| `extend`    | `number ∈ [0, 1]`          | required | How far the tip has reached from source.        |
| `retract`   | `number ∈ [0, 1]`          | required | How much from source has pulled back.           |
| `thickness` | `number?`                  | 0.014    | Stream radius in scene units.                   |

### `<Splash>` (KEEP)

Looping droplet splash at impact point.

| Prop     | Type                       | Default  | Notes                  |
| -------- | -------------------------- | -------- | ---------------------- |
| `at`     | `[number, number, number]` | required | Impact world position. |
| `color`  | `string`                   | required | Droplet colour.        |
| `active` | `boolean`                  | required | Render only when true. |

### `<PrecipitationCloud>` (KEEP)

Wispy translucent cloud (e.g. DNA precipitate at phase boundary).

| Prop       | Type                       | Default     | Notes                 |
| ---------- | -------------------------- | ----------- | --------------------- |
| `position` | `[number, number, number]` | required    |                       |
| `amount`   | `number ∈ [0, 1]`          | required    | Visibility intensity. |
| `color`    | `string?`                  | `'#f2f4ff'` |                       |

### `<InstructionPanel>` (KEEP)

Wall-mounted step instruction display.

| Prop       | Type                       | Default  | Notes                                                     |
| ---------- | -------------------------- | -------- | --------------------------------------------------------- |
| `step`     | `InstructionPanelStep`     | required | `{ id, title, instruction, required }` from current step. |
| `progress` | `number`                   | required | `state.progress`.                                         |
| `position` | `[number, number, number]` | required | Recommended `[0, 1.30, -0.85]`.                           |

### `<StepIndicator>` (KEEP)

Row of progress dots.

| Prop           | Type                                           | Default             | Notes                           |
| -------------- | ---------------------------------------------- | ------------------- | ------------------------------- |
| `steps`        | `ReadonlyArray<{ id: string; title: string }>` | required            | Pass the protocol's `steps`.    |
| `currentIndex` | `number`                                       | required            | `state.stepIndex`.              |
| `position`     | `[number, number, number]`                     | required            | Recommended `[0, 1.05, -0.85]`. |
| `hide`         | `string[]?`                                    | `['intro', 'done']` | Step ids to hide from the row.  |

### `<DropTargetRing>` (KEEP)

Glowing ring on the desk surface to highlight a drop zone during a
drag. Render only while a drag is in progress.

| Prop       | Type                       | Default     | Notes                                |
| ---------- | -------------------------- | ----------- | ------------------------------------ |
| `position` | `[number, number, number]` | required    | Drop-zone centre on the desk.        |
| `radius`   | `number`                   | required    | Should match the drop-detect radius. |
| `color`    | `string?`                  | `'#5fdbff'` |                                      |

---

## 4. Interactions (`src/interactions/`)

### `useDragOnPlane({ planeY, enabled, homePosition, onDrop })` (KEEP)

Hook that gives a 3D mesh drag-to-pour behaviour. The pointer is
raycast onto a horizontal plane at `planeY` (default 0.30) so the user
moves objects across the desk in world (x, z).

```ts
const drag = useDragOnPlane({
  planeY: 0.30,
  enabled: stepId === 'lysis' && !state.transitioning,
  homePosition: [BUFFER_X, 0, BUFFER_Z],
  onDrop: (worldPos) => {
    if (worldPos.distanceTo(BAG_POS) < 0.22) {
      protocol.registerAction();
    }
  },
});

// In JSX:
<Beaker
  position={[BUFFER_X, 0, BUFFER_Z]}
  horizontalNudge={drag.dragOffset.x}
  zNudge={drag.dragOffset.z}
  lift={drag.isDragging ? 0.15 : 0}
  onPointerDown={drag.bind.onPointerDown}
  ...
/>
{drag.isDragging && (
  <DropTargetRing position={[BAG_X, 0.005, BAG_Z]} radius={0.22} />
)}
```

`useDragOnPlane` automatically calls `useLabStore.beginInstrumentInteraction()`
on drag start and `endInstrumentInteraction()` on drop, so OrbitControls
gets disabled during the drag (camera doesn't spin).

---

## 5. Universal Instruments (KEEP, from `templates/core/src/lab/instruments/`)

Same as other archetypes — `<Dial>`, `<Button3D>`,
`<DigitalReadout>`, `<ChartMonitor>`. Most interactive_protocol
simulators only use `<Button3D>` (Reset, optional Start).

---

## 6. Recommended file shape

```ts
// src/MyProtocol.ts — copy from _TemplateProtocol.ts, customise
import { BaseProtocol, type StepDef } from './solvers';

type StepId = 'intro' | 'fillBurette' | 'titrate' | 'done';

const STEPS: StepDef<StepId>[] = [
  { id: 'intro', title: 'Welcome', instruction: 'Press START.', required: 1 },
  {
    id: 'fillBurette',
    title: 'Step 1 — Fill',
    instruction: 'Drag the NaOH bottle onto the burette.',
    required: 1,
  },
  {
    id: 'titrate',
    title: 'Step 2 — Titrate',
    instruction: 'Click the burette stopcock to release drops.',
    required: 6,
  },
  { id: 'done', title: 'Done', instruction: 'Endpoint reached.', required: 0 },
];

export class TitrationProtocol extends BaseProtocol<StepId> {
  constructor() {
    super(STEPS);
  }
}
```

```tsx
// src/App.tsx — orchestrate the protocol + scene
import { useEffect, useMemo, useState } from 'react';
import { BaseLabScene, Button3D } from './lab';
import {
  Beaker,
  ReagentBottle,
  PouringStream,
  Splash,
  InstructionPanel,
  StepIndicator,
  DropTargetRing,
} from './lab/lab_objects';
import { useDragOnPlane } from './interactions';
import { TitrationProtocol } from './TitrationProtocol';

export function App() {
  const protocol = useMemo(() => new TitrationProtocol(), []);
  const [state, setState] = useState(protocol.state);
  useEffect(() => {
    protocol.play();
    return protocol.subscribe((_t, s) => setState(s));
  }, [protocol]);
  return (
    <BaseLabScene>
      <SceneContent protocol={protocol} state={state} />
    </BaseLabScene>
  );
}

function SceneContent({ protocol, state }) {
  const stepId = protocol.steps[state.stepIndex]!.id;
  const a = state.animProgress;
  const transitioning = state.transitioning;

  // Drag hooks must be inside Canvas (this child of BaseLabScene).
  const naohDrag = useDragOnPlane({
    enabled: stepId === 'fillBurette' && !transitioning,
    homePosition: [0.5, 0, -0.05],
    onDrop: (w) => {
      if (w.distanceTo(new THREE.Vector3(-0.2, 0, -0.05)) < 0.22) {
        protocol.registerAction();
      }
    },
  });

  return (
    <>
      <InstructionPanel
        step={protocol.currentStep}
        progress={state.progress}
        position={[0, 1.3, -0.85]}
      />
      <StepIndicator
        steps={protocol.steps}
        currentIndex={state.stepIndex}
        position={[0, 1.05, -0.85]}
      />
      <ReagentBottle
        position={[0.5, 0, -0.05]}
        horizontalNudge={naohDrag.dragOffset.x}
        zNudge={naohDrag.dragOffset.z}
        lift={naohDrag.isDragging ? 0.15 : 0}
        labelTopLine="NaOH"
        labelMidLine="0.1 M"
        liquidColor="#fff5cc"
        onPointerDown={naohDrag.bind.onPointerDown}
      />
      {/* analyte beaker, burette, stopcock-button, etc. */}
      <Button3D
        label="Reset"
        kind="reset"
        onPress={() => protocol.reset()}
        position={[0.95, 0, 0.7]}
      />
      {naohDrag.isDragging && (
        <DropTargetRing position={[-0.2, 0.005, -0.05]} radius={0.22} />
      )}
    </>
  );
}
```

That single `App.tsx` plus `MyProtocol.ts` plus a few simulation-
specific custom 3D shapes (if needed) is the entire MVP.
