/**
 * User-input mappings for 3D objects on the workbench.
 *
 * Phase 2 will add:
 *   - DragRotate — pointer drag rotates a Dial mesh and emits its value
 *   - ClickPress — pointer down/up on a Button3D, with hover highlight
 *   - HoverInfo — tooltip overlay when pointer hovers a labeled mesh
 *   - DragMove (later) — drag a lab_object to reposition (e.g. lift the
 *     pendulum bob to set initial angle)
 *
 * These are r3f hooks/components; the agent uses them to wire user
 * input to simConfig fields without touching pointer-event plumbing.
 */
export {};
