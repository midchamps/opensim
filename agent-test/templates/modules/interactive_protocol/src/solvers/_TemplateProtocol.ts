import { BaseProtocol, type StepDef } from './BaseProtocol';

/**
 * Copy this file to your simulation file (e.g. `MyTitrationProtocol.ts`)
 * and customise:
 *
 *   1. Rename the class to match your simulation.
 *   2. Define your step ID union type.
 *   3. Define the STEPS array — your protocol's procedure as a list of
 *      `{ id, title, instruction, required }`.
 *   4. (Optional) override `transitionSpeed` for faster/slower
 *      inter-step animation.
 *
 * Worked example: acid-base titration
 *
 * ```ts
 * import { BaseProtocol, type StepDef } from './BaseProtocol';
 *
 * type StepId = 'intro' | 'fill_burette' | 'add_indicator' | 'titrate' | 'done';
 *
 * const STEPS: StepDef<StepId>[] = [
 *   { id: 'intro',         title: 'Welcome',                instruction: 'Press START to begin titrating.',                required: 1 },
 *   { id: 'fill_burette',  title: 'Step 1 — Fill burette',  instruction: 'Drag the NaOH bottle onto the burette.',         required: 1 },
 *   { id: 'add_indicator', title: 'Step 2 — Add indicator', instruction: 'Drop phenolphthalein into the analyte beaker.',  required: 1 },
 *   { id: 'titrate',       title: 'Step 3 — Titrate',       instruction: 'Click the burette stopcock to release drops.',   required: 6 },
 *   { id: 'done',          title: 'Done',                   instruction: 'Endpoint reached — pink colour persists.',       required: 0 },
 * ];
 *
 * export class TitrationProtocol extends BaseProtocol<StepId> {
 *   constructor() { super(STEPS); }
 * }
 * ```
 *
 * Read this file as a template; never import `_TemplateProtocol` from
 * agent-written code.
 */

type StepId = 'intro' | 'step1' | 'done';

const STEPS: StepDef<StepId>[] = [
  // TODO: replace with your protocol's actual steps
  {
    id: 'intro',
    title: 'Welcome',
    instruction: 'Press START to begin.',
    required: 1,
  },
  {
    id: 'step1',
    title: 'Step 1 — Action',
    instruction: 'Click / drag the active object to perform this step.',
    required: 1,
  },
  {
    id: 'done',
    title: 'Done',
    instruction: 'Procedure complete.',
    required: 0,
  },
];

export class _TemplateProtocol extends BaseProtocol<StepId> {
  constructor() {
    super(STEPS);
  }
}
