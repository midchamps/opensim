import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
import * as utils from '../utils';
// Re-export for backward compatibility
export {} from './BaseGameScene';
/**
 * BaseLevelScene - Tilemap-Based Level Scene (Top-Down)
 *
 * Extends BaseGameScene with tilemap-specific functionality:
 *   - Dual tileset loading (floor + walls)
 *   - Camera follow with zoom and bounds
 *   - Wall collision layers (player/enemies/bullets vs walls)
 *   - Map-based world bounds
 *
 * Use this for: dungeon crawlers, exploration games, room-clearing shooters,
 * RPG combat, any game with a designed tilemap layout.
 *
 * For fixed-screen arena/shooter games, use BaseArenaScene instead.
 *
 * KEY DIFFERENCES FROM PLATFORMER BaseLevelScene:
 *   - Zero gravity (arcade physics with gravity.y = 0)
 *   - Y-Sort depth rendering (entities at lower Y appear in front)
 *   - 2D camera follow (lerp on both axes)
 *   - No bottom-world-bound death (no falling off map)
 *   - Full 2D world bounds (all 4 sides enabled)
 *   - Contact damage uses 2D knockback
 *   - Tilemap uses top-down dual tilesets (floor + walls)
 *
 * TEMPLATE METHOD PATTERN:
 *   The createBaseElements() method defines the algorithm skeleton.
 *   Subclasses implement abstract methods to fill in the specifics.
 *
 * ABSTRACT METHODS (MUST implement):
 *   - setupMapSize(): Set map dimensions
 *   - createEnvironment(): Create tilemap, decorations, obstacles
 *   - createEntities(): Create player and enemies
 *
 * HOOK METHODS (CAN override — inherited from BaseGameScene):
 *   - onPreCreate(), onPostCreate()
 *   - onPreUpdate(), onPostUpdate()
 *   - onPlayerDeath(), onLevelComplete(), onEnemyKilled(enemy)
 *   - setupCustomCollisions()
 *   - getCameraConfig(), createCrosshair()
 *   - createPlayerBullet(...), createEnemyBullet(...)
 *
 * Usage:
 *   export class Level1Scene extends BaseLevelScene {
 *     constructor() { super({ key: 'Level1Scene' }); }
 *     setupMapSize() { this.mapWidth = 18 * this.tileSize; this.mapHeight = 12 * this.tileSize; }
 *     createEnvironment() { ... }
 *     createEntities() { this.player = new Player(this, x, y); ... }
 *   }
 */
export class BaseLevelScene extends BaseGameScene {
    // ============================================================================
    // MAP DIMENSIONS
    // ============================================================================
    /** Map width in pixels (columns × tileSize) */
    mapWidth = 0;
    /** Map height in pixels (rows × tileSize) */
    mapHeight = 0;
    /** Tile size in pixels (default 64) */
    tileSize = 64;
    // ============================================================================
    // TILEMAP (Dual Tilesets: floor + walls)
    // ============================================================================
    /** Primary map reference (typically the floor map) — used for dimensions & Object Layer */
    map;
    /** Floor tileset image */
    floorTileset;
    /** Walls tileset image */
    wallsTileset;
    /** Floor layer — walkable area, no collision */
    floorLayer;
    /** Walls layer — collision boundaries */
    wallsLayer;
    // ============================================================================
    // BACKGROUND
    // ============================================================================
    background;
    // ============================================================================
    // TEMPLATE METHOD: CREATE FLOW (Tilemap Mode)
    // ============================================================================
    /**
     * Create all level elements in the correct order.
     * This is the Template Method — call this in your create() method.
     */
    createBaseElements() {
        this.gameCompleted = false;
        // HOOK: Pre-create
        this.onPreCreate();
        // === PHASE 1: Map Setup ===
        this.setupMapSize();
        this.worldWidth = this.mapWidth;
        this.worldHeight = this.mapHeight;
        // === PHASE 2: Group Initialization (BEFORE environment!) ===
        this.initializeGroups();
        // === PHASE 3: Environment (tilemap) ===
        this.createEnvironment();
        // === PHASE 4: Entity Creation ===
        this.createEntities();
        // === PHASE 4.5: Crosshair (HOOK) ===
        this.createCrosshair();
        // === PHASE 5: System Setup ===
        this.setupCamera();
        this.setupWorldBounds();
        this.setupInputs();
        this.configurePhysics();
        // === PHASE 6: Collision Setup ===
        this.setupCoreCollisions(); // entity-vs-entity (from BaseGameScene)
        this.setupWallCollisions(); // entity-vs-tilemap (tilemap-specific)
        this.setupCustomCollisions(); // HOOK
        // === PHASE 7: UI Launch ===
        this.scene.launch('UIScene', { gameSceneKey: this.scene.key });
        // HOOK: Post-create
        this.onPostCreate();
    }
    // ============================================================================
    // TILEMAP-SPECIFIC SETUP
    // ============================================================================
    /**
     * Setup camera to follow player with 2D lerp, bounded to map
     */
    setupCamera() {
        if (!this.player) {
            console.warn('BaseLevelScene.setupCamera: this.player is null — did createEntities() set it?');
            return;
        }
        const cameraConfig = this.getCameraConfig();
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(cameraConfig.lerpX, cameraConfig.lerpY);
        if (cameraConfig.zoom !== 1) {
            this.cameras.main.setZoom(cameraConfig.zoom);
        }
    }
    /**
     * Setup world physics bounds — all 4 sides for top-down, based on map size
     */
    setupWorldBounds() {
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight, true, true, true, true);
        if (this.player?.setCollideWorldBounds) {
            this.player.setCollideWorldBounds(true);
        }
        this.enemies.children.iterate((enemy) => {
            if (enemy?.setCollideWorldBounds) {
                enemy.setCollideWorldBounds(true);
            }
            return true;
        });
    }
    /**
     * Setup wall collisions — player, enemies, and bullets vs tilemap walls layer
     * This is tilemap-specific (BaseArenaScene has no walls layer).
     */
    setupWallCollisions() {
        if (!this.wallsLayer)
            return;
        // Player & enemies vs walls
        utils.addCollider(this, this.player, this.wallsLayer);
        utils.addCollider(this, this.enemies, this.wallsLayer);
        // Bullets vs walls (destroy on hit)
        utils.addCollider(this, this.playerBullets, this.wallsLayer, (bullet) => this.destroyBullet(bullet));
        utils.addCollider(this, this.enemyBullets, this.wallsLayer, (bullet) => this.destroyBullet(bullet));
    }
    // ============================================================================
    // WIN CONDITION (Tilemap Mode: all enemies dead)
    // ============================================================================
    /**
     * Check if all enemies are defeated — triggers onLevelComplete().
     */
    checkWinCondition() {
        const activeEnemyCount = this.enemies.children.entries.filter((enemy) => enemy.active && !enemy.isDead).length;
        if (activeEnemyCount === 0 && !this.gameCompleted) {
            this.gameCompleted = true;
            this.onLevelComplete();
        }
    }
}
//# sourceMappingURL=BaseLevelScene.js.map