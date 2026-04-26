import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
export { type PlayerClassMap } from './BaseGameScene';
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
export declare abstract class BaseLevelScene extends BaseGameScene {
    /** Map width in pixels (columns × tileSize) */
    mapWidth: number;
    /** Map height in pixels (rows × tileSize) */
    mapHeight: number;
    /** Tile size in pixels (default 64) */
    tileSize: number;
    /** Primary map reference (typically the floor map) — used for dimensions & Object Layer */
    map: Phaser.Tilemaps.Tilemap;
    /** Floor tileset image */
    floorTileset: Phaser.Tilemaps.Tileset;
    /** Walls tileset image */
    wallsTileset: Phaser.Tilemaps.Tileset;
    /** Floor layer — walkable area, no collision */
    floorLayer: Phaser.Tilemaps.TilemapLayer;
    /** Walls layer — collision boundaries */
    wallsLayer: Phaser.Tilemaps.TilemapLayer;
    background: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Image;
    /**
     * Create all level elements in the correct order.
     * This is the Template Method — call this in your create() method.
     */
    createBaseElements(): void;
    /**
     * Setup camera to follow player with 2D lerp, bounded to map
     */
    private setupCamera;
    /**
     * Setup world physics bounds — all 4 sides for top-down, based on map size
     */
    private setupWorldBounds;
    /**
     * Setup wall collisions — player, enemies, and bullets vs tilemap walls layer
     * This is tilemap-specific (BaseArenaScene has no walls layer).
     */
    private setupWallCollisions;
    /**
     * Check if all enemies are defeated — triggers onLevelComplete().
     */
    protected checkWinCondition(): void;
    /**
     * Set map dimensions. Must set: this.mapWidth, this.mapHeight
     * Example: this.mapWidth = 18 * this.tileSize;
     */
    abstract setupMapSize(): void;
    /**
     * Create the game environment (tilemap, decorations, obstacles).
     *
     * Must set: this.map, this.floorTileset, this.wallsTileset,
     *           this.floorLayer, this.wallsLayer
     *
     * Top-down games use DUAL TILESETS (floor + walls):
     *   - Load two tilemap JSONs (one floor, one walls)
     *   - Floor layer: walkable area, no collision
     *   - Walls layer: collision boundaries
     *   - Store the floor map as this.map (for dimensions & Object Layer)
     *
     * NOTE: All groups (this.decorations, this.obstacles, etc.) are already
     * initialized — safe to add items to them.
     */
    abstract createEnvironment(): void;
    /**
     * Create all entities (player, enemies).
     * Must set: this.player
     * Must add enemies to: this.enemies
     * Must add boss melee triggers to: this.enemyMeleeTriggers
     */
    abstract createEntities(): void;
}
