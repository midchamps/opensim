import Phaser from 'phaser';
import { vi } from 'vitest';
/**
 * Create a headless Phaser game instance for testing.
 * This allows testing game logic without requiring a browser or canvas.
 */
export function createHeadlessGame(configOverrides = {}) {
    const baseConfig = {
        type: Phaser.HEADLESS,
        width: 1,
        height: 1,
        banner: false,
        audio: { noAudio: true },
        // We run under jsdom; skip feature detection
        customEnvironment: true,
        fps: { target: 60, forceSetTimeOut: true },
        autoFocus: false,
        physics: {
            default: 'arcade',
            arcade: { debug: false },
        },
    };
    return new Phaser.Game({ ...baseConfig, ...configOverrides });
}
/**
 * Boot a scene in headless mode and wait for it to be ready.
 * Use this to test scene initialization and basic functionality.
 */
export async function bootScene(SceneClass, configOverrides = {}) {
    const scene = new SceneClass();
    const game = createHeadlessGame({
        scene: [scene],
        ...configOverrides,
    });
    // Wait for scene systems to be ready and create lifecycle to run
    await nextMicroTask();
    await tickFrames(1);
    return { game, scene };
}
/**
 * Advance the game by a specified number of frames.
 * Each frame advances time by ~16.67ms (60 FPS).
 */
export async function tickFrames(frames) {
    const msPerFrame = 1000 / 60;
    for (let i = 0; i < frames; i += 1) {
        vi.advanceTimersByTime(msPerFrame);
        await nextMicroTask();
    }
}
/**
 * Properly destroy a Phaser game instance.
 * Always call this in afterEach() to prevent memory leaks.
 */
export async function destroyGame(game) {
    await game.destroy(true);
}
async function nextMicroTask() {
    await Promise.resolve();
}
/**
 * Wait until a condition becomes true, or timeout after maxFrames.
 * Useful for waiting for async operations or animations to complete.
 */
export async function waitUntil(condition, maxFrames = 100) {
    let frames = 0;
    while (!condition()) {
        await tickFrames(1);
        frames++;
        if (frames > maxFrames) {
            throw new Error(`Wait until condition timed out after ${maxFrames} frames`);
        }
    }
}
//# sourceMappingURL=phaser.js.map