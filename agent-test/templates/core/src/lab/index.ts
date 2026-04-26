/**
 * Top-level barrel for the virtual-lab catalog.
 *
 * Every simulation imports its building blocks from `./lab/...`. The
 * catalog is intentionally re-exported as a flat namespace so that the
 * agent's code-implementation phase can write
 *   `import { BaseLabScene, Dial, Pendulum } from '../lab';`
 * without needing to remember which subdirectory a component lives in.
 */
export * from './scenes';
export * from './instruments';
export * from './lab_objects';
export * from './interactions';
export * from './visualization';
