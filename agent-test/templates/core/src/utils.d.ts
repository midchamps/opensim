import Phaser from 'phaser';
/**
 * Reset origin and offset for sprite after playing animation
 *
 * IMPORTANT: Must be called every time after playing any animation!
 * Also recommended to call every frame in update() for sprites with varying frame sizes.
 * This reads origin data from animations.json and adjusts collision body offset.
 *
 * @param sprite - The sprite to adjust
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
 */
export declare const audioExists: (scene: Phaser.Scene, key: string) => boolean;
/**
 * Check if a texture key exists
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
