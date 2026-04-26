import Phaser from 'phaser';
/**
 * Title Screen Scene - Game start screen
 * This file is a STANDARD TEMPLATE
 *
 * TODO for AI: Customize the following:
 * 1. createDOMUI() - Modify the HTML/CSS to match game theme
 * 2. initializeSounds() - Change background music key to your game's music
 * 3. startGame() - Change UI click sound key if needed
 */
export declare class TitleScreen extends Phaser.Scene {
    uiContainer: Phaser.GameObjects.DOMElement;
    keydownHandler?: (event: KeyboardEvent) => void;
    clickHandler?: (event: Event) => void;
    backgroundMusic: Phaser.Sound.BaseSound;
    isStarting: boolean;
    constructor();
    init(): void;
    create(): void;
    /**
     * Create the title screen background using a Phaser image.
     * Shows the background art with a semi-transparent dark overlay for text contrast.
     * Falls back to a solid dark color if the texture is not available.
     * TODO: Change 'title_bg' to your actual background asset key.
     */
    createBackground(): void;
    /**
     * TODO: Customize this method to match your game's visual theme
     * - Change background image/color
     * - Change game title image or text
     * - Modify animations and styles
     */
    createDOMUI(): void;
    /**
     * Standard input setup - DO NOT MODIFY
     */
    setupInputs(): void;
    /**
     * TODO: Change the music key to your game's title screen music
     */
    initializeSounds(): void;
    playBackgroundMusic(): void;
    /**
     * Standard game start logic - DO NOT MODIFY structure
     * TODO: Change "ui_click" to your actual UI click sound key
     */
    startGame(): void;
    /**
     * Standard cleanup - DO NOT MODIFY
     */
    cleanupEventListeners(): void;
    update(): void;
}
