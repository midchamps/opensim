import Phaser from 'phaser';
/**
 * UI Scene - In-game HUD overlay (Top-Down)
 *
 * This is the top-down module's UIScene with game-specific HUD elements:
 * - Health bar
 * - Dash cooldown indicator
 * - Pause button + ESC key
 *
 * This file OVERWRITES the core UIScene.ts during scaffold.
 * It extends the core version with top-down specific UI elements.
 *
 * HOOK POINTS for customization:
 * Override createDOMUI() in your _TemplateLevel subclass's onPostCreate
 * to customize the HUD, or override this entire file.
 */
export default class UIScene extends Phaser.Scene {
    currentGameSceneKey: string | null;
    uiContainer: Phaser.GameObjects.DOMElement | null;
    constructor();
    /**
     * Receive game scene key from level scene
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
     * Create the HUD with health bar, dash cooldown, and pause button
     */
    createDOMUI(): void;
    /**
     * Update UI elements based on game state
     */
    update(): void;
}
