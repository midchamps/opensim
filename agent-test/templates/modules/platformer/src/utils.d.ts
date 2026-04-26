import Phaser from 'phaser';
/**
 * Reset origin and offset for sprite after playing animation
 *
 * IMPORTANT: Must be called every time after playing any animation!
 * Also recommended to call every frame in update() for sprites with varying frame sizes.
 *
 * CRITICAL FIX for inconsistent animation frame sizes:
 * When animation frames have different dimensions, this function:
 * 1. Normalizes the display size (adjusts scale so displayHeight stays consistent)
 * 2. Adjusts origin based on facing direction
 * 3. Recalculates body offset to keep feet aligned
 *
 * This ensures smooth visual transitions between frames of different sizes
 * while maintaining correct collision behavior.
 *
 * @param sprite - The sprite to adjust (must have been initialized with initScale)
 * @param facingDirection - Current facing direction
 */
export declare const resetOriginAndOffset: (sprite: any, facingDirection: "left" | "right" | "up" | "down") => void;
/**
 * Safely add a sound effect - returns undefined if audio key doesn't exist
 *
 * IMPORTANT: Always use this instead of scene.sound.add() directly!
 * This prevents game crashes when audio assets are missing.
 *
 * Usage:
 *   this.jumpSound = safeAddSound(this.scene, "jump_sfx", { volume: 0.3 });
 *   // Later: this.jumpSound?.play();  // Safe to call even if undefined
 *
 * @param scene - The scene to add sound to
 * @param key - Audio key to load
 * @param config - Optional sound config
 * @returns Sound object or undefined if key doesn't exist
 */
export declare const safeAddSound: (scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig) => Phaser.Sound.BaseSound | undefined;
/**
 * Check if an audio key exists in the cache
 *
 * @param scene - The scene to check
 * @param key - Audio key to check
 * @returns true if audio exists
 */
export declare const audioExists: (scene: Phaser.Scene, key: string) => boolean;
/**
 * Check if a texture key exists
 *
 * @param scene - The scene to check
 * @param key - Texture key to check
 * @returns true if texture exists
 */
export declare const textureExists: (scene: Phaser.Scene, key: string) => boolean;
/**
 * Initialize sprite scale, size, and offset
 *
 * IMPORTANT: All image assets must use initScale for scaling!
 * DO NOT use setScale or setDisplaySize directly!
 *
 * This function correctly handles both DynamicBody and StaticBody:
 * - DynamicBody: setSize needs unscaled dimensions (body auto-scales with sprite)
 * - StaticBody: setSize needs scaled dimensions (body does NOT auto-scale)
 * - StaticBody.setOffset has a BUG - use position.set instead!
 */
export declare const initScale: (sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, origin: {
    x: number;
    y: number;
}, maxDisplayWidth?: number, maxDisplayHeight?: number, bodyWidthFactorToDisplayWidth?: number, bodyHeightFactorToDisplayHeight?: number) => void;
/**
 * Add collider with guaranteed parameter order
 *
 * IMPORTANT: Use this instead of scene.physics.add.collider!
 * Phaser has an internal bug where callback parameters can be swapped
 * when object1 is a physics group or tilemap.
 */
export declare const addCollider: (scene: Phaser.Scene, object1: Phaser.Types.Physics.Arcade.ArcadeColliderType, object2: Phaser.Types.Physics.Arcade.ArcadeColliderType, collideCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, callbackContext?: any) => Phaser.Physics.Arcade.Collider;
/**
 * Add overlap with guaranteed parameter order
 *
 * IMPORTANT: Use this instead of scene.physics.add.overlap!
 */
export declare const addOverlap: (scene: Phaser.Scene, object1: Phaser.Types.Physics.Arcade.ArcadeColliderType, object2: Phaser.Types.Physics.Arcade.ArcadeColliderType, collideCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, callbackContext?: any) => Phaser.Physics.Arcade.Collider;
/**
 * Initialize UI DOM element for UI scenes
 * IMPORTANT: Always use this instead of add.dom and createFromHTML
 */
export declare const initUIDom: (scene: Phaser.Scene, html: string) => Phaser.GameObjects.DOMElement;
/**
 * Create a decoration and add it to a group
 * Height is relative to a standard character height of 128px
 */
export declare const createDecoration: (scene: Phaser.Scene, group: Phaser.GameObjects.Group, key: string, x: number, y: number, maxDisplayHeight: number) => Phaser.GameObjects.Image;
interface TriggerOrigin {
    x: number;
    y: number;
}
interface ZoneWithOwner extends Phaser.GameObjects.Zone {
    owner?: any;
}
/**
 * Create collision trigger - useful for attack area detection
 * IMPORTANT: Use this for melee attack detection zones
 *
 * @param owner - The owner of the trigger (usually the character)
 */
export declare const createTrigger: (scene: Phaser.Scene, owner: any, x: number, y: number, width: number, height: number, origin?: TriggerOrigin) => ZoneWithOwner;
/**
 * Update melee attack trigger position and size based on character facing direction
 * Supports 4 directions: left, right, up, down
 *
 * @param attackRange - Attack forward distance (how far the attack reaches)
 * @param attackWidth - Attack coverage width (perpendicular to attack direction)
 */
export declare const updateMeleeTrigger: (character: any, meleeTrigger: ZoneWithOwner, facingDirection: "left" | "right" | "up" | "down", attackRange: number, attackWidth: number) => void;
/**
 * Calculate rotation for projectiles (bullets, arrows, etc.)
 * @param assetDirection - Asset's current direction vector (e.g., (1,0) for facing right)
 * @param targetDirection - Target direction vector
 */
export declare function computeRotation(assetDirection: Phaser.Math.Vector2, targetDirection: Phaser.Math.Vector2): number;
/**
 * Standard collectible display sizes (in pixels)
 * Use these when creating coins, health packs, ammo, etc.
 *
 * Available sizes: COIN, SMALL_ITEM, MEDIUM_ITEM, LARGE_ITEM
 * Example: utils.COLLECTIBLE_SIZES.COIN  // 32px
 */
export declare const COLLECTIBLE_SIZES: {
    readonly COIN: 32;
    readonly SMALL_ITEM: 24;
    readonly MEDIUM_ITEM: 32;
    readonly LARGE_ITEM: 48;
};
/**
 * Scale a collectible sprite to standard size
 * Use this for coins, health packs, etc.
 *
 * @param sprite - The sprite to scale
 * @param targetSize - Target size in pixels (use COLLECTIBLE_SIZES)
 */
export declare function scaleCollectible(sprite: Phaser.GameObjects.Sprite, targetSize?: number): void;
/**
 * Standard projectile display sizes (in pixels)
 * Use these when creating projectiles for consistent visuals
 *
 * Available sizes: BULLET_SMALL, BULLET_MEDIUM, GRENADE, ARROW, LARGE
 * Example: utils.PROJECTILE_SIZES.BULLET_SMALL  // 8px
 */
export declare const PROJECTILE_SIZES: {
    readonly BULLET_SMALL: 8;
    readonly BULLET_MEDIUM: 12;
    readonly GRENADE: 20;
    readonly ARROW: 24;
    readonly LARGE: 32;
};
/**
 * Create default bullet textures if not loaded
 * Call this in preload() or before creating bullets
 *
 * These are small generated textures (8x8 pixels), suitable for simple bullets.
 * For custom bullet images, use createProjectile() instead.
 *
 * Usage:
 *   // In Preloader or Level scene preload:
 *   createBulletTextures(this);
 */
export declare function createBulletTextures(scene: Phaser.Scene): void;
/**
 * Create a projectile sprite with proper scaling
 *
 * IMPORTANT: This function handles both generated textures and image assets correctly!
 * - Generated textures (from createBulletTextures): Already small, minimal scaling needed
 * - Image assets (PNG files): Usually large (64x64+), need significant scaling
 *
 * @param textureKey - Texture key (e.g., 'player_bullet', 'grenade', 'arrow')
 * @param targetSize - Desired display size in pixels (use PROJECTILE_SIZES constants)
 * @param hasGravity - Whether projectile is affected by gravity (default: false)
 * @param damage - Optional damage value to store on projectile
 *
 * Usage:
 *   // Simple bullet (using generated texture)
 *   const bullet = createProjectile(scene, x, y, 'player_bullet', PROJECTILE_SIZES.BULLET_SMALL);
 *
 *   // Grenade (using image asset)
 *   const grenade = createProjectile(scene, x, y, 'grenade', PROJECTILE_SIZES.GRENADE, true, 20);
 */
export declare function createProjectile(scene: Phaser.Scene, x: number, y: number, textureKey: string, targetSize?: number, hasGravity?: boolean, damage?: number): Phaser.Physics.Arcade.Sprite;
/**
 * Create a simple bullet sprite (legacy function, prefer createProjectile)
 *
 * This function assumes the texture is already small (like generated textures).
 * For image-based projectiles, use createProjectile() instead.
 */
export declare function createBullet(scene: Phaser.Scene, x: number, y: number, textureKey: string, velocityX: number, velocityY?: number, damage?: number): Phaser.Physics.Arcade.Sprite;
export {};
