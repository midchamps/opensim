/**
 * ============================================================================
 * TEMPLATE: Level Scene
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename (e.g., Level1Scene.ts)
 * 2. Update constructor key to match scene name
 * 3. Implement all abstract methods
 * 4. Add scene to main.ts: game.scene.add('Level1Scene', Level1Scene)
 * 5. Add to LevelManager.ts LEVEL_ORDER array
 * 6. Optionally override hooks for custom behavior
 *
 * HOOK METHODS AVAILABLE:
 * - onPreCreate(): Before creation
 * - onPostCreate(): After creation
 * - onPreUpdate(): Before each frame
 * - onPostUpdate(): After each frame
 * - onPlayerDeath(): When player dies
 * - onLevelComplete(): When level completed (500 ms delay built-in)
 * - onEnemyKilled(enemy): When enemy dies
 * - setupCustomCollisions(): Custom collision handlers
 *
 * BUILT-IN FEATURES (from BaseLevelScene):
 * - Floating damage numbers on every hit (yellow for enemies, red for player)
 * - Camera offset: player positioned at bottom 1/3 of screen
 * - Victory delay: 500 ms before showing victory/complete screen
 * - Defensive update loop with try-catch for player and enemies
 * ============================================================================
 */
import { BaseLevelScene } from './BaseLevelScene';
export declare class _TemplateLevel extends BaseLevelScene {
    constructor();
    /**
     * Preload - create bullet textures here
     */
    preload(): void;
    /**
     * Create - build the level
     */
    create(): void;
    /**
     * Update - called every frame
     */
    update(): void;
    setupMapSize(): void;
    createBackground(): void;
    createTileMap(): void;
    createDecorations(): void;
    createPlayer(): void;
    createEnemies(): void;
    /**
     * Setup custom collisions (player-decoration, triggers, etc.)
     * Player EXISTS at this point - safe to add player collisions
     */
    protected setupCustomCollisions(): void;
    /**
     * Called when an enemy is killed.
     * Damage numbers are shown automatically by BaseLevelScene on every hit.
     * Use this hook for scoring, item drops, or bonus effects on kill.
     */
    protected onEnemyKilled(enemy: any): void;
    /**
     * Called when player dies
     */
    protected onPlayerDeath(): void;
    /**
     * Called when level is completed.
     * BaseLevelScene adds a 500 ms delay before showing the victory screen
     * so the last kill animation can play out.
     */
    protected onLevelComplete(): void;
}
