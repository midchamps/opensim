import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
/**
 * BaseArenaScene - Fixed-Screen Arena/Shooter Scene (Top-Down)
 *
 * Extends BaseGameScene for games WITHOUT tilemaps — fixed-screen or
 * scrolling-background shooters, survival arenas, bullet-hell, etc.
 *
 * KEY DIFFERENCES FROM BaseLevelScene:
 *   - No tilemap — world = screen size (or small play area)
 *   - Scrolling background (vertical/horizontal) instead of tilemap layers
 *   - Static camera (no follow) — player moves within screen bounds
 *   - Dynamic enemy spawning via wave/timer system (NOT pre-placed on map)
 *   - Score-based progression (NOT room-clearing)
 *   - No wall collision layer (screen bounds only)
 *   - Optional boss system
 *
 * WORLD MODEL:
 *   The "world" is the screen itself. Background images scroll to create
 *   the illusion of movement. Enemies spawn off-screen and move in.
 *   Player is confined to screen bounds.
 *
 * BUILT-IN SYSTEMS:
 *   1. Scrolling Background — two images that loop vertically
 *   2. Enemy Spawner — timer-based wave system with difficulty scaling
 *   3. Score System — addScore() + onScoreChanged() hook
 *   4. Difficulty System — auto-increasing difficulty level
 *
 * ABSTRACT METHODS (MUST implement):
 *   - createBackground(): Create scrolling or static background
 *   - createEntities(): Create player (enemies are spawned dynamically)
 *   - spawnEnemy(): Called by spawner to create one enemy instance
 *
 * HOOK METHODS (CAN override — in addition to BaseGameScene hooks):
 *   - getSpawnInterval(): Customize spawn timing per difficulty
 *   - onDifficultyUp(level): React to difficulty increase
 *   - onScoreChanged(score): React to score change
 *   - onBossSpawn(): Triggered when boss conditions are met
 *   - onBossDeath(): Triggered when boss is killed
 *   - getScrollDirection(): 'vertical' (default) or 'horizontal'
 *   - getScrollSpeed(): Background scroll speed
 *
 * Usage:
 *   export class SpaceLevel extends BaseArenaScene {
 *     constructor() { super({ key: 'SpaceLevel' }); }
 *     createBackground() { ... }
 *     createEntities() { this.player = new Ship(this, x, y); }
 *     spawnEnemy() { return new Seagull(this, x, y); }
 *   }
 */
export declare abstract class BaseArenaScene extends BaseGameScene {
    /** Screen width in pixels (read from gameConfig.json) */
    protected screenWidth: number;
    /** Screen height in pixels (read from gameConfig.json) */
    protected screenHeight: number;
    /** First background image (loops with bg2) */
    protected bg1: Phaser.GameObjects.Image;
    /** Second background image (loops with bg1) */
    protected bg2: Phaser.GameObjects.Image;
    /** Current player score */
    score: number;
    /** Accumulated time since last spawn (ms) */
    protected spawnTimer: number;
    /** Current difficulty level (starts at 1, auto-increases) */
    protected difficultyLevel: number;
    /** Accumulated time since last difficulty increase (ms) */
    protected difficultyTimer: number;
    /** How often difficulty increases in ms (default: 30s) */
    protected difficultyInterval: number;
    /** Kill counter — can be used to trigger boss spawn */
    protected killCount: number;
    /** Boss kill count threshold (0 = no boss) */
    protected bossKillThreshold: number;
    /** Whether boss is currently active */
    protected bossActive: boolean;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig);
    /**
     * Create all arena elements in the correct order.
     * This is the Template Method — call this in your create() method.
     */
    createBaseElements(): void;
    /**
     * Setup static camera (no follow — arena fits in screen)
     */
    private setupArenaCamera;
    /**
     * Setup screen bounds — player and entities collide with screen edges
     */
    private setupScreenBounds;
    /**
     * Helper: Setup a vertically scrolling background with two looping images.
     * Call this in createBackground() for the standard scroll effect.
     *
     * @param textureKey - The background image asset key
     */
    protected setupScrollingBg(textureKey: string): void;
    /**
     * Virtual override: Update scrolling background each frame.
     * Moves bg1/bg2 downward and loops them.
     */
    protected updateBackground(): void;
    /**
     * Virtual override: Timer-based enemy spawning with difficulty scaling.
     * Called every frame by baseUpdate().
     */
    protected updateSpawner(): void;
    /**
     * Add points to score and notify via hook.
     * Also emits 'scoreChanged' scene event for UIScene integration.
     */
    addScore(points: number): void;
    /**
     * Override: Track kills and trigger boss spawn when threshold reached.
     */
    protected onEnemyKilled(enemy: any): void;
    /**
     * HOOK: Get background scroll speed (pixels per frame).
     * Override to change speed or make it dynamic.
     */
    protected getScrollSpeed(): number;
    /**
     * HOOK: Get scroll direction.
     * Override: return 'horizontal' for side-scrolling shooters.
     */
    protected getScrollDirection(): 'vertical' | 'horizontal';
    /**
     * HOOK: Get spawn interval in ms, based on current difficulty.
     * Default: faster spawning as difficulty increases.
     */
    protected getSpawnInterval(): number;
    /**
     * HOOK: Called when difficulty level increases.
     * Use for: speed up enemies, spawn tougher types, visual feedback.
     */
    protected onDifficultyUp(level: number): void;
    /**
     * HOOK: Called when score changes.
     * Use for: UI updates, milestone effects.
     */
    protected onScoreChanged(score: number): void;
    /**
     * HOOK: Called when kill count reaches bossKillThreshold.
     * Use for: spawn boss, clear existing enemies, show warning.
     */
    protected onBossSpawn(): void;
    /**
     * HOOK: Called when boss is killed.
     * Use for: celebration, unlock next phase, level complete.
     * Set this.bossActive = false to resume normal spawning.
     */
    protected onBossDeath(): void;
    /**
     * Create the background (scrolling or static).
     *
     * For scrolling: call this.setupScrollingBg('bg_key')
     * For static: this.add.image(w/2, h/2, 'bg').setDisplaySize(w, h).setDepth(-10)
     *
     * NOTE: All groups are already initialized — safe to add decorations.
     */
    abstract createBackground(): void;
    /**
     * Create the player character (and optionally initial game state).
     * Enemies are NOT created here — they are spawned dynamically by the spawner.
     *
     * Must set: this.player
     * Optional: set this.bossKillThreshold, this.difficultyInterval, etc.
     */
    abstract createEntities(): void;
    /**
     * Spawn a single enemy instance.
     * Called by the built-in spawner system at regular intervals.
     *
     * Typical pattern:
     *   - Choose enemy type based on this.difficultyLevel
     *   - Create enemy at off-screen position
     *   - Add to this.enemies group
     *
     * @returns The spawned enemy (for chaining), or void
     */
    abstract spawnEnemy(): any;
}
