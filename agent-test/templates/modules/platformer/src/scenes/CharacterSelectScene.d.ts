import Phaser from 'phaser';
/**
 * Character data interface for selection screen
 */
export interface CharacterData {
    /** Display name shown on screen */
    name: string;
    /** Texture key for character preview image */
    previewKey: string;
    /** Description text (supports \n for line breaks) */
    description: string;
    /** Player class identifier - stored in registry for dynamic loading */
    playerClass: string;
}
/**
 * CharacterSelectScene - Character selection screen
 *
 * This scene allows players to choose their character before starting the game.
 * The selected character is stored in the Phaser registry for later retrieval.
 *
 * USAGE:
 *   1. Define your characters in the CHARACTERS array
 *   2. Register this scene in main.ts
 *   3. Navigate here from TitleScreen (or directly start here)
 *   4. In BaseLevelScene.createPlayer(), use registry.get('selectedCharacter')
 *
 * REGISTRY KEY: 'selectedCharacter' - contains the playerClass string
 *
 * CUSTOMIZATION HOOKS:
 *   - Override getCharacters() to define available characters
 *   - Override createCustomUI() to add game-specific UI elements
 *   - Override onCharacterSelected(character) for custom selection effects
 */
export declare class CharacterSelectScene extends Phaser.Scene {
    /** Currently selected character index */
    protected selectedCharacterIndex: number;
    /** Prevents double-selection during transition */
    protected isSelecting: boolean;
    /** Character data array - populated from getCharacters() */
    protected characters: CharacterData[];
    /** Character preview sprites */
    protected characterSprites: Phaser.GameObjects.Image[];
    /** Character name text objects */
    protected characterNames: Phaser.GameObjects.Text[];
    /** Character description text objects */
    protected characterDescriptions: Phaser.GameObjects.Text[];
    /** Selection highlight frames */
    protected selectionFrames: Phaser.GameObjects.Graphics[];
    /** Default border graphics */
    protected characterBorders: Phaser.GameObjects.Graphics[];
    /** Interactive zones for mouse input */
    protected characterZones: Phaser.GameObjects.Zone[];
    /** Title text */
    protected titleText?: Phaser.GameObjects.Text;
    /** Control hints text */
    protected controlsText?: Phaser.GameObjects.Text;
    protected cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    protected aKey: Phaser.Input.Keyboard.Key;
    protected dKey: Phaser.Input.Keyboard.Key;
    protected enterKey: Phaser.Input.Keyboard.Key;
    protected spaceKey: Phaser.Input.Keyboard.Key;
    protected backgroundMusic?: Phaser.Sound.BaseSound;
    constructor();
    init(): void;
    create(): void;
    /**
     * HOOK: Define the characters available for selection
     * Override this method to customize available characters
     *
     * @returns Array of character data
     */
    protected getCharacters(): CharacterData[];
    /**
     * HOOK: Add custom UI elements
     * Override this to add game-specific decorations
     */
    protected createCustomUI(): void;
    /**
     * HOOK: Called when a character is selected
     * Override to add custom selection effects
     * @param character - The selected character data
     */
    protected onCharacterSelected(character: CharacterData): void;
    protected cleanupUIScenes(): void;
    protected createBackground(): void;
    protected createTitle(): void;
    protected createCharacterDisplay(): void;
    protected createControlHints(): void;
    protected setupInputs(): void;
    protected playBackgroundMusic(): void;
    protected playSelectSound(): void;
    protected playConfirmSound(): void;
    protected updateSelection(): void;
    protected showHoverEffect(index: number): void;
    protected hideHoverEffect(index: number): void;
    protected confirmSelection(): void;
    update(): void;
}
