import Phaser from 'phaser';
/**
 * Game Over UI Scene - Death/Failure Screen
 * This file is a STANDARD TEMPLATE
 *
 * Displayed when player dies or fails the level.
 * Restarts current level on Enter/Space/Click.
 *
 * CALLER CONTRACT (when launching this scene):
 *   this.scene.launch('GameOverUIScene', { currentLevelKey: this.scene.key });
 *   OR: { gameSceneKey: this.scene.key }  (both accepted)
 *
 * Fallback: LevelManager.getFirstLevelScene() when no key passed.
 * Requires: LevelManager.LEVEL_ORDER populated, TitleScreen registered.
 *
 * TODO for AI: Customize createDOMUI() to match game theme
 */
export declare class GameOverUIScene extends Phaser.Scene {
    private currentLevelKey;
    private isRestarting;
    private uiContainer;
    private enterKey?;
    private spaceKey?;
    constructor();
    /**
     * Receive game scene key from caller.
     * Accepts currentLevelKey or gameSceneKey (callers may use either).
     * Fallback: LevelManager.getFirstLevelScene() for robustness.
     */
    init(data?: {
        currentLevelKey?: string;
        gameSceneKey?: string;
    }): void;
    create(): void;
    /**
     * TODO: Customize the game over screen appearance
     * Keep the overall structure but modify:
     * - Colors and styles (typically red/dark theme)
     * - Animations
     * - Text content
     */
    createDOMUI(): void;
    /**
     * Standard input setup - pointer always works; keyboard if available
     */
    setupInputs(): void;
    /**
     * Restart current level - robust against missing/invalid scene key.
     * Stops BGM (backgroundMusic or bgm) before restart.
     */
    restartGame(): void;
    /** Stop BGM (supports both backgroundMusic and bgm property names) */
    private stopBgmAndCleanup;
    /** Fallback when no valid level to restart - go to TitleScreen or first level */
    private safeReturnToTitleOrFirstLevel;
    update(): void;
}
