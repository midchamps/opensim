import Phaser from 'phaser';
/**
 * Game Complete UI Scene - All Levels Completed Screen
 * This file is a STANDARD TEMPLATE
 *
 * Displayed when player completes the final level
 * Returns to title screen on Enter/Space/Click
 *
 * TODO for AI: Customize createDOMUI() to match game theme
 */
export declare class GameCompleteUIScene extends Phaser.Scene {
    private currentLevelKey;
    private isTransitioning;
    private uiContainer;
    private enterKey?;
    private spaceKey?;
    constructor();
    /**
     * Receive current level key from game scene
     */
    init(data: {
        currentLevelKey?: string;
    }): void;
    create(): void;
    /**
     * TODO: Customize the game complete screen appearance
     * This is the celebration screen for completing the entire game!
     * Keep the overall structure but modify:
     * - Colors and styles (typically celebratory/golden theme)
     * - Animations (more elaborate than regular victory)
     * - Text content
     */
    createDOMUI(): void;
    /**
     * Standard input setup - DO NOT MODIFY
     */
    setupInputs(): void;
    /**
     * Return to title screen - DO NOT MODIFY structure
     */
    returnToMenu(): void;
    update(): void;
}
