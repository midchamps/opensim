import Phaser from 'phaser';
/**
 * UI Scene - In-game HUD overlay
 * This file is a STANDARD TEMPLATE
 *
 * This scene runs parallel to the game scene and displays:
 * - Player health bar
 * - Boss health bar (optional)
 * - Pause button
 * - Controls hint
 *
 * TODO for AI: Customize the following:
 * 1. createDOMUI() - Modify HTML/CSS for your game's HUD
 * 2. Controls hint text - Update to match your game's controls
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
     * Create HUD elements:
     * - Player health bar
     * - Boss health bar (optional)
     * - Pause button
     * - Controls hint
     *
     * TODO: Customize controls hint for your game
     */
    createDOMUI(): void;
    /**
     * Update UI elements based on game state
     * Called every frame
     */
    update(): void;
    /**
     * Update player health bar display
     */
    private updatePlayerHealthBar;
    /**
     * Update boss health bar display (if boss exists in scene)
     */
    private updateBossHealthBar;
    /**
     * Update ultimate skill cooldown bar and label.
     * Uses player.ultimate.getCooldownProgress() (0→1) and
     * player.ultimate.getCooldownRemaining() (ms remaining).
     */
    private updateUltimateCooldown;
}
