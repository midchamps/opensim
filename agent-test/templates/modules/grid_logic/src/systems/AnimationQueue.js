import Phaser from 'phaser';
export class AnimationQueue extends Phaser.Events.EventEmitter {
    _scene;
    _queue = [];
    _isPlaying = false;
    constructor(scene) {
        super();
        this._scene = scene;
    }
    // --------------------------------------------------------------------------
    // Properties
    // --------------------------------------------------------------------------
    get isPlaying() {
        return this._isPlaying;
    }
    get isEmpty() {
        return this._queue.length === 0;
    }
    get length() {
        return this._queue.length;
    }
    // --------------------------------------------------------------------------
    // Queue Management
    // --------------------------------------------------------------------------
    /**
     * Add a single animation step to the queue (plays after previous steps finish).
     */
    enqueue(animation) {
        this._queue.push({ type: 'sequential', animations: [animation] });
    }
    /**
     * Add multiple animations that play simultaneously, then wait for all to finish.
     */
    enqueueParallel(animations) {
        if (animations.length === 0)
            return;
        this._queue.push({ type: 'parallel', animations });
    }
    /**
     * Clear all queued animations (does not stop currently playing animation).
     */
    clear() {
        this._queue.length = 0;
    }
    // --------------------------------------------------------------------------
    // Playback
    // --------------------------------------------------------------------------
    /**
     * Play all queued animations in order.
     * Returns a Promise that resolves when ALL animations are done.
     * Emits 'started' and 'completed' events.
     */
    async play() {
        if (this._isPlaying || this._queue.length === 0)
            return;
        this._isPlaying = true;
        this.emit('started');
        while (this._queue.length > 0) {
            const step = this._queue.shift();
            if (step.type === 'parallel') {
                await Promise.all(step.animations.map((fn) => fn()));
            }
            else {
                for (const fn of step.animations) {
                    await fn();
                }
            }
        }
        this._isPlaying = false;
        this.emit('completed');
    }
    // --------------------------------------------------------------------------
    // Animation Factories (convenience methods)
    // --------------------------------------------------------------------------
    /**
     * Create an animation callback that moves a game object to a world position.
     */
    static move(scene, target, toX, toY, duration = 200, ease = 'Power2') {
        return () => new Promise((resolve) => {
            if (!target.active) {
                resolve();
                return;
            }
            scene.tweens.add({
                targets: target,
                x: toX,
                y: toY,
                duration,
                ease,
                onComplete: () => resolve(),
            });
        });
    }
    /**
     * Create an animation callback that moves a game object along a path of world positions.
     */
    static movePath(scene, target, path, stepDuration = 150, ease = 'Power2') {
        return async () => {
            for (const point of path) {
                if (!target.active)
                    return;
                await new Promise((resolve) => {
                    scene.tweens.add({
                        targets: target,
                        x: point.x,
                        y: point.y,
                        duration: stepDuration,
                        ease,
                        onComplete: () => resolve(),
                    });
                });
            }
        };
    }
    /**
     * Create an animation callback that fades a game object.
     */
    static fade(scene, target, toAlpha, duration = 300, ease = 'Linear') {
        return () => new Promise((resolve) => {
            if (!target.active) {
                resolve();
                return;
            }
            scene.tweens.add({
                targets: target,
                alpha: toAlpha,
                duration,
                ease,
                onComplete: () => resolve(),
            });
        });
    }
    /**
     * Create an animation callback that scales a game object.
     */
    static scale(scene, target, toScale, duration = 200, ease = 'Back.easeOut') {
        return () => new Promise((resolve) => {
            if (!target.active) {
                resolve();
                return;
            }
            scene.tweens.add({
                targets: target,
                scaleX: toScale,
                scaleY: toScale,
                duration,
                ease,
                onComplete: () => resolve(),
            });
        });
    }
    /**
     * Create an animation callback that destroys a game object with a shrink+fade effect.
     */
    static destroy(scene, target, duration = 300) {
        return () => new Promise((resolve) => {
            if (!target.active) {
                resolve();
                return;
            }
            scene.tweens.add({
                targets: target,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration,
                ease: 'Back.easeIn',
                onComplete: () => {
                    target.destroy();
                    resolve();
                },
            });
        });
    }
    /**
     * Create an animation callback that shakes a game object.
     */
    static shake(scene, target, intensity = 4, duration = 200) {
        return () => new Promise((resolve) => {
            if (!target.active) {
                resolve();
                return;
            }
            const origX = target.x;
            const origY = target.y;
            const steps = Math.ceil(duration / 40);
            let step = 0;
            scene.time.addEvent({
                delay: 40,
                repeat: steps - 1,
                callback: () => {
                    step++;
                    if (!target.active || step >= steps) {
                        if (target.active) {
                            target.x = origX;
                            target.y = origY;
                        }
                        resolve();
                    }
                    else {
                        target.x = origX + (Math.random() - 0.5) * intensity * 2;
                        target.y = origY + (Math.random() - 0.5) * intensity * 2;
                    }
                },
            });
        });
    }
    /**
     * Create an animation callback that waits for a duration.
     */
    static delay(scene, duration) {
        return () => new Promise((resolve) => {
            scene.time.delayedCall(duration, resolve);
        });
    }
    /**
     * Create an animation callback that plays a pop-in effect (scale from 0 to target).
     */
    static popIn(scene, target, targetScale = 1, duration = 300) {
        return () => new Promise((resolve) => {
            if (!target.active) {
                resolve();
                return;
            }
            const sx = target.scaleX;
            const sy = target.scaleY;
            target.setScale(0);
            scene.tweens.add({
                targets: target,
                scaleX: targetScale * (sx / Math.abs(sx || 1)),
                scaleY: targetScale * (sy / Math.abs(sy || 1)),
                duration,
                ease: 'Back.easeOut',
                onComplete: () => resolve(),
            });
        });
    }
    /**
     * Create an animation callback that bounces a game object (scale yoyo).
     */
    static bounce(scene, target, bounceScale = 1.2, duration = 200) {
        return () => new Promise((resolve) => {
            if (!target.active) {
                resolve();
                return;
            }
            const origSX = target.scaleX;
            const origSY = target.scaleY;
            scene.tweens.add({
                targets: target,
                scaleX: origSX * bounceScale,
                scaleY: origSY * bounceScale,
                duration: duration / 2,
                yoyo: true,
                ease: 'Quad.easeOut',
                onComplete: () => resolve(),
            });
        });
    }
    // --------------------------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------------------------
    destroy() {
        this.clear();
        this.removeAllListeners();
        super.destroy();
    }
}
//# sourceMappingURL=AnimationQueue.js.map