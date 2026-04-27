/**
 * Simulation test prompts for the OpenSim integration runner.
 *
 *  - `pendulumGoldenCase`         — Phase-4 / Gate-4 MVP (ode_system).
 *  - `boidsGoldenCase`            — Phase-6 / Gate-6 (agent_based).
 *  - `titrationGoldenCase`        — Phase-10 / Gate-10 (interactive_protocol).
 *  - `phIndicatorGoldenCase`      — Phase-12 (interactive_protocol).
 *  - `reactionRateGoldenCase`     — Phase-12 (ode_system).
 *  - `populationGrowthGoldenCase` — Phase-12 (ode_system, logistic).
 *  - `invasiveSpeciesGoldenCase`  — Phase-12 (agent_based).
 *  - `naturalSelectionGoldenCase` — Phase-12 (agent_based).
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

export const titrationGoldenCase = {
  id: 'acid-base-titration',
  name: 'AcidBaseTitration',
  prompt: `Build a 3D acid-base titration simulator. The user follows a 5-step procedure on a lab bench: (1) drag a NaOH reagent bottle onto an empty burette to fill it, (2) drag a phenolphthalein indicator dropper onto an HCl analyte beaker, (3) click the burette stopcock 6 times to release drops, watching the analyte turn faint pink each drop and finally stay pink at the endpoint, (4) read the volume delivered, (5) done. Use the interactive_protocol archetype: each step is gated on the active object, with a wall-mounted instruction panel and progress dots. Drag-to-pour for the bottles, click for the stopcock.`,
};

// ---------------------------------------------------------------------------
// Phase-12 additions — A-tier cases (no new lab_objects needed; pipeline must
// be able to assemble these from the existing template catalogue alone).
// ---------------------------------------------------------------------------

export const phIndicatorGoldenCase = {
  id: 'ph-indicator-test',
  name: 'PHIndicatorTest',
  prompt: `Build a 3D pH-indicator test simulator. On the lab bench: three reagent bottles (lemon juice ≈ pH 2, water ≈ pH 7, baking-soda solution ≈ pH 9) and three empty beakers, plus a universal-indicator dropper. The user follows a 4-step procedure: (1) drag each test liquid into its own beaker; (2) drag the indicator dropper onto each beaker in turn — each turns its characteristic colour (red / green / blue) when indicator hits it; (3) read off the pH from a colour-key panel on the wall; (4) done. Use the interactive_protocol archetype with drag-to-pour, an instruction panel, and progress dots.`,
};

export const reactionRateGoldenCase = {
  id: 'reaction-rate',
  name: 'ReactionRate',
  prompt: `Build a 3D reaction-rate simulator for a generic A → B first-order reaction. The user sees a beaker on a workbench. Three knobs adjust the initial concentration [A]₀, the rate constant k (1/s), and the temperature (which scales k via an Arrhenius factor). Run / Pause / Reset buttons. Show [A](t) and [B](t) on a wall-mounted time-series monitor. The simulation must use the ode_system archetype with d[A]/dt = −k[A], d[B]/dt = +k[A], and the half-life t½ = ln(2)/k must match the analytic value within 2%.`,
};

export const populationGrowthGoldenCase = {
  id: 'population-growth',
  name: 'PopulationGrowth',
  prompt: `Build a 3D population-growth simulator using the logistic model dN/dt = r·N·(1 − N/K). The user sees a habitat on a desk with animated agents whose count tracks N(t). Three knobs adjust the growth rate r, carrying capacity K, and initial population N₀. Run / Pause / Reset buttons. Show N(t) on a wall-mounted time-series monitor. Use the ode_system archetype. The steady-state must approach K within 1% after long enough simulation time.`,
};

export const invasiveSpeciesGoldenCase = {
  id: 'invasive-species',
  name: 'InvasiveSpecies',
  prompt: `Build a 3D invasive-species simulator. About 60 native agents and 10 invasive agents move inside a confined habitat. Each native nearby an invasive has a small per-step probability of being converted into an invasive. Three knobs adjust: native population, invasive aggressiveness (conversion radius × rate), and habitat carrying capacity. Run / Pause / Reset buttons. Show native count and invasive count over time on a wall-mounted monitor. Use the agent_based archetype. With non-zero aggressiveness, the invasive count must overtake the native count within the simulated window.`,
};

export const naturalSelectionGoldenCase = {
  id: 'natural-selection',
  name: 'NaturalSelection',
  prompt: `Build a 3D natural-selection simulator. About 80 agents wander a habitat, each carrying a single trait — coat colour (light or dark) — encoded as a number in [0, 1]. A predator periodically removes agents whose colour contrasts most with the current background colour, then survivors reproduce with small mutations. Three knobs adjust: predation strength, mutation magnitude, and background colour. Run / Pause / Reset buttons. Show the mean trait value over time on a wall-mounted monitor. Use the agent_based archetype. With dark background and non-zero predation, the population mean trait must drift toward 0 (dark) within the simulated window.`,
};

export const allTestCases = {
  default: pendulumGoldenCase,
  pendulum: pendulumGoldenCase,
  boids: boidsGoldenCase,
  titration: titrationGoldenCase,
  ph: phIndicatorGoldenCase,
  phIndicator: phIndicatorGoldenCase,
  reactionRate: reactionRateGoldenCase,
  population: populationGrowthGoldenCase,
  populationGrowth: populationGrowthGoldenCase,
  invasive: invasiveSpeciesGoldenCase,
  invasiveSpecies: invasiveSpeciesGoldenCase,
  selection: naturalSelectionGoldenCase,
  naturalSelection: naturalSelectionGoldenCase,
};
