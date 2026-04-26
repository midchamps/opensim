/**
 * ============================================================================
 * DIALOGUE BOX - Text display with typewriter effect
 * ============================================================================
 *
 * A Phaser Container that displays dialogue text with:
 * - Typewriter (character-by-character) text reveal
 * - Speaker name label
 * - Background panel (solid color rectangle)
 * - Click/Enter to complete or advance
 * - Configurable text speed, font, colors
 *
 * EVENTS:
 *   - 'typeComplete': () => void  -- typewriter finished current text
 *   - 'advance': () => void       -- player clicked to advance
 *   - 'skip': () => void          -- player skipped typewriter
 *
 * USAGE:
 *   const box = new DialogueBox(scene, { x: 512, y: 650, width: 900, height: 150 });
 *   box.showText('Alaric', 'Hello there!');
 *   box.on('typeComplete', () => { ... });
 *   // On click: box.handleInput();  // completes or advances
 */
import Phaser from 'phaser';
export interface DialogueBoxConfig {
    /** X position (center) */
    x: number;
    /** Y position (center) */
    y: number;
    /** Box width */
    width: number;
    /** Box height */
    height: number;
    /** Background texture key (optional, uses solid color if not set) */
    backgroundKey?: string;
    /** Background color (hex, default: 0x000000) */
    backgroundColor?: number;
    /** Background alpha (default: 0.8) */
    backgroundAlpha?: number;
    /** Text style overrides */
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    /** Speaker name style overrides */
    nameStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    /** Typewriter speed in ms per character (default: 30) */
    typeSpeed?: number;
    /** Padding inside the box */
    padding?: number;
}
export declare class DialogueBox extends Phaser.GameObjects.Container {
    private boxConfig;
    private background;
    private nameText;
    private bodyText;
    private continueIndicator;
    private typeTimer?;
    private fullText;
    private currentCharIndex;
    private isTyping;
    constructor(scene: Phaser.Scene, config: DialogueBoxConfig);
    /** Show text with typewriter effect. */
    showText(speaker: string, text: string): void;
    /** Handle player input (complete typewriter or signal advance). */
    handleInput(): void;
    /** Complete typewriter immediately (show full text). */
    completeTypewriter(): void;
    /** Show/hide the dialogue box. */
    setBoxVisible(visible: boolean): void;
    /** Check if typewriter is currently animating. */
    getIsTyping(): boolean;
    private createElements;
    private startTypewriter;
}
