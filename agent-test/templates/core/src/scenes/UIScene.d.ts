import Phaser from 'phaser';
/**
 * UI Scene - In-game HUD overlay (UNIVERSAL BASE)
 *
 * This is the CORE version with only universal features:
 * - Pause button (top-right)
 * - ESC key to pause
 *
 * Game-type modules (platformer, ui_heavy, etc.) should provide their own
 * UIScene.ts that OVERWRITES this file during scaffold, adding game-specific
 * HUD elements (health bars, controls hints, combo displays, etc.).
 *
 * If no module provides a UIScene.ts, this minimal version is used.
 */
export default class UIScene extends Phaser.Scene {
    currentGameSceneKey: string | null;
    uiContainer: Phaser.GameObjects.DOMElement | null;
    constructor();
    /**
     * Receive game scene key from level scene
     * Called when level scene launches this UI scene
     */
    init(data: {
        gameSceneKey?: string;
    }): void;
    create(): void;
    /**
     * Setup pause button click and ESC key listener
     */
    private setupPauseControls;
    /**
     * Pause the game and show pause menu
     */
    private pauseGame;
    /**
     * Create minimal HUD - just a pause button.
     * Module-specific UIScene.ts should override this entire file
     * to add game-specific HUD elements (health bars, controls, etc.).
     */
    createDOMUI(): void;
    /**
     * Update UI elements based on game state.
     * The core version does nothing - module-specific UIScene.ts adds update logic.
     */
    update(): void;
}
