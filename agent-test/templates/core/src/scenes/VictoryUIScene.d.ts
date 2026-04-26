import Phaser from 'phaser';
/**
 * Victory UI Scene - Level Complete Screen
 * This file is a STANDARD TEMPLATE
 *
 * Displayed when player completes a level (but not the final level)
 * Transitions to next level on Enter/Space/Click
 *
 * TODO for AI: Customize createDOMUI() to match game theme
 */
export declare class VictoryUIScene extends Phaser.Scene {
    private currentLevelKey;
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
     * TODO: Customize the victory screen appearance
     * Keep the overall structure but modify:
     * - Colors and styles
     * - Animations
     * - Text content
     */
    createDOMUI(): void;
    /**
     * Standard input setup - DO NOT MODIFY
     */
    setupInputs(): void;
    /**
     * Transition to next level - DO NOT MODIFY structure
     */
    goToNextLevel(): void;
    update(): void;
}
