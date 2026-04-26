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
export const fadeIn = (scene, target, duration = 300, onComplete) => {
    target.alpha = 0;
    return scene.tweens.add({
        targets: target,
        alpha: 1,
        duration,
        onComplete,
    });
};
/** Fade out a game object. */
export const fadeOut = (scene, target, duration = 300, onComplete) => {
    return scene.tweens.add({
        targets: target,
        alpha: 0,
        duration,
        onComplete,
    });
};
/** Slide a game object to a position. */
export const slideTo = (scene, target, toX, toY, duration = 400, ease = 'Cubic.easeOut', onComplete) => {
    return scene.tweens.add({
        targets: target,
        x: toX,
        y: toY,
        duration,
        ease,
        onComplete,
    });
};
/** Scale bounce effect (pop in). */
export const popIn = (scene, target, duration = 200, onComplete) => {
    target.setScale(0);
    return scene.tweens.add({
        targets: target,
        scaleX: 1,
        scaleY: 1,
        duration,
        ease: 'Back.easeOut',
        onComplete,
    });
};
/** Shake effect (for damage feedback, errors). */
export const shake = (scene, target, intensity = 5, duration = 200, onComplete) => {
    const originalX = target.x;
    scene.tweens.add({
        targets: target,
        x: originalX + intensity,
        duration: duration / 8,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
            target.x = originalX;
            onComplete?.();
        },
    });
};
/** Pulse/breathe effect (infinite loop). */
export const pulse = (scene, target, minScale = 0.95, maxScale = 1.05, duration = 600) => {
    // Set initial scale to minScale so the tween oscillates between min and max
    target.setScale(minScale);
    return scene.tweens.add({
        targets: target,
        scaleX: { from: minScale, to: maxScale },
        scaleY: { from: minScale, to: maxScale },
        duration: duration / 2,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });
};
/** Get screen center coordinates. */
export const getScreenCenter = (scene) => {
    return {
        x: scene.cameras.main.width / 2,
        y: scene.cameras.main.height / 2,
    };
};
/** Distribute items evenly across a horizontal line. Returns x positions. */
export const distributeHorizontally = (count, totalWidth, padding = 0) => {
    if (count <= 0)
        return [];
    if (count === 1)
        return [totalWidth / 2];
    const usableWidth = totalWidth - 2 * padding;
    const spacing = usableWidth / (count - 1);
    return Array.from({ length: count }, (_, i) => padding + i * spacing);
};
//# sourceMappingURL=TweenPresets.js.map