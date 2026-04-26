/**
 * Simulation test prompts for the OpenSim integration runner.
 *
 * `pendulumGoldenCase` is the Phase-4 / Gate-4 MVP target: one short
 * sentence the agent must turn into a working damped-pendulum simulator
 * end-to-end. The prompt is deliberately terse — the system prompt
 * (`prompts/sim-custom.md`) does the heavy lifting on workflow
 * discipline.
 *
 * Phase 6+ adds prompts for additional archetypes (boids for
 * agent_based, heat-diffusion for pde_grid, etc.).
 */

export const pendulumGoldenCase = {
  id: 'damped-pendulum',
  name: 'DampedPendulum',
  prompt: `Build a damped pendulum simulator. The user should see a 3D pendulum on a workbench, with three knobs to adjust length / mass / damping coefficient, plus Run / Pause / Reset buttons. Show angle vs time and a phase portrait on wall-mounted monitors. Make small-angle motion match T = 2π√(L/g) within 2%.`,
};

export const allTestCases = {
  default: pendulumGoldenCase,
  pendulum: pendulumGoldenCase,
};
