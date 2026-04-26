import Phaser from 'phaser';
type HeadlessBootResult<TScene extends Phaser.Scene> = {
    game: Phaser.Game;
    scene: TScene;
};
/**
 * Create a headless Phaser game instance for testing.
 * This allows testing game logic without requiring a browser or canvas.
 */
export declare function createHeadlessGame(configOverrides?: Partial<Phaser.Types.Core.GameConfig>): Phaser.Game;
/**
 * Boot a scene in headless mode and wait for it to be ready.
 * Use this to test scene initialization and basic functionality.
 */
export declare function bootScene<TScene extends Phaser.Scene>(SceneClass: new (...args: any[]) => TScene, configOverrides?: Partial<Phaser.Types.Core.GameConfig>): Promise<HeadlessBootResult<TScene>>;
/**
 * Advance the game by a specified number of frames.
 * Each frame advances time by ~16.67ms (60 FPS).
 */
export declare function tickFrames(frames: number): Promise<void>;
/**
 * Properly destroy a Phaser game instance.
 * Always call this in afterEach() to prevent memory leaks.
 */
export declare function destroyGame(game: Phaser.Game): Promise<void>;
/**
 * Wait until a condition becomes true, or timeout after maxFrames.
 * Useful for waiting for async operations or animations to complete.
 */
export declare function waitUntil(condition: () => boolean, maxFrames?: number): Promise<void>;
export {};
