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
 * ScreenEffectHelper - Static utility class for screen effects
 *
 * Provides reusable methods for common visual effects:
 * - Screen shake
 * - Trail effects (for dash abilities)
 * - Explosion effects
 * - Damage numbers
 *
 * All methods are static and can be called without instantiation.
 *
 * Usage:
 *   ScreenEffectHelper.shake(scene, { duration: 400, intensity: 0.01 });
 *   ScreenEffectHelper.createTrail(scene, player, config);
 *   ScreenEffectHelper.showDamageNumber(scene, x, y, 50);
 */
export declare class ScreenEffectHelper {
    /**
     * Apply screen shake effect
     *
     * Common presets:
     * - Light: { duration: 200, intensity: 0.003 }
     * - Medium: { duration: 400, intensity: 0.008 }
     * - Strong: { duration: 500, intensity: 0.015 }
     */
    static shake(scene: Phaser.Scene, config: ShakeConfig): void;
    /** Light screen shake (for minor impacts) */
    static shakeLight(scene: Phaser.Scene): void;
    /** Medium screen shake (for attacks) */
    static shakeMedium(scene: Phaser.Scene): void;
    /** Strong screen shake (for powerful skills) */
    static shakeStrong(scene: Phaser.Scene): void;
    /**
     * Create trail effect following an entity
     * Spawns multiple images over time that fade out
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
     */
    static createExplosion(scene: Phaser.Scene, x: number, y: number, config: ExplosionConfig): Phaser.GameObjects.Image;
    /**
     * Create default explosion effect
     */
    static createDefaultExplosion(scene: Phaser.Scene, x: number, y: number, imageKey: string): Phaser.GameObjects.Image;
    /**
     * Show floating damage number
     */
    static showDamageNumber(scene: Phaser.Scene, x: number, y: number, damage: number, color?: string): void;
}
