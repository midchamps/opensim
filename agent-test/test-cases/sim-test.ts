/**
 * Simulation test prompts for the OpenSim integration runner.
 *
 * `pendulumGoldenCase` is the Phase-4 / Gate-4 MVP target: one short
 * sentence the agent must turn into a working damped-pendulum simulator
 * end-to-end. `boidsGoldenCase` is the Phase-6 / Gate-6 cross-archetype
 * target — same prompt shape, different archetype, exercises the
 * `agent_based` module.
 *
 * Each prompt is deliberately terse — the system prompt
 * (`prompts/sim-custom.md`) does the heavy lifting on workflow
 * discipline.
 */

export const pendulumGoldenCase = {
  id: 'damped-pendulum',
  name: 'DampedPendulum',
  prompt: `Build a damped pendulum simulator. The user should see a 3D pendulum on a workbench, with three knobs to adjust length / mass / damping coefficient, plus Run / Pause / Reset buttons. Show angle vs time and a phase portrait on wall-mounted monitors. Make small-angle motion match T = 2π√(L/g) within 2%.`,
};

export const boidsGoldenCase = {
  id: 'boids-flock',
  name: 'BoidsFlock',
  prompt: `Build a 3D boids flocking simulator. About 100 agents move inside a softly confined region, steering by separation, alignment, and cohesion. Three knobs adjust the alignment / cohesion / separation weights. Run / Pause / Reset buttons. Show the swarm's mean speed over time on a wall-mounted monitor. With non-zero alignment weight, the flock should reach polarization ≥ 0.7 within 10 simulated seconds.`,
};

export const allTestCases = {
  default: pendulumGoldenCase,
  pendulum: pendulumGoldenCase,
  boids: boidsGoldenCase,
};
