import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
import * as utils from '../utils';
import gameConfig from '../gameConfig.json';
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
export class BaseArenaScene extends BaseGameScene {
    // ============================================================================
    // SCREEN DIMENSIONS (from gameConfig)
    // ============================================================================
    /** Screen width in pixels (read from gameConfig.json) */
    screenWidth;
    /** Screen height in pixels (read from gameConfig.json) */
    screenHeight;
    // ============================================================================
    // SCROLLING BACKGROUND
    // ============================================================================
    /** First background image (loops with bg2) */
    bg1;
    /** Second background image (loops with bg1) */
    bg2;
    // ============================================================================
    // SCORE SYSTEM
    // ============================================================================
    /** Current player score */
    score = 0;
    // ============================================================================
    // SPAWNER STATE
    // ============================================================================
    /** Accumulated time since last spawn (ms) */
    spawnTimer = 0;
    /** Current difficulty level (starts at 1, auto-increases) */
    difficultyLevel = 1;
    /** Accumulated time since last difficulty increase (ms) */
    difficultyTimer = 0;
    /** How often difficulty increases in ms (default: 30s) */
    difficultyInterval = 30000;
    /** Kill counter — can be used to trigger boss spawn */
    killCount = 0;
    /** Boss kill count threshold (0 = no boss) */
    bossKillThreshold = 0;
    /** Whether boss is currently active */
    bossActive = false;
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    constructor(config) {
        super(config);
        const cfg = gameConfig;
        this.screenWidth = cfg.screenSize?.width?.value ?? 1152;
        this.screenHeight = cfg.screenSize?.height?.value ?? 768;
    }
    // ============================================================================
    // TEMPLATE METHOD: CREATE FLOW (Arena Mode)
    // ============================================================================
    /**
     * Create all arena elements in the correct order.
     * This is the Template Method — call this in your create() method.
     */
    createBaseElements() {
        this.gameCompleted = false;
        this.score = 0;
        this.killCount = 0;
        this.difficultyLevel = 1;
        this.spawnTimer = 0;
        this.difficultyTimer = 0;
        this.bossActive = false;
        // HOOK: Pre-create
        this.onPreCreate();
        // === PHASE 1: World = Screen ===
        this.worldWidth = this.screenWidth;
        this.worldHeight = this.screenHeight;
        // === PHASE 2: Group Initialization ===
        this.initializeGroups();
        // === PHASE 3: Background ===
        this.createBackground();
        // === PHASE 4: Entity Creation (player only — enemies are spawned) ===
        this.createEntities();
        // === PHASE 4.5: Crosshair (HOOK) ===
        this.createCrosshair();
        // === PHASE 5: System Setup ===
        this.setupArenaCamera();
        this.setupScreenBounds();
        this.setupInputs();
        this.configurePhysics();
        // === PHASE 6: Collision Setup ===
        this.setupCoreCollisions(); // entity-vs-entity (from BaseGameScene)
        this.setupCustomCollisions(); // HOOK
        // === PHASE 7: UI Launch ===
        this.scene.launch('UIScene', { gameSceneKey: this.scene.key });
        // HOOK: Post-create
        this.onPostCreate();
    }
    // ============================================================================
    // ARENA-SPECIFIC SETUP
    // ============================================================================
    /**
     * Setup static camera (no follow — arena fits in screen)
     */
    setupArenaCamera() {
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        // No camera follow — player moves within fixed screen
    }
    /**
     * Setup screen bounds — player and entities collide with screen edges
     */
    setupScreenBounds() {
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight, true, true, true, true);
        if (this.player?.setCollideWorldBounds) {
            this.player.setCollideWorldBounds(true);
        }
    }
    // ============================================================================
    // SCROLLING BACKGROUND SYSTEM
    // ============================================================================
    /**
     * Helper: Setup a vertically scrolling background with two looping images.
     * Call this in createBackground() for the standard scroll effect.
     *
     * @param textureKey - The background image asset key
     */
    setupScrollingBg(textureKey) {
        // Position two images end-to-end for seamless looping
        this.bg1 = this.add.image(this.screenWidth / 2, this.screenHeight / 2, textureKey);
        this.bg1.setDisplaySize(this.screenWidth, this.screenHeight);
        this.bg1.setDepth(-10);
        this.bg2 = this.add.image(this.screenWidth / 2, -this.screenHeight / 2, textureKey);
        this.bg2.setDisplaySize(this.screenWidth, this.screenHeight);
        this.bg2.setDepth(-10);
    }
    /**
     * Virtual override: Update scrolling background each frame.
     * Moves bg1/bg2 downward and loops them.
     */
    updateBackground() {
        if (!this.bg1 || !this.bg2)
            return;
        const speed = this.getScrollSpeed();
        const direction = this.getScrollDirection();
        if (direction === 'vertical') {
            this.bg1.y += speed;
            this.bg2.y += speed;
            // Reset when scrolled off screen
            if (this.bg1.y >= this.screenHeight * 1.5) {
                this.bg1.y = this.bg2.y - this.screenHeight;
            }
            if (this.bg2.y >= this.screenHeight * 1.5) {
                this.bg2.y = this.bg1.y - this.screenHeight;
            }
        }
        else {
            // Horizontal scroll (left-to-right or right-to-left)
            this.bg1.x += speed;
            this.bg2.x += speed;
            if (this.bg1.x >= this.screenWidth * 1.5) {
                this.bg1.x = this.bg2.x - this.screenWidth;
            }
            if (this.bg2.x >= this.screenWidth * 1.5) {
                this.bg2.x = this.bg1.x - this.screenWidth;
            }
        }
    }
    // ============================================================================
    // ENEMY SPAWNER SYSTEM
    // ============================================================================
    /**
     * Virtual override: Timer-based enemy spawning with difficulty scaling.
     * Called every frame by baseUpdate().
     */
    updateSpawner() {
        if (this.gameCompleted || this.bossActive)
            return;
        const delta = this.game.loop.delta;
        // Difficulty timer
        this.difficultyTimer += delta;
        if (this.difficultyTimer >= this.difficultyInterval) {
            this.difficultyTimer -= this.difficultyInterval;
            this.difficultyLevel++;
            this.onDifficultyUp(this.difficultyLevel);
        }
        // Spawn timer
        this.spawnTimer += delta;
        const interval = this.getSpawnInterval();
        if (this.spawnTimer >= interval) {
            this.spawnTimer -= interval;
            this.spawnEnemy();
        }
    }
    // ============================================================================
    // SCORE SYSTEM
    // ============================================================================
    /**
     * Add points to score and notify via hook.
     * Also emits 'scoreChanged' scene event for UIScene integration.
     */
    addScore(points) {
        this.score += points;
        this.events.emit('scoreChanged', this.score);
        this.onScoreChanged(this.score);
    }
    // ============================================================================
    // ENEMY KILLED OVERRIDE (integrates kill counter + boss trigger)
    // ============================================================================
    /**
     * Override: Track kills and trigger boss spawn when threshold reached.
     */
    onEnemyKilled(enemy) {
        this.killCount++;
        // Boss trigger
        if (this.bossKillThreshold > 0 &&
            this.killCount >= this.bossKillThreshold &&
            !this.bossActive) {
            this.bossActive = true;
            this.onBossSpawn();
        }
    }
    // ============================================================================
    // ARENA-SPECIFIC HOOKS
    // ============================================================================
    /**
     * HOOK: Get background scroll speed (pixels per frame).
     * Override to change speed or make it dynamic.
     */
    getScrollSpeed() {
        return 1;
    }
    /**
     * HOOK: Get scroll direction.
     * Override: return 'horizontal' for side-scrolling shooters.
     */
    getScrollDirection() {
        return 'vertical';
    }
    /**
     * HOOK: Get spawn interval in ms, based on current difficulty.
     * Default: faster spawning as difficulty increases.
     */
    getSpawnInterval() {
        return Math.max(500, 2000 - (this.difficultyLevel - 1) * 200);
    }
    /**
     * HOOK: Called when difficulty level increases.
     * Use for: speed up enemies, spawn tougher types, visual feedback.
     */
    onDifficultyUp(level) {
        // Override in subclass
    }
    /**
     * HOOK: Called when score changes.
     * Use for: UI updates, milestone effects.
     */
    onScoreChanged(score) {
        // Override in subclass
    }
    /**
     * HOOK: Called when kill count reaches bossKillThreshold.
     * Use for: spawn boss, clear existing enemies, show warning.
     */
    onBossSpawn() {
        // Override in subclass
    }
    /**
     * HOOK: Called when boss is killed.
     * Use for: celebration, unlock next phase, level complete.
     * Set this.bossActive = false to resume normal spawning.
     */
    onBossDeath() {
        // Override in subclass
    }
}
//# sourceMappingURL=BaseArenaScene.js.map