/**
 * ============================================================================
 * BASE CHAPTER SCENE - Foundation for narrative/dialogue-driven scenes
 * ============================================================================
 *
 * This is the MOST IMPORTANT base class in the ui_heavy module.
 * It provides the complete lifecycle for dialogue-driven game chapters:
 * visual novels, galgames, interactive fiction, tutorial sequences, etc.
 *
 * ARCHITECTURE: State Machine + Protected Hooks with Default Implementations
 *
 *   The base class owns the DIALOGUE STATE MACHINE (entry processing, advance,
 *   choice resolution, branching). All UI RENDERING is done through PROTECTED
 *   methods that have sensible defaults but can be fully overridden.
 *
 * LIFECYCLE (Template Method Pattern):
 *   create() calls in order:
 *     1. createBackground()         -- HOOK: set scene background
 *     2. createCharacters()         -- HOOK: register characters
 *     3. createDialogueUI()         -- HOOK (has default): create dialogue display
 *     4. createUI()                 -- HOOK: add scene-specific UI elements
 *     5. setupDefaultInputs()       -- HOOK (has default): click/Enter/Space
 *     6. setupInputs()              -- HOOK: bind custom key/click handlers
 *     7. playBackgroundMusic()      -- uses getBackgroundMusicKey() hook
 *     8. initializeScene()          -- HOOK: final setup before dialogue
 *     9. initializeDialogues()      -- HOOK (REQUIRED): define dialogue content
 *    10. startDialogue()            -- begins dialogue playback
 *
 * HOOKS WITH DEFAULTS (override to customize or replace):
 *   - createDialogueUI(): Creates DialogueBox + ChoicePanel. Override to use
 *     different UI components or skip entirely.
 *   - setupDefaultInputs(): Binds click/Enter/Space to advance. Override to
 *     change input scheme.
 *   - showDialogueText(speaker, text, expression): Displays text using
 *     DialogueBox. Override for speech bubbles, custom text displays, etc.
 *   - showChoiceUI(prompt, options): Shows choices via ChoicePanel. Override
 *     for custom choice presentation.
 *   - handleCharacterEnter(id, config, position): Creates CharacterPortrait
 *     and animates entry. Override for custom character display.
 *   - handleCharacterExit(id): Animates portrait exit. Override to customize.
 *   - getDialogueBoxConfig(): Returns DialogueBox config. Override to restyle.
 *
 * PURE HOOKS (no default, override as needed):
 *   - initializeDialogues(): REQUIRED, define dialogue content
 *   - createBackground(): Set scene background
 *   - createCharacters(): Register character configs
 *   - createUI(): Additional UI elements
 *   - setupInputs(): Additional input bindings
 *   - initializeScene(): Final setup
 *   - getBackgroundMusicKey(): Audio key
 *   - onDialogueEvent(action, data): React to events
 *   - onChoiceMade(choiceId, option): React to choices
 *   - onCharacterEnter(id, position): Called AFTER character enter
 *   - onCharacterExit(id): Called AFTER character exit
 *   - onChapterComplete(): All dialogues finished
 *   - onUpdate(time, delta): Per-frame logic
 *
 * Usage:
 *   export class Chapter1Scene extends BaseChapterScene {
 *     constructor() { super({ key: 'Chapter1Scene' }); }
 *
 *     protected initializeDialogues(): DialogueEntry[] {
 *       return [
 *         { type: 'text', speaker: 'narrator', text: 'Once upon a time...' },
 *         { type: 'character', action: 'enter', characterId: 'hero', position: 'left' },
 *         { type: 'text', speaker: 'hero', text: 'Where am I?' },
 *         { type: 'choice', id: 'first_choice', prompt: 'What do you do?', options: [
 *           { text: 'Look around', effects: { curiosity: +1 } },
 *           { text: 'Call for help', effects: { courage: -1 } },
 *         ]},
 *       ];
 *     }
 *   }
 *
 * SAFETY NOTES:
 *   - All type/interface imports MUST use the "type" keyword:
 *       import { type DialogueEntry } from './BaseChapterScene';
 *   - Config access: import directly from gameConfig.json:
 *       import gameConfig from '../gameConfig.json';
 *       const dialogueConfig = gameConfig.dialogueConfig ?? {};
 *       dialogueConfig.textSpeed.value  // use .value accessor
 *   - Scene cleanup: use this.events.once('shutdown', cb), NOT override shutdown()
 *   - Scene keys in scene.start('KEY') MUST match main.ts registration
 */
import Phaser from 'phaser';
import { DialogueBox, type DialogueBoxConfig } from '../ui/DialogueBox';
import { CharacterPortrait } from '../ui/CharacterPortrait';
import { ChoicePanel, type ChoiceDisplayOption } from '../ui/ChoicePanel';
/** A single dialogue entry in the sequence */
export interface DialogueEntry {
    /** Entry type */
    type: 'text' | 'choice' | 'event' | 'character' | 'branch' | 'wait';
    /** Speaker name (or 'narrator' for narration) */
    speaker?: string;
    /** Dialogue text content */
    text?: string;
    /** Speaker expression key (e.g., 'happy', 'angry') */
    expression?: string;
    /** Unique choice identifier */
    id?: string;
    /** Choice prompt text */
    prompt?: string;
    /** Available options */
    options?: ChoiceOption[];
    /** Event action name */
    action?: string;
    /** Event payload data */
    data?: Record<string, any>;
    /** Character ID for enter/exit/expression changes */
    characterId?: string;
    /** Screen position: 'left', 'center', 'right' */
    position?: 'left' | 'center' | 'right';
    /** Condition function to evaluate which branch to take */
    condition?: () => boolean;
    /** Dialogues if condition is true */
    trueBranch?: DialogueEntry[];
    /** Dialogues if condition is false */
    falseBranch?: DialogueEntry[];
    /** Duration in ms */
    duration?: number;
}
/** A single choice option */
export interface ChoiceOption {
    /** Display text */
    text: string;
    /** Jump label or next dialogue index */
    next?: string;
    /** Side effects to apply on selection */
    effects?: Record<string, number>;
    /** Condition for this option to be visible */
    condition?: () => boolean;
}
/** Character display configuration */
export interface ChapterCharacterConfig {
    /** Character unique ID */
    id: string;
    /** Default texture key */
    textureKey: string;
    /** Display name shown in dialogue box */
    displayName: string;
    /** Available expression texture keys */
    expressions?: Record<string, string>;
    /** Default screen position */
    defaultPosition?: 'left' | 'center' | 'right';
}
export declare abstract class BaseChapterScene extends Phaser.Scene {
    protected dialogues: DialogueEntry[];
    protected currentDialogueIndex: number;
    protected isDialoguePlaying: boolean;
    protected isWaitingForInput: boolean;
    protected isChoiceActive: boolean;
    /** Guard: true while a delayed auto-advance is pending (character/wait entries). */
    private isAutoAdvancing;
    protected characters: Map<string, ChapterCharacterConfig>;
    protected activeCharacters: Map<string, CharacterPortrait>;
    protected dialogueBox?: DialogueBox;
    protected choicePanel?: ChoicePanel;
    protected backgroundMusic?: Phaser.Sound.BaseSound;
    create(): void;
    update(time: number, delta: number): void;
    /**
     * HOOK (REQUIRED): Define the dialogue content for this chapter.
     * Return an array of DialogueEntry objects that define the scene flow.
     */
    protected abstract initializeDialogues(): DialogueEntry[];
    /**
     * HOOK (has default): Create the dialogue UI components.
     *
     * DEFAULT: Creates a DialogueBox at the bottom of the screen and a
     * ChoicePanel at the center. Override this entirely to use different
     * UI components (e.g., speech bubbles, custom panels) or skip dialogue UI.
     *
     * If you override this, also override showDialogueText() and showChoiceUI()
     * to use your custom components.
     */
    protected createDialogueUI(): void;
    /**
     * HOOK (has default): Set up default input bindings for dialogue advancement.
     *
     * DEFAULT: Click, Enter, and Space advance dialogue / complete typewriter.
     * Override to change the input scheme (e.g., swipe, custom keys).
     */
    protected setupDefaultInputs(): void;
    /**
     * HOOK (has default): Display a dialogue text entry.
     *
     * DEFAULT: Uses this.dialogueBox to show text with typewriter effect,
     * highlights the speaking character, dims others.
     * Override to display text differently (speech bubbles, subtitle bar, etc.)
     *
     * @param speaker - Speaker name or 'narrator'
     * @param text - Text content to display
     * @param expression - Optional expression key for the speaker
     */
    protected showDialogueText(speaker: string, text: string, expression?: string): void;
    /**
     * HOOK (has default): Display choice buttons for the player.
     *
     * DEFAULT: Uses this.choicePanel to show clickable buttons with prompt.
     * Override to display choices differently (radial menu, cards, etc.)
     *
     * When overriding, call this.resolveChoice(index) when the player selects.
     *
     * @param prompt - Choice prompt text
     * @param options - Available options (already filtered for visibility)
     */
    protected showChoiceUI(prompt: string, options: ChoiceDisplayOption[]): void;
    /**
     * HOOK (has default): Handle a character entering the scene visually.
     *
     * DEFAULT: Creates a CharacterPortrait from the registered config,
     * animates it sliding in, and stores it in activeCharacters.
     * Override to display characters differently (sprites, 3D models, etc.)
     *
     * @param characterId - The character's registered ID
     * @param config - The character's registered config
     * @param position - Screen position for the character
     */
    protected handleCharacterEnter(characterId: string, config: ChapterCharacterConfig, position: 'left' | 'center' | 'right'): void;
    /**
     * HOOK (has default): Handle a character exiting the scene visually.
     *
     * DEFAULT: Animates the CharacterPortrait sliding out and removes it.
     * Override for custom exit animations.
     *
     * @param characterId - The character's registered ID
     */
    protected handleCharacterExit(characterId: string): void;
    /**
     * HOOK (has default): Handle player input during dialogue (advance or complete).
     *
     * DEFAULT: Delegates to DialogueBox.handleInput() which either completes
     * the typewriter or emits 'advance'.
     * Override if you use a custom dialogue display component.
     */
    protected handleDialogueInput(): void;
    /**
     * HOOK (has default): Returns configuration for the default DialogueBox.
     * Override to change the dialogue box appearance without replacing the component.
     */
    protected getDialogueBoxConfig(): DialogueBoxConfig;
    /** HOOK: Create the scene background. */
    protected createBackground(): void;
    /** HOOK: Register characters via registerCharacter(). */
    protected createCharacters(): void;
    /** HOOK: Create scene-specific UI elements beyond the dialogue system. */
    protected createUI(): void;
    /** HOOK: Add custom key bindings beyond the default ones. */
    protected setupInputs(): void;
    /** HOOK: Called after all setup, before dialogue starts. */
    protected initializeScene(): void;
    /** HOOK: Return the audio key for background music. */
    protected getBackgroundMusicKey(): string | undefined;
    /**
     * HOOK: Return gameplay hint lines to display in the top-right corner.
     * Override to provide scene-specific hints. Return empty array to hide panel.
     */
    protected getGameplayHints(): string[];
    /** HOOK: Called when a special event is encountered in the dialogue. */
    protected onDialogueEvent(action: string, data?: Record<string, any>): void;
    /** HOOK: Called when the player selects a choice option. */
    protected onChoiceMade(choiceId: string, option: ChoiceOption): void;
    /**
     * HOOK: Called AFTER a character enters the scene (after visual setup).
     * Use for additional logic (sound effects, state changes, etc.)
     */
    protected onCharacterEnter(characterId: string, position?: string): void;
    /** HOOK: Called AFTER a character exits the scene. */
    protected onCharacterExit(characterId: string): void;
    /** HOOK: Called when all dialogues in this chapter are complete. */
    protected onChapterComplete(): void;
    /** HOOK: Called every frame. */
    protected onUpdate(time: number, delta: number): void;
    /** Register a character for use in dialogues. */
    protected registerCharacter(config: ChapterCharacterConfig): void;
    /** Start playing the dialogue sequence from the beginning or a specific index. */
    protected startDialogue(fromIndex?: number): void;
    /** Advance to the next dialogue entry. */
    protected advanceDialogue(): void;
    /** Change a character's expression. */
    protected setCharacterExpression(characterId: string, expression: string): void;
    /**
     * Resolve a player's choice selection. Call this from your custom choice UI.
     * Handles effects, notifies subclass via onChoiceMade, and advances dialogue.
     */
    protected resolveChoice(optionIndex: number): void;
    /** Show floating text (e.g., "+10 Points"). */
    protected showFloatingText(text: string, x: number, y: number, style?: any): void;
    /**
     * Create a semi-transparent gameplay hints panel in the top-right corner.
     * Uses getGameplayHints() hook for content.
     */
    private createHelpPanel;
    /** Process the current dialogue entry based on its type. */
    private processCurrentEntry;
    /** Play background music with fade-in. */
    private playBackgroundMusic;
}
