import Phaser from 'phaser';
/**
 * Pause UI Scene - STANDARD TEMPLATE
 *
 * Displays when game is paused (ESC key or pause button).
 * Provides options to resume game or return to menu.
 *
 * Features:
 * - Semi-transparent overlay
 * - Resume game button
 * - Back to menu button
 * - Keyboard shortcuts (ESC/Space/Enter to resume)
 */
export declare class PauseUIScene extends Phaser.Scene {
    private currentLevelKey;
    private uiContainer;
    constructor();
    init(data: {
        currentLevelKey?: string;
    }): void;
    create(): void;
    /**
     * Create the pause menu UI using DOM elements
     */
    private createPauseUI;
    /**
     * Set up keyboard inputs for pause menu
     */
    private setupInputs;
    /**
     * Resume the game
     */
    private resumeGame;
    /**
     * Return to main menu
     */
    private backToMenu;
}
