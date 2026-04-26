import Phaser from 'phaser';
/**
 * Player class registry for dynamic player creation
 * Maps playerClass string to actual class constructor
 */
export type PlayerClassMap = Record<string, new (scene: Phaser.Scene, x: number, y: number) => any>;
/**
 * BaseLevelScene - Level Scene Base Class (Platformer)
 *
 * This is the foundation for all platformer level scenes.
 * It uses the Template Method Pattern with extensive Hooks for customization.
 *
 * CONTROLS:
 *   - WASD: Move Left/Right or Jump
 *   - Space / W: Jump
 *   - Shift: Melee Attack (alternating combo: odd=punch, even=kick)
 *   - E: Ranged Attack
 *   - Q: Ultimate Skill (long cooldown)
 *
 * TEMPLATE METHOD PATTERN:
 *   The createBaseElements() method defines the algorithm skeleton.
 *   Subclasses implement abstract methods to fill in the specifics.
 *
 * HOOK PATTERN:
 *   Protected methods prefixed with "on" are hooks that can be overridden.
 *   Hooks provide extension points without modifying the base class.
 *
 * ABSTRACT METHODS (MUST implement):
 *   - setupMapSize(): Set map dimensions
 *   - createBackground(): Create background sprite
 *   - createTileMap(): Load tilemap and layers
 *   - createDecorations(): Create non-interactive elements
 *   - createPlayer(): Create player instance
 *   - createEnemies(): Create enemy instances
 *
 * HOOK METHODS (CAN override):
 *   - onPreCreate(): Before any creation
 *   - onPostCreate(): After all creation complete
 *   - onPreUpdate(): Before each frame update
 *   - onPostUpdate(): After each frame update
 *   - onPlayerDeath(): When player dies
 *   - onLevelComplete(): When level is completed
 *   - onEnemyKilled(enemy): When an enemy is killed
 *   - setupCustomCollisions(): Add custom collision handlers
 *
 * Usage:
 *   export class Level1Scene extends BaseLevelScene {
 *     constructor() { super({ key: 'Level1Scene' }); }
 *
 *     setupMapSize() { this.mapWidth = 1920; this.mapHeight = 1280; }
 *     createBackground() { ... }
 *     createTileMap() { ... }
 *     createDecorations() { ... }
 *     createPlayer() { this.player = new Player(this, x, y); }
 *     createEnemies() { ... }
 *   }
 */
export declare abstract class BaseLevelScene extends Phaser.Scene {
    /** Flag to prevent multiple completion triggers */
    gameCompleted: boolean;
    /** Map width in pixels */
    mapWidth: number;
    /** Map height in pixels */
    mapHeight: number;
    /** Tile size in pixels (default 64) */
    tileSize: number;
    /** Player character - set in createPlayer() */
    player: any;
    /** Enemies group */
    enemies: Phaser.GameObjects.Group;
    /** Enemy melee triggers group (for boss attacks) */
    enemyMeleeTriggers: Phaser.GameObjects.Group;
    /** Decorations group (collectibles, props) */
    decorations: Phaser.GameObjects.Group;
    /** Player bullets group */
    playerBullets: Phaser.GameObjects.Group;
    /** Enemy bullets group */
    enemyBullets: Phaser.GameObjects.Group;
    /** WASD keys for movement */
    wasdKeys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    /** Space key for jump */
    spaceKey: Phaser.Input.Keyboard.Key;
    /** Shift key for melee attack */
    shiftKey: Phaser.Input.Keyboard.Key;
    /** E key for ranged attack */
    eKey: Phaser.Input.Keyboard.Key;
    /** Q key for ultimate skill */
    qKey: Phaser.Input.Keyboard.Key;
    map: Phaser.Tilemaps.Tilemap;
    groundTileset: Phaser.Tilemaps.Tileset;
    groundLayer: Phaser.Tilemaps.TilemapLayer;
    background: Phaser.GameObjects.TileSprite;
    backgroundMusic?: Phaser.Sound.BaseSound;
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig);
    /**
     * Create all level elements in the correct order.
     * This is the Template Method - it defines the algorithm skeleton.
     * Call this in your create() method.
     */
    createBaseElements(): void;
    /**
     * Initialize all groups
     */
    private initializeGroups;
    /**
     * Setup camera to follow player.
     * Offset places the player in the lower 1/3 of the screen so platforms
     * above are visible — standard for side-scrolling platformers.
     */
    private setupCamera;
    /**
     * Setup world physics bounds
     */
    private setupWorldBounds;
    /**
     * Setup input controls
     *
     * Key bindings:
     * - WASD: Move Left/Right or Jump
     * - Space / W: Jump
     * - Shift: Melee Attack (alternating combo)
     * - E: Ranged Attack
     * - Q: Ultimate Skill
     */
    setupInputs(): void;
    /**
     * Setup all base collision handlers
     */
    setupBaseCollisions(): void;
    /**
     * Setup ground collision
     */
    private setupGroundCollisions;
    /**
     * Setup contact damage (player touching enemy)
     */
    private setupContactDamage;
    /**
     * Setup melee attack collisions
     */
    private setupMeleeCollisions;
    /**
     * Setup bullet collision detection
     */
    private setupBulletCollisions;
    /**
     * Destroy a bullet properly
     */
    private destroyBullet;
    /**
     * Base update logic - call this in your update() method
     */
    baseUpdate(): void;
    /**
     * Update all enemies
     */
    private updateEnemies;
    /**
     * Update all bullets
     */
    private updateBullets;
    /**
     * Update parallax background
     */
    private updateParallax;
    /**
     * Check if player fell off map
     */
    private checkPlayerFall;
    /**
     * Check if all enemies are defeated
     */
    checkWinCondition(): void;
    /**
     * HOOK: Called before any creation in createBaseElements()
     */
    protected onPreCreate(): void;
    /**
     * HOOK: Called after all creation in createBaseElements()
     */
    protected onPostCreate(): void;
    /**
     * HOOK: Called at the start of baseUpdate()
     */
    protected onPreUpdate(): void;
    /**
     * HOOK: Called at the end of baseUpdate()
     */
    protected onPostUpdate(): void;
    /**
     * HOOK: Called when player dies
     * Default: Launch GameOverUIScene
     */
    protected onPlayerDeath(): void;
    /**
     * HOOK: Called when level is completed (all enemies defeated).
     * Default: Launch VictoryUIScene or GameCompleteUIScene after a short
     * delay (500 ms) so the last kill animation can play out.
     */
    protected onLevelComplete(): void;
    /**
     * HOOK: Called when an enemy is killed
     * Use for scoring, drops, effects
     */
    protected onEnemyKilled(enemy: any): void;
    /**
     * HOOK: Setup custom collision handlers
     * Called after setupBaseCollisions() in createBaseElements()
     */
    protected setupCustomCollisions(): void;
    /**
     * Show floating damage number at the given world position.
     * The text floats upward and fades out over ~600 ms.
     *
     * @param x - World X position
     * @param y - World Y position
     * @param damage - Damage value to display
     * @param color - Text colour (default '#ffffff')
     */
    showDamageNumber(x: number, y: number, damage: number, color?: string, fontSize?: number, duration?: number): void;
    /**
     * Get the player class map for dynamic player creation
     * Override this method to register your player classes
     */
    protected getPlayerClasses(): PlayerClassMap;
    /**
     * Create player based on registry selection or default
     *
     * @param x - Spawn X position
     * @param y - Spawn Y position
     * @param defaultClass - Default class if no selection in registry
     */
    protected createPlayerByType(x: number, y: number, defaultClass: new (scene: Phaser.Scene, x: number, y: number) => any): any;
    /** Set map dimensions. Must set: this.mapWidth, this.mapHeight */
    abstract setupMapSize(): void;
    /** Create background sprite (typically TileSprite for parallax) */
    abstract createBackground(): void;
    /** Create tilemap and collision layers. Must set: this.map, this.groundTileset, this.groundLayer */
    abstract createTileMap(): void;
    /** Create decorations. WARNING: Player does not exist yet */
    abstract createDecorations(): void;
    /** Create player character. Must set: this.player */
    abstract createPlayer(): void;
    /** Create enemies. Add to: this.enemies */
    abstract createEnemies(): void;
}
