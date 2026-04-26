/**
 * ============================================================================
 * TEMPLATE: Level Scene (Top-Down)
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
 * ABSTRACT METHODS TO IMPLEMENT:
 * - setupMapSize(): Set map dimensions
 * - createEnvironment(): Create background, tilemap, decorations
 * - createEntities(): Create player and enemies
 *
 * HOOK METHODS AVAILABLE:
 * - onPreCreate(): Before creation
 * - onPostCreate(): After creation
 * - onPreUpdate(): Before each frame
 * - onPostUpdate(): After each frame
 * - onPlayerDeath(): When player dies
 * - onLevelComplete(): When level completed
 * - onEnemyKilled(enemy): When enemy dies
 * - setupCustomCollisions(): Custom collision handlers
 * - getCameraConfig(): Customize camera settings
 * - createCrosshair(): Custom cursor/crosshair
 * ============================================================================
 */
import { BaseLevelScene } from './BaseLevelScene';
export declare class _TemplateLevel extends BaseLevelScene {
    constructor();
    /**
     * Preload — create bullet textures here
     */
    preload(): void;
    /**
     * Create — build the level
     */
    create(): void;
    /**
     * Update — called every frame
     */
    update(): void;
    setupMapSize(): void;
    createEnvironment(): void;
    /**
     * Create a physics-enabled obstacle (crate, barrel, etc.)
     * Added to this.obstacles group (auto Y-sorted + auto collision).
     */
    private createObstacle;
    createEntities(): void;
    /**
     * Setup custom collisions (player-decoration, triggers, etc.)
     * Player EXISTS at this point — safe to add player collisions
     */
    protected setupCustomCollisions(): void;
    /**
     * Called when an enemy is killed
     */
    protected onEnemyKilled(enemy: any): void;
    /**
     * Called when player dies
     */
    protected onPlayerDeath(): void;
    /**
     * Called when level is completed
     */
    protected onLevelComplete(): void;
    /**
     * Customize camera settings
     */
    protected getCameraConfig(): {
        lerpX: number;
        lerpY: number;
        zoom: number;
    };
}
