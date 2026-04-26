import Phaser from 'phaser';
/**
 * Player class registry for dynamic player creation
 * Maps playerClass string to actual class constructor
 */
export type PlayerClassMap = Record<string, new (scene: Phaser.Scene, x: number, y: number) => any>;
/**
 * BaseGameScene - Common Foundation for ALL Top-Down Game Scenes
 *
 * This is the **shared layer** inherited by both:
 *   - BaseLevelScene  (tilemap-based levels: dungeons, exploration)
 *   - BaseArenaScene  (fixed-screen arenas: space shooters, survival)
 *
 * PROVIDES:
 *   - Group management (enemies, bullets, obstacles, decorations, ySortGroup)
 *   - Core collision setup (entity-vs-entity, NOT entity-vs-tilemap)
 *   - Y-Sort depth rendering
 *   - Update loop (player, enemies, bullets, Y-sort)
 *   - Input setup (WASD, mouse, dash, melee, ranged)
 *   - Hook system (onEnemyKilled, onPlayerDeath, onLevelComplete, …)
 *   - Bullet creation hooks
 *
 * DOES NOT CONTAIN (subclass responsibility):
 *   - World construction (tilemap OR scrolling background)
 *   - Camera configuration (follow player OR static)
 *   - World/screen bounds setup
 *   - Tilemap-layer collisions (BaseLevelScene only)
 *   - Scrolling background / spawner (BaseArenaScene only)
 *
 * ARCHITECTURE:
 *   BaseGameScene  (you are here — shared utilities, no abstract methods)
 *     ├── BaseLevelScene   — tilemap: dual-tileset, camera follow, wall collisions
 *     └── BaseArenaScene   — arena: scrolling bg, screen bounds, wave spawner
 */
export declare abstract class BaseGameScene extends Phaser.Scene {
    /** Flag to prevent multiple completion triggers */
    gameCompleted: boolean;
    /**
     * World width in pixels.
     * - BaseLevelScene sets this to mapWidth (tile columns × tileSize)
     * - BaseArenaScene sets this to screenSize.width
     */
    worldWidth: number;
    /**
     * World height in pixels.
     * - BaseLevelScene sets this to mapHeight (tile rows × tileSize)
     * - BaseArenaScene sets this to screenSize.height
     */
    worldHeight: number;
    /** Player character — set in createEntities() / createPlayer() */
    player: any;
    /** Enemies group */
    enemies: Phaser.GameObjects.Group;
    /** Enemy melee triggers group (for boss attacks) */
    enemyMeleeTriggers: Phaser.GameObjects.Group;
    /** Decorations group (visual props — NOT Y-sorted, no physics) */
    decorations: Phaser.GameObjects.Group;
    /** Obstacles group (physics-enabled props like crates — auto Y-sorted) */
    obstacles: Phaser.GameObjects.Group;
    /** Player bullets group */
    playerBullets: Phaser.GameObjects.Group;
    /** Enemy bullets group */
    enemyBullets: Phaser.GameObjects.Group;
    /**
     * Container for Y-sorted entities.
     * All entities that need depth sorting should be added here.
     * The base update loop sorts children by Y position each frame.
     */
    ySortGroup: Phaser.GameObjects.Group;
    /** WASD keys for 8-directional movement */
    wasdKeys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    /** Space key for dash */
    spaceKey: Phaser.Input.Keyboard.Key;
    /** Shift key for melee attack */
    shiftKey: Phaser.Input.Keyboard.Key;
    /** E key for ranged attack */
    eKey: Phaser.Input.Keyboard.Key;
    /** Q key for special ability */
    qKey: Phaser.Input.Keyboard.Key;
    backgroundMusic?: Phaser.Sound.BaseSound;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig);
    /**
     * Initialize all game-object groups.
     * Must be called BEFORE createEnvironment / createEntities.
     */
    protected initializeGroups(): void;
    /**
     * Setup input controls (WASD, Space, Shift, E, Q, mouse)
     */
    protected setupInputs(): void;
    /**
     * Configure physics for top-down — disable gravity
     */
    protected configurePhysics(): void;
    /**
     * Setup all entity-vs-entity collisions.
     * Does NOT include tilemap wall collisions (BaseLevelScene adds those).
     */
    protected setupCoreCollisions(): void;
    /**
     * Obstacle collisions: player, enemies, and bullets vs physics obstacles
     */
    private setupObstacleCollisions;
    /**
     * Contact damage: player touching enemy → 2D knockback + damage
     */
    private setupContactDamage;
    /**
     * Melee collisions: player melee ↔ enemies, enemy melee ↔ player
     */
    private setupMeleeCollisions;
    /**
     * Bullet-vs-entity collisions (NOT bullet-vs-wall — that's tilemap-specific)
     */
    private setupBulletVsEntityCollisions;
    /**
     * Destroy a bullet properly (calls bullet.hit() if available, else destroy)
     */
    protected destroyBullet(bullet: any): void;
    /**
     * Base update logic — call this in your update() method.
     *
     * Includes virtual extension points that subclasses override:
     *   - updateBackground(): BaseArenaScene overrides for scrolling background
     *   - updateSpawner():    BaseArenaScene overrides for wave spawning
     *   - checkWinCondition(): BaseLevelScene overrides for "all enemies dead"
     */
    baseUpdate(): void;
    /**
     * Update all enemies
     */
    private updateEnemies;
    /**
     * Update bullets — destroy off-world projectiles
     */
    private updateBullets;
    /**
     * Y-Sort: Sort entities by Y position for depth rendering.
     * Entities with higher Y (lower on screen) appear in front.
     *
     * Auto-includes: player, enemies, obstacles, ySortGroup items.
     * Does NOT include decorations (ground-level visual props).
     *
     * Uses body.bottom if available (foot position), otherwise sprite.y.
     */
    private updateYSort;
    /**
     * Virtual: Update background each frame.
     * BaseArenaScene overrides for scrolling background.
     * BaseLevelScene: no-op (tilemap is static).
     */
    protected updateBackground(): void;
    /**
     * Virtual: Update enemy spawner each frame.
     * BaseArenaScene overrides for wave-based spawning.
     * BaseLevelScene: no-op (enemies are pre-placed on map).
     */
    protected updateSpawner(): void;
    /**
     * Virtual: Check win/lose conditions each frame.
     * BaseLevelScene overrides: all enemies dead → onLevelComplete()
     * BaseArenaScene: no default (endless mode — override for boss-kill, etc.)
     */
    protected checkWinCondition(): void;
    /** HOOK: Called before any creation in createBaseElements() */
    protected onPreCreate(): void;
    /** HOOK: Called after all creation in createBaseElements() */
    protected onPostCreate(): void;
    /** HOOK: Called at the start of baseUpdate() */
    protected onPreUpdate(): void;
    /** HOOK: Called at the end of baseUpdate() */
    protected onPostUpdate(): void;
    /**
     * HOOK: Called when player dies.
     * Default: Launch GameOverUIScene
     */
    protected onPlayerDeath(): void;
    /**
     * HOOK: Called when level is completed.
     * Default: Launch VictoryUIScene or GameCompleteUIScene
     */
    protected onLevelComplete(): void;
    /**
     * HOOK: Called when an enemy is killed.
     * Use for scoring, drops, effects.
     */
    protected onEnemyKilled(enemy: any): void;
    /**
     * HOOK: Setup custom collision handlers.
     * Called after setupCoreCollisions() in createBaseElements().
     */
    protected setupCustomCollisions(): void;
    /**
     * HOOK: Create crosshair cursor (top-down aiming reticle).
     * Called after entity creation in createBaseElements().
     */
    protected createCrosshair(): void;
    /**
     * HOOK: Get camera configuration.
     * Override to customize camera behavior.
     */
    protected getCameraConfig(): {
        lerpX: number;
        lerpY: number;
        zoom: number;
    };
    /**
     * HOOK: Create a player bullet and add it to the playerBullets group.
     * MUST call this.playerBullets.add(bullet) if overriding!
     */
    protected createPlayerBullet(x: number, y: number, angle: number, speed: number, damage: number, textureKey?: string): Phaser.Physics.Arcade.Sprite;
    /**
     * HOOK: Create an enemy bullet and add it to the enemyBullets group.
     * MUST call this.enemyBullets.add(bullet) if overriding!
     */
    protected createEnemyBullet(x: number, y: number, angle: number, speed: number, damage: number, textureKey?: string): Phaser.Physics.Arcade.Sprite;
    /**
     * Get the player class map for dynamic player creation.
     * Override to register your player classes.
     */
    protected getPlayerClasses(): PlayerClassMap;
    /**
     * Create player based on registry selection or default.
     */
    protected createPlayerByType(x: number, y: number, defaultClass: new (scene: Phaser.Scene, x: number, y: number) => any): any;
}
