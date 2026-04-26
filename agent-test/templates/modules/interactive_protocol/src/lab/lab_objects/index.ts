/**
 * interactive_protocol archetype lab_object exports.
 *
 * After the Phase-1 cp this overrides the empty barrel from
 * `templates/core/src/lab/lab_objects/index.ts`. Agent code writes:
 *
 *   import { Beaker, ReagentBottle, Funnel, GlassRod, Bag }
 *     from './lab/lab_objects';
 */
export { Beaker, type BeakerProps } from './Beaker';
export { ReagentBottle, type ReagentBottleProps } from './ReagentBottle';
export { Funnel, type FunnelProps } from './Funnel';
export { GlassRod, type GlassRodProps } from './GlassRod';
export { Bag, type BagProps } from './Bag';
