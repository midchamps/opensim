/**
 * ============================================================================
 * BASE CHARACTER SELECT SCENE - Player character/avatar selection
 * ============================================================================
 *
 * Displays a grid of selectable characters/avatars/personas.
 * Designed for UI-heavy games: card battlers (choose deck master),
 * visual novels (choose protagonist), quiz battles (choose avatar), etc.
 *
 * Stores the selected character data in Phaser registry for retrieval
 * by subsequent scenes.
 *
 * LIFECYCLE (Template Method Pattern):
 *   create() calls in order:
 *     1. createBackground()           -- HOOK: set background
 *     2. createTitle()                -- HOOK: display title text
 *     3. getSelectableCharacters()    -- HOOK (REQUIRED): define characters
 *     4. createCharacterGrid()        -- builds interactive character cards
 *     5. createControlHints()         -- HOOK: display control hints
 *     6. createCustomUI()             -- HOOK: add extra UI elements
 *     7. setupInputs()                -- keyboard/mouse bindings
 *     8. playBackgroundMusic()        -- uses getBackgroundMusicKey()
 *
 * HOOK METHODS:
 *   - getSelectableCharacters(): Return array of character configs (REQUIRED)
 *   - createBackground(): Custom background
 *   - createTitle(): Custom title display
 *   - createControlHints(): Custom control hints
 *   - createCustomUI(): Add extra UI elements (decorations, etc.)
 *   - onSelectionChanged(character, index): Highlight changed
 *   - onCharacterSelected(character): Character confirmed
 *   - shouldAutoTransition(): Return false for PVP sequential pick mode
 *   - triggerTransition(): Call manually after all picks in PVP mode
 *   - getNextSceneKey(): Scene to transition to after selection
 *   - getBackgroundMusicKey(): Audio key for background music
 *   - getGridConfig(): Customize grid layout (columns, card size, spacing)
 *   - createCharacterCard(container, character, cardW, cardH): Custom card rendering
 *   - playSelectSound(): SFX when highlight changes
 *   - playConfirmSound(): SFX when character is confirmed
 *
 * REGISTRY: 'selectedCharacter' stores the full SelectableCharacter object.
 *   Retrieve in other scenes: this.registry.get('selectedCharacter')
 *
 * PVP SEQUENTIAL PICK PATTERN:
 *   For games where two players each pick a character:
 *   1. Override shouldAutoTransition() to return false.
 *   2. Track whose turn it is (P1 or P2) in your subclass.
 *   3. In onCharacterSelected():
 *      - P1 turn: store P1 choice (registry.set('p1Character', char)),
 *        call this.resetForNextPick(index) to gray out P1's card,
 *        update titleText ("Player 2, choose!").
 *      - P2 turn: store P2 choice, call this.triggerTransition().
 *
 * PROTECTED PROPERTIES (available to subclasses):
 *   - this.characters: SelectableCharacter[]       -- character data
 *   - this.selectedIndex: number                   -- current highlight index
 *   - this.isConfirming: boolean                   -- lock during transition
 *   - this.titleText: Phaser.GameObjects.Text      -- title (update for PVP)
 *   - this.cardContainers: Container[]             -- per-card containers
 *   - this.cardBackgrounds: Rectangle[]            -- per-card backgrounds
 *   - this.disabledIndices: Set<number>            -- cards disabled for PVP
 *
 * Usage:
 *   export class HeroSelectScene extends BaseCharacterSelectScene {
 *     constructor() { super({ key: 'HeroSelectScene' }); }
 *
 *     protected getSelectableCharacters(): SelectableCharacter[] {
 *       return [
 *         { id: 'mage', name: 'Dark Mage', description: 'Master of arcane spells',
 *           imageKey: 'mage_portrait', stats: { hp: 80, atk: 25, def: 10 } },
 *         { id: 'knight', name: 'Holy Knight', description: 'Armored defender',
 *           imageKey: 'knight_portrait', stats: { hp: 120, atk: 15, def: 25 } },
 *       ];
 *     }
 *
 *     protected getNextSceneKey(): string {
 *       return 'Chapter1Scene';
 *     }
 *   }
 */
import Phaser from 'phaser';
/** Character data for the selection screen */
export interface SelectableCharacter {
    /** Unique character identifier */
    id: string;
    /** Display name */
    name: string;
    /** Description text */
    description?: string;
    /** Preview image texture key */
    imageKey?: string;
    /** Character stats for display (e.g., { hp: 100, atk: 15, def: 10 }) */
    stats?: Record<string, number>;
    /** Extra metadata the game scene can read later */
    metadata?: Record<string, any>;
}
/** Grid layout configuration */
export interface GridConfig {
    /** Max columns in the grid (default: 4) */
    maxColumns: number;
    /** Card width in pixels (default: 180) */
    cardWidth: number;
    /** Card height in pixels (default: 240) */
    cardHeight: number;
    /** Horizontal gap between cards (default: 20) */
    gapX: number;
    /** Vertical gap between cards (default: 20) */
    gapY: number;
}
export declare class BaseCharacterSelectScene extends Phaser.Scene {
    protected characters: SelectableCharacter[];
    protected selectedIndex: number;
    protected isConfirming: boolean;
    /** Indices of disabled cards (PVP: already-picked characters). */
    protected disabledIndices: Set<number>;
    protected titleText?: Phaser.GameObjects.Text;
    protected cardContainers: Phaser.GameObjects.Container[];
    protected cardBackgrounds: Phaser.GameObjects.Rectangle[];
    private highlightGraphics?;
    private scrollOffset;
    private gridConfig;
    protected backgroundMusic?: Phaser.Sound.BaseSound;
    constructor(config?: Phaser.Types.Scenes.SettingsConfig);
    create(): void;
    update(time: number, delta: number): void;
    /**
     * HOOK (REQUIRED): Define the characters available for selection.
     * Override in subclass to return your game's characters.
     */
    protected getSelectableCharacters(): SelectableCharacter[];
    /** HOOK: Create the scene background. Default: dark solid background. */
    protected createBackground(): void;
    /**
     * HOOK: Create the title text. Default: centered title at top.
     * The created text is stored in this.titleText for PVP title updates.
     * If you override, remember to assign this.titleText = yourText.
     */
    protected createTitle(): void;
    /** HOOK: Create control hints text. Default: bottom-center instructions. */
    protected createControlHints(): void;
    /** HOOK: Add custom UI elements (decorations, panels, etc.). */
    protected createCustomUI(): void;
    /**
     * HOOK: Return grid layout configuration.
     * Override to change card sizes and grid layout.
     */
    protected getGridConfig(): GridConfig;
    /**
     * HOOK: Create a single character card's visual content.
     *
     * DEFAULT: Creates image + name + description + stats inside the container.
     * Override to fully customize card appearance.
     *
     * @param container - The card container to add children to
     * @param character - Character data
     * @param cardW - Card width
     * @param cardH - Card height
     */
    protected createCharacterCard(container: Phaser.GameObjects.Container, character: SelectableCharacter, cardW: number, cardH: number): void;
    /**
     * HOOK: Called when the keyboard/mouse highlight changes to a different character.
     * Use for sound effects, description panel updates, etc.
     */
    protected onSelectionChanged(character: SelectableCharacter, index: number): void;
    /**
     * HOOK: Called when a character is confirmed.
     * Default: store in registry and transition to next scene.
     * Override for custom post-selection logic (e.g., team building, animation).
     */
    protected onCharacterSelected(character: SelectableCharacter): void;
    /**
     * HOOK: Return the scene key to transition to after character selection.
     * Default: 'ChapterSelectScene' (go to chapter/level select).
     */
    protected getNextSceneKey(): string;
    /** HOOK: Return audio key for background music. */
    protected getBackgroundMusicKey(): string | undefined;
    /** HOOK: Play SFX when highlight moves to a different character. */
    protected playSelectSound(): void;
    /** HOOK: Play SFX when a character is confirmed. */
    protected playConfirmSound(): void;
    /** HOOK: Per-frame logic. */
    protected onUpdate(time: number, delta: number): void;
    private buildCharacterGrid;
    /**
     * Update the visual highlight to reflect the current selectedIndex.
     * Protected so PVP subclasses can call after resetting selectedIndex.
     */
    protected updateHighlight(): void;
    private confirmSelection;
    /**
     * HOOK: Whether to auto-transition to next scene after a character is selected.
     *
     * Default: true (immediately transition after one selection).
     * Override to return false for PVP games where both players pick sequentially.
     * When returning false, call this.triggerTransition() manually when all
     * players have made their selections.
     */
    protected shouldAutoTransition(): boolean;
    /**
     * Trigger the scene fade-out and transition to the next scene.
     * Call this manually if shouldAutoTransition() returns false.
     */
    protected triggerTransition(): void;
    /**
     * PVP HELPER: Reset the selection state for the next player's pick.
     * Disables the card at disableIndex (grayed out, non-interactive),
     * resets selectedIndex to the first non-disabled card, and updates highlight.
     *
     * Call this from onCharacterSelected() in PVP sequential pick mode.
     *
     * @param disableIndex - Index of the card to disable (the just-picked card).
     *   Pass undefined to skip disabling (e.g., if same character can be picked twice).
     */
    protected resetForNextPick(disableIndex?: number): void;
    private setupInputs;
    private playBackgroundMusic;
}
