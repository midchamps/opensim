/**
 * ============================================================================
 * CHOICE PANEL - Branching choice buttons display
 * ============================================================================
 *
 * Displays a set of choice buttons for player decision points.
 * Used by both dialogue choices (BaseChapterScene) and quiz answers.
 *
 * FEATURES:
 * - Vertical button layout
 * - Hover highlight effects
 * - Entrance animations (fade)
 * - Keyboard navigation (Up/Down/Enter)
 * - Dynamic button count
 *
 * EVENTS:
 *   - 'selected': (optionIndex: number, optionText: string) => void
 *
 * USAGE:
 *   const panel = new ChoicePanel(scene, 512, 400);
 *   panel.showChoices('What do you do?', [
 *     { text: 'Fight', enabled: true },
 *     { text: 'Run', enabled: true },
 *   ]);
 *   panel.on('selected', (index, text) => { ... });
 */
import Phaser from 'phaser';
export interface ChoiceDisplayOption {
    /** Button text */
    text: string;
    /** Whether this option is clickable (default: true) */
    enabled?: boolean;
    /** Optional icon key */
    iconKey?: string;
}
export interface ChoicePanelConfig {
    /** Layout direction */
    layout?: 'vertical' | 'horizontal';
    /** Space between buttons (px) */
    spacing?: number;
    /** Button width */
    buttonWidth?: number;
    /** Button height */
    buttonHeight?: number;
    /** Button background color */
    buttonColor?: number;
    /** Button hover color */
    buttonHoverColor?: number;
    /** Text style */
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    /** Enable keyboard navigation (default: true) */
    keyboardNav?: boolean;
}
export declare class ChoicePanel extends Phaser.GameObjects.Container {
    private panelConfig;
    private buttons;
    private currentOptions;
    private selectedIndex;
    private promptText?;
    private upKey?;
    private downKey?;
    private enterKey?;
    constructor(scene: Phaser.Scene, x: number, y: number, config?: ChoicePanelConfig);
    /** Show choice buttons with optional prompt text. */
    showChoices(prompt: string, options: ChoiceDisplayOption[]): void;
    /** Hide and remove all buttons. */
    hide(): void;
    /** Programmatically select an option (for keyboard navigation). */
    selectByIndex(index: number): void;
    private clearButtons;
    private createButton;
    private highlightButton;
    private setupKeyboardNav;
}
