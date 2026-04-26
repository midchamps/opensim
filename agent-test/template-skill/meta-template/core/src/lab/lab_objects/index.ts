/**
 * Experiment subjects — the 3D objects whose state the simulation drives.
 *
 * Phase 4 (ode_system archetype) will add:
 *   - Pendulum — rod + bob mesh, exposes setAngle(theta) only
 *   - Spring — coil mesh, exposes setExtension(x)
 * Later archetypes:
 *   - Beaker (chemical-reaction ODEs)
 *   - GridSurface (PDE / cellular automata — height + color per cell)
 *   - ParticleEmitter (Monte Carlo, agent-based clouds)
 *   - PetriDish (agent-based bounded environment)
 *   - VectorField (electromagnetics, fluid flow)
 *
 * Each lab_object accepts a *single* numeric or stateful prop driven by
 * the solver, and renders its own mesh. The agent never builds meshes
 * directly.
 */
export {};
