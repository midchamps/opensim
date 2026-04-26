/**
 * ============================================================================
 * TWEEN PRESETS - Common UI animations for UI-heavy games
 * ============================================================================
 *
 * Utility functions for common UI animations. These are ADDITIONAL helpers
 * that supplement core/utils.ts (which is NOT overwritten by this module).
 *
 * This file exports INDIVIDUAL FUNCTIONS, not a class or object.
 *
 * CORRECT IMPORT:
 *   import { fadeIn, shake, popIn } from '../ui/TweenPresets';
 *   fadeIn(this, myImage, 300);
 *   shake(this, enemy, 5, 200);
 *
 * ALSO VALID (namespace import):
 *   import * as TweenPresets from '../ui/TweenPresets';
 *   TweenPresets.fadeIn(this, myImage, 300);
 *
 * !! WRONG - WILL CAUSE RUNTIME ERROR !!
 *   import { TweenPresets } from '../ui/TweenPresets';  // <-- NO SUCH EXPORT
 *   new TweenPresets(...)                               // <-- NOT A CLASS
 * ============================================================================
 */
import Phaser from 'phaser';
/** Fade in a game object. */
export declare const fadeIn: (scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, duration?: number, onComplete?: () => void) => Phaser.Tweens.Tween;
/** Fade out a game object. */
export declare const fadeOut: (scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, duration?: number, onComplete?: () => void) => Phaser.Tweens.Tween;
/** Slide a game object to a position. */
export declare const slideTo: (scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, toX: number, toY: number, duration?: number, ease?: string, onComplete?: () => void) => Phaser.Tweens.Tween;
/** Scale bounce effect (pop in). */
export declare const popIn: (scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, duration?: number, onComplete?: () => void) => Phaser.Tweens.Tween;
/** Shake effect (for damage feedback, errors). */
export declare const shake: (scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, intensity?: number, duration?: number, onComplete?: () => void) => void;
/** Pulse/breathe effect (infinite loop). */
export declare const pulse: (scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, minScale?: number, maxScale?: number, duration?: number) => Phaser.Tweens.Tween;
/** Get screen center coordinates. */
export declare const getScreenCenter: (scene: Phaser.Scene) => {
    x: number;
    y: number;
};
/** Distribute items evenly across a horizontal line. Returns x positions. */
export declare const distributeHorizontally: (count: number, totalWidth: number, padding?: number) => number[];
