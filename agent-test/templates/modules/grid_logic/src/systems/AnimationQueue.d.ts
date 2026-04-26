import Phaser from 'phaser';
export type AnimationCallback = () => Promise<void>;
export declare class AnimationQueue extends Phaser.Events.EventEmitter {
    private _scene;
    private _queue;
    private _isPlaying;
    constructor(scene: Phaser.Scene);
    get isPlaying(): boolean;
    get isEmpty(): boolean;
    get length(): number;
    /**
     * Add a single animation step to the queue (plays after previous steps finish).
     */
    enqueue(animation: AnimationCallback): void;
    /**
     * Add multiple animations that play simultaneously, then wait for all to finish.
     */
    enqueueParallel(animations: AnimationCallback[]): void;
    /**
     * Clear all queued animations (does not stop currently playing animation).
     */
    clear(): void;
    /**
     * Play all queued animations in order.
     * Returns a Promise that resolves when ALL animations are done.
     * Emits 'started' and 'completed' events.
     */
    play(): Promise<void>;
    /**
     * Create an animation callback that moves a game object to a world position.
     */
    static move(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & {
        x: number;
        y: number;
    }, toX: number, toY: number, duration?: number, ease?: string): AnimationCallback;
    /**
     * Create an animation callback that moves a game object along a path of world positions.
     */
    static movePath(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & {
        x: number;
        y: number;
    }, path: {
        x: number;
        y: number;
    }[], stepDuration?: number, ease?: string): AnimationCallback;
    /**
     * Create an animation callback that fades a game object.
     */
    static fade(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & {
        alpha: number;
    }, toAlpha: number, duration?: number, ease?: string): AnimationCallback;
    /**
     * Create an animation callback that scales a game object.
     */
    static scale(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & {
        scaleX: number;
        scaleY: number;
    }, toScale: number, duration?: number, ease?: string): AnimationCallback;
    /**
     * Create an animation callback that destroys a game object with a shrink+fade effect.
     */
    static destroy(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & {
        alpha: number;
        scaleX: number;
        scaleY: number;
    }, duration?: number): AnimationCallback;
    /**
     * Create an animation callback that shakes a game object.
     */
    static shake(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & {
        x: number;
        y: number;
    }, intensity?: number, duration?: number): AnimationCallback;
    /**
     * Create an animation callback that waits for a duration.
     */
    static delay(scene: Phaser.Scene, duration: number): AnimationCallback;
    /**
     * Create an animation callback that plays a pop-in effect (scale from 0 to target).
     */
    static popIn(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & {
        scaleX: number;
        scaleY: number;
    }, targetScale?: number, duration?: number): AnimationCallback;
    /**
     * Create an animation callback that bounces a game object (scale yoyo).
     */
    static bounce(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & {
        scaleX: number;
        scaleY: number;
    }, bounceScale?: number, duration?: number): AnimationCallback;
    destroy(): void;
}
