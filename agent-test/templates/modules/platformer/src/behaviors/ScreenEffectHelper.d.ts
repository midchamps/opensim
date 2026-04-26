import Phaser from 'phaser';
/**
 * Screen shake configuration
 */
export interface ShakeConfig {
    /** Duration in milliseconds */
    duration: number;
    /** Intensity (0.001 = subtle, 0.02 = strong) */
    intensity: number;
}
/**
 * Trail effect configuration
 */
export interface TrailConfig {
    /** Image key for trail effect */
    imageKey: string;
    /** Number of trail images */
    count: number;
    /** Delay between each trail image (ms) */
    delay: number;
    /** Initial scale */
    scale: number;
    /** End scale */
    endScale: number;
    /** Tint color (optional) */
    tint?: number;
    /** Initial alpha */
    alpha: number;
    /** Duration of fade out (ms) */
    duration: number;
}
/**
 * Explosion effect configuration
 */
export interface ExplosionConfig {
    /** Image key */
    imageKey: string;
    /** Initial scale */
    scale: number;
    /** End scale */
    endScale: number;
    /** Initial alpha */
    alpha: number;
    /** Duration (ms) */
    duration: number;
    /** Ease function */
    ease?: string;
}
/**
 * Vortex effect configuration
 */
export interface VortexConfig {
    /** Image key */
    imageKey: string;
    /** Initial scale */
    initialScale: number;
    /** Max scale */
    maxScale: number;
    /** Total rotation (in radians) */
    rotation: number;
    /** Grow duration (ms) */
    growDuration: number;
    /** Sustain duration (ms) */
    sustainDuration: number;
    /** Fade duration (ms) */
    fadeDuration: number;
}
/**
 * ScreenEffectHelper - Static utility class for screen effects
 *
 * Provides reusable methods for common visual effects:
 * - Screen shake
 * - Trail effects (for dash attacks)
 * - Explosion effects
 * - Vortex effects (for targeted abilities)
 *
 * All methods are static and can be called without instantiation.
 *
 * Usage:
 *   ScreenEffectHelper.shake(scene, { duration: 400, intensity: 0.01 });
 *   ScreenEffectHelper.createTrail(scene, x, y, config);
 */
export declare class ScreenEffectHelper {
    /**
     * Apply screen shake effect
     *
     * @param scene - The scene
     * @param config - Shake configuration
     *
     * Common presets:
     * - Light: { duration: 200, intensity: 0.003 }
     * - Medium: { duration: 400, intensity: 0.008 }
     * - Strong: { duration: 500, intensity: 0.015 }
     */
    static shake(scene: Phaser.Scene, config: ShakeConfig): void;
    /**
     * Light screen shake (for minor impacts)
     */
    static shakeLight(scene: Phaser.Scene): void;
    /**
     * Medium screen shake (for attacks)
     */
    static shakeMedium(scene: Phaser.Scene): void;
    /**
     * Strong screen shake (for powerful skills)
     */
    static shakeStrong(scene: Phaser.Scene): void;
    /**
     * Create trail effect at a position
     * Spawns multiple images over time that fade out
     *
     * @param scene - The scene
     * @param owner - The entity creating the trail (for position tracking)
     * @param config - Trail configuration
     *
     * @example
     *   // Blue lightning trail
     *   ScreenEffectHelper.createTrail(scene, player, {
     *     imageKey: 'lightning_effect',
     *     count: 5,
     *     delay: 80,
     *     scale: 0.2,
     *     endScale: 0.4,
     *     tint: 0x00ffff,
     *     alpha: 0.8,
     *     duration: 300,
     *   });
     */
    static createTrail(scene: Phaser.Scene, owner: {
        x: number;
        y: number;
    }, config: TrailConfig): void;
    /**
     * Create dash trail with default settings
     */
    static createDashTrail(scene: Phaser.Scene, owner: {
        x: number;
        y: number;
    }, imageKey: string, tint?: number): void;
    /**
     * Create explosion effect at a position
     *
     * @param scene - The scene
     * @param x - X position
     * @param y - Y position
     * @param config - Explosion configuration
     * @returns The explosion image (already animated, will auto-destroy)
     */
    static createExplosion(scene: Phaser.Scene, x: number, y: number, config: ExplosionConfig): Phaser.GameObjects.Image;
    /**
     * Create default explosion effect
     */
    static createDefaultExplosion(scene: Phaser.Scene, x: number, y: number, imageKey: string): Phaser.GameObjects.Image;
    /**
     * Create vortex effect at a position
     * Used for targeted execution abilities
     *
     * @param scene - The scene
     * @param x - X position
     * @param y - Y position
     * @param config - Vortex configuration
     * @param onComplete - Callback when effect completes
     * @returns The vortex image
     */
    static createVortex(scene: Phaser.Scene, x: number, y: number, config: VortexConfig, onComplete?: () => void): Phaser.GameObjects.Image;
    /**
     * Create default vortex effect
     */
    static createDefaultVortex(scene: Phaser.Scene, x: number, y: number, imageKey: string, onComplete?: () => void): Phaser.GameObjects.Image;
    /**
     * Create charging effect that spins while active
     * Used for AOE charge-up effects
     *
     * @param scene - The scene
     * @param x - X position
     * @param y - Y position
     * @param imageKey - Effect image key
     * @param duration - How long to spin (ms)
     * @returns The charge effect image
     */
    static createChargeEffect(scene: Phaser.Scene, x: number, y: number, imageKey: string, duration?: number): Phaser.GameObjects.Image;
    /**
     * Show floating damage number
     *
     * @param scene - The scene
     * @param x - X position
     * @param y - Y position
     * @param damage - Damage amount
     * @param color - Text color (default: '#ff3333')
     */
    static showDamageNumber(scene: Phaser.Scene, x: number, y: number, damage: number, color?: string): void;
}
