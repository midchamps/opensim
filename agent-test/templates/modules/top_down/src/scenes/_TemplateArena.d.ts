/**
 * ============================================================================
 * TEMPLATE: Arena/Shooter Scene (Top-Down)
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename (e.g., SpaceLevel.ts)
 * 2. Update constructor key to match scene name
 * 3. Implement all abstract methods:
 *    - createBackground(): Scrolling or static background
 *    - createEntities(): Create player only (enemies are spawned dynamically)
 *    - spawnEnemy(): Called by spawner timer to create one enemy
 * 4. Add scene to main.ts: game.scene.add('SpaceLevel', SpaceLevel)
 * 5. Add to LevelManager.ts LEVEL_ORDER array
 * 6. Optionally override hooks for custom behavior
 *
 * WHEN TO USE THIS (instead of _TemplateLevel):
 *   - Space shooters, bullet-hell, survival arenas
 *   - Scrolling background (no tilemap)
 *   - Enemies spawn dynamically in waves (not pre-placed on map)
 *   - Fixed camera (no camera follow)
 *   - Score-based progression
 *
 * HOOK METHODS AVAILABLE (inherited from BaseGameScene + BaseArenaScene):
 *   - onPreCreate(), onPostCreate()
 *   - onPreUpdate(), onPostUpdate()
 *   - onPlayerDeath(), onLevelComplete(), onEnemyKilled(enemy)
 *   - setupCustomCollisions()
 *   - getCameraConfig(), createCrosshair()
 *   - getScrollSpeed(), getScrollDirection()
 *   - getSpawnInterval(), onDifficultyUp(level)
 *   - onScoreChanged(score)
 *   - onBossSpawn(), onBossDeath()
 *
 * COMMON PITFALLS:
 *   - checkWinCondition() is PROTECTED in BaseGameScene. If you add your own,
 *     use "protected override checkWinCondition()" — NOT "private".
 *     Using "private" causes TS2415: incompatible with base class.
 *   - Background: Use setupScrollingBg() ONLY for space shooters / vertical scrollers
 *     where the camera moves through space. For fixed-camera arena games (survival,
 *     obstacle, Red Light Green Light), use a STATIC background image instead.
 *   - Timer initialization: If you implement a countdown timer with stateTimer,
 *     initialize it to the ACTUAL duration, not 0. stateTimer = 0 triggers
 *     immediate state transitions on the first frame!
 * ============================================================================
 */
import { BaseArenaScene } from './BaseArenaScene';
export declare class _TemplateArena extends BaseArenaScene {
    constructor();
    /**
     * Preload — create bullet textures here
     */
    preload(): void;
    /**
     * Create — call createBaseElements() then add level-specific setup
     */
    create(): void;
    /**
     * Update — call baseUpdate() for core loop
     */
    update(): void;
    /**
     * Create scrolling or static background.
     *
     * CHOOSE ONE:
     *   - Scrolling: this.setupScrollingBg('bg_key')  — for space shooters / scrollers
     *   - Static:    this.add.image(...)               — for fixed-camera arenas / survival games
     *   - Solid:     this.cameras.main.setBackgroundColor('#hex')
     *
     * WARNING: Do NOT use setupScrollingBg() for fixed-camera games (survival, obstacle,
     * Red Light/Green Light). The background should remain stationary when the player
     * moves within a fixed arena.
     */
    createBackground(): void;
    /**
     * Create the player character.
     * Enemies are NOT created here — they are spawned by spawnEnemy().
     *
     * Must set: this.player
     * Optional: configure spawner settings (bossKillThreshold, etc.)
     */
    createEntities(): void;
    /**
     * Spawn a single enemy instance.
     * Called automatically by the spawner timer.
     *
     * Choose enemy type based on this.difficultyLevel.
     * Spawn off-screen and give velocity toward play area.
     */
    spawnEnemy(): any;
    /**
     * Override: Customize scroll speed (pixels per frame).
     * Can increase with difficulty for faster-paced gameplay.
     */
    protected getScrollSpeed(): number;
    /**
     * Override: Customize spawn interval based on difficulty.
     * Lower = more enemies. Default formula: 2000ms - 200ms per level (min 500ms).
     */
    protected getSpawnInterval(): number;
    /**
     * Override: Called when enemy is killed.
     * Add score, handle drops, etc.
     */
    protected onEnemyKilled(enemy: any): void;
    /**
     * Override: Called when difficulty increases.
     */
    protected onDifficultyUp(level: number): void;
    /**
     * Override: Called when score changes.
     * Emit events for UIScene to display.
     */
    protected onScoreChanged(score: number): void;
    /**
     * Override: Spawn boss when kill threshold reached.
     * Clear existing enemies, show warning, create boss.
     */
    protected onBossSpawn(): void;
    /**
     * Override: Called when boss is defeated.
     * Celebrate, resume spawning or end level.
     */
    protected onBossDeath(): void;
}
