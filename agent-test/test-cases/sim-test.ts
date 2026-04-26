/**
 * Placeholder simulation test prompts for the OpenSim integration runner.
 *
 * Phase 1 ships only one stub case so `agent-test/scripts/test.ts` can
 * import something compilable. Phase 4 (ODE archetype golden case)
 * replaces this with the real damped-pendulum prompt from the analysis
 * document §10.5, plus a small zoo of simulation prompts covering the
 * five archetypes once they exist.
 */

export const pendulumStubTestCase = {
  id: 'damped-pendulum-stub',
  name: 'PendulumStub',
  prompt: `Build a damped pendulum simulator. The user should see a 3D pendulum on a workbench, with three knobs (length, mass, damping coefficient) and Run / Pause / Reset buttons. Plot angle vs time and a phase portrait on wall-mounted monitors.

NOTE: this prompt is a Phase-1 placeholder. The full archetype templates and tools land in Phase 3-4; running this case now will not produce a working simulator.`,
};

export const allTestCases = {
  default: pendulumStubTestCase,
  pendulum: pendulumStubTestCase,
};
