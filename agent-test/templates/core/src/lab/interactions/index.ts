/**
 * User-input mappings for 3D objects on the workbench.
 *
 * - DragRotate — pointer drag rotates a Dial mesh and emits its value
 * - ClickPress — pointer down/up on a Button3D, with hover depress
 * - HoverInfo — DOM tooltip overlay when pointer hovers a labeled mesh
 *
 * These are r3f hooks/components; agent-written simulations use them
 * to wire user input to simConfig fields without touching pointer-
 * event plumbing.
 */
export { DragRotate, type DragRotateProps } from './DragRotate';
export { ClickPress, type ClickPressProps } from './ClickPress';
export { HoverInfo, type HoverInfoProps } from './HoverInfo';
