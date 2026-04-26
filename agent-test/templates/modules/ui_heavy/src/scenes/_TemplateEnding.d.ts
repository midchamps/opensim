/**
 * ============================================================================
 * TEMPLATE: Ending Scene (Victory / Defeat / Custom)
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename (e.g., VictoryScene.ts, DefeatScene.ts)
 * 2. Rename the class
 * 3. Define ending data in getEndingData()
 * 4. Override hooks for custom content and results display
 *
 * CRITICAL RULES:
 * - Do NOT override create() - base class handles the full lifecycle
 * - getEndingData() is REQUIRED
 * - Base class provides: setupContinue (Enter/Space/Click to return)
 * - Always check this.textures.exists() before using texture keys
 * - All interface/type imports MUST use "type" keyword
 * - Scene key in scene.start('KEY') MUST match key registered in main.ts
 *   (e.g., 'TitleScreen' not 'TitleScene')
 *
 * FILE CHECKLIST (complete AFTER implementing this scene):
 *   [ ] main.ts — import and register this scene with game.scene.add()
 *   [ ] asset-pack.json — register background/music keys used here
 *   [ ] onContinue() — ensure scene.start('X') target is registered in main.ts
 * ============================================================================
 */
import { BaseEndingScene, type EndingData } from './BaseEndingScene';
export declare class _TemplateEnding extends BaseEndingScene {
    constructor();
    protected getEndingData(): EndingData;
    protected createBackground(): void;
    protected createEndingContent(): void;
    protected showResults(): void;
    protected onContinue(): void;
}
