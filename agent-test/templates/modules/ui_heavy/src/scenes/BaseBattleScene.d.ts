/**
 * ============================================================================
 * BASE BATTLE SCENE - Foundation for turn-based combat & quiz scenes
 * ============================================================================
 *
 * Provides the complete lifecycle for turn-based battle games:
 * card battlers, quiz battles, educational games, auto-battlers, etc.
 *
 * TURN CYCLE (State Machine):
 *   INTRO -> PLAYER_TURN -> [QUIZ_PHASE] -> FEEDBACK_PHASE ->
 *   ACTION_PHASE -> ENEMY_TURN -> CHECK_END -> (loop or END)
 *
 * ARCHITECTURE: State Machine + Protected Hooks with Default Implementations
 *
 *   The base class owns the TURN STATE MACHINE (phase transitions, win/loss
 *   checks, combo tracking). All UI and game-specific logic is done through
 *   PROTECTED methods that can be fully overridden.
 *
 * HOOKS WITH DEFAULTS (override to customize or replace):
 *   - prepareHand(): Discard all, draw fresh. Override for keep-hand games.
 *   - executeEnemyTurn(): Auto-attack after delay. Override for interactive
 *     enemy turns (e.g., defense quiz). Must call completeEnemyTurn().
 *   - resolveCardAction(card, success): Apply card effects. Override for
 *     custom card types or damage formulas.
 *   - showFloatingText(): Popup text utility.
 *
 * DEFAULT BEHAVIOR (provided by base class):
 *   - prepareHand() discards old hand, draws handSize cards at turn start
 *   - showFloatingText() for damage/status popups
 *   - Combo multiplier tracking
 *   - Deck management with auto-reshuffle
 *   - Phase state machine with hook dispatch
 *
 * HOOK METHODS (override in subclass):
 *   -- Setup --
 *   - initializeBattle(): Set up battle state (REQUIRED)
 *   - createBackground(): Set scene background
 *   - createCombatants(): Create player/enemy visual displays
 *   - createHUD(): Create health bars, combo display
 *   - createHandArea(): Set up the card hand UI region
 *   - setupInputs(): Custom key bindings
 *   - getBackgroundMusicKey(): Return music audio key
 *
 *   -- Turn Flow --
 *   - onBattleStart(): Called when battle begins
 *   - onTurnStart(turnNumber): New turn begins
 *   - onPlayerTurnStart(): Player's turn to act
 *   - onCardSelected(card): Player chose a card
 *   - onQuizPresented(question): Quiz modal shown
 *   - onQuizAnswered(correct, question, answer): Quiz result
 *   - onFeedbackShown(question, correct): Educational feedback displayed
 *   - onActionExecuted(card, damage, combo): Card effect applied
 *   - onEnemyTurnStart(): Enemy's turn
 *   - onEnemyAction(): Define enemy AI behavior (REQUIRED for battles)
 *   - onTurnEnd(turnNumber): Turn completed
 *   - onBattleEnd(victory): Battle concluded
 *
 *   -- Combat Events --
 *   - onPlayerDamaged(damage): Player took damage
 *   - onEnemyDamaged(damage): Enemy took damage
 *   - onComboChanged(newCombo, multiplier): Combo streak changed
 *   - onPlayerDefeated(): Player HP reached 0
 *   - onEnemyDefeated(): Enemy HP reached 0
 *
 *   -- Config --
 *   - getCardDeck(): Define available cards
 *   - getQuestionBank(): Define quiz questions (or load from JSON)
 *   - getEnemyConfig(): Define enemy stats and behavior
 *
 * Usage:
 *   export class DuelScene extends BaseBattleScene {
 *     constructor() { super({ key: 'DuelScene' }); }
 *
 *     protected initializeBattle(): void {
 *       this.playerHP = 100;
 *       this.enemyHP = 80;
 *     }
 *
 *     protected getCardDeck(): CardConfig[] {
 *       return [
 *         { id: 'fireball', name: 'Fireball', type: 'attack', value: 25 },
 *         { id: 'shield', name: 'Shield', type: 'defend', value: 15 },
 *         { id: 'heal', name: 'Heal', type: 'heal', value: 20 },
 *       ];
 *     }
 *   }
 *
 * !! COMMON MISTAKES TO AVOID !!
 *
 *   1. CONFIG ACCESS:
 *      This class does NOT have a "this.gameConfig" property.
 *      To read gameConfig.json, import it directly at the top of YOUR file:
 *        import gameConfig from '../gameConfig.json';
 *        const battleConfig = gameConfig.battleConfig ?? {};
 *      Then access via .value:  battleConfig.playerMaxHP.value  (use .value accessor)
 *      NEVER write:             this.gameConfig.getValue('...')  <-- DOES NOT EXIST
 *
 *   2. FLOATING TEXT:
 *      FloatingText is a STATIC utility. Use the inherited helper:
 *        this.showFloatingText('text', x, y, { color: '#ff0000' });
 *      NEVER write:  new FloatingText(...)  <-- NOT a constructor
 *
 *   3. TWEEN PRESETS:
 *      TweenPresets exports individual functions, NOT a class:
 *        import { fadeIn, shake } from '../ui/TweenPresets';
 *      NEVER write:  import { TweenPresets } from '../ui/TweenPresets';
 *
 *   4. VISIBILITY RULES:
 *      When overriding base class methods, ALWAYS use "protected override".
 *      NEVER use "private" to shadow a base-class protected method.
 *      NEVER re-declare dealDamageToPlayer/dealDamageToEnemy as private.
 *
 *   5. SCENE CLEANUP:
 *      Phaser.Scene does NOT have an overridable shutdown() method.
 *      Use event listeners instead:
 *        this.events.once('shutdown', () => { cleanup code });
 *        this.events.once('destroy', () => { cleanup code });
 *
 *   6. TYPE IMPORTS:
 *      All interfaces/types MUST use the "type" keyword when imported:
 *        import { type CardConfig, type QuizQuestion } from './BaseBattleScene';
 *      This prevents runtime module resolution errors in Vite/esbuild.
 */
import Phaser from 'phaser';
import { type FloatingTextConfig } from '../ui/FloatingText';
/** Turn phase identifiers */
export type BattlePhase = 'INTRO' | 'PLAYER_TURN' | 'QUIZ_PHASE' | 'FEEDBACK_PHASE' | 'ACTION_PHASE' | 'ENEMY_TURN' | 'CHECK_END' | 'VICTORY' | 'DEFEAT';
/** Card type categories */
export type CardType = 'attack' | 'heavy_attack' | 'defend' | 'heal' | 'special';
/** Card configuration */
export interface CardConfig {
    /** Unique card identifier */
    id: string;
    /** Display name */
    name: string;
    /** Card type */
    type: CardType;
    /** Effect value (damage, heal amount, shield points) */
    value: number;
    /** Card description text */
    description?: string;
    /** Texture key for card art */
    textureKey?: string;
    /** Quiz subject tag (e.g., 'math', 'science') */
    quizSubject?: string;
    /** Cost to play (optional for resource systems) */
    cost?: number;
}
/** Quiz question format */
export interface QuizQuestion {
    /** Question text */
    question: string;
    /** Answer options */
    options: string[];
    /** Index of correct answer (0-based) */
    correctIndex: number;
    /** Educational explanation shown after answering */
    explanation: string;
    /** Difficulty (1-5) */
    difficulty?: number;
    /** Subject category */
    subject?: string;
}
/** Enemy configuration */
export interface EnemyBattleConfig {
    /** Display name */
    name: string;
    /** Max HP */
    maxHP: number;
    /** Texture key */
    textureKey: string;
    /** Damage range [min, max] */
    damageRange: [number, number];
    /** Available actions (for AI) */
    actions?: string[];
}
export declare abstract class BaseBattleScene extends Phaser.Scene {
    protected currentPhase: BattlePhase;
    protected turnNumber: number;
    protected isBattleActive: boolean;
    protected playerHP: number;
    protected playerMaxHP: number;
    protected enemyHP: number;
    protected enemyMaxHP: number;
    protected playerShield: number;
    protected comboStreak: number;
    protected comboMultiplier: number;
    protected deck: CardConfig[];
    protected hand: CardConfig[];
    protected discardPile: CardConfig[];
    protected handSize: number;
    protected questionBank: QuizQuestion[];
    protected selectedCard?: CardConfig;
    protected currentQuestion?: QuizQuestion;
    protected backgroundMusic?: Phaser.Sound.BaseSound;
    create(): void;
    update(time: number, delta: number): void;
    /** HOOK (REQUIRED): Initialize battle state. */
    protected abstract initializeBattle(): void;
    /** HOOK: Create the scene background. */
    protected createBackground(): void;
    /** HOOK: Create player and enemy visual displays. */
    protected createCombatants(): void;
    /** HOOK: Create the HUD (health bars, combo display). */
    protected createHUD(): void;
    /** HOOK: Create the card hand display area. */
    protected createHandArea(): void;
    /** HOOK: Set up custom input bindings. */
    protected setupInputs(): void;
    /** HOOK: Return the audio key for background music. */
    protected getBackgroundMusicKey(): string | undefined;
    /**
     * HOOK: Return gameplay hint lines to display in the top-right corner.
     * Override to provide game-specific hints explaining card effects, controls, etc.
     * Return an empty array to hide the help panel.
     *
     * Example:
     *   return [
     *     'Attack: Deal damage',
     *     'Defend: Add shield',
     *     'Heal: Restore HP',
     *     'Correct = Full effect',
     *     'Wrong = 30% effect',
     *   ];
     */
    protected getGameplayHints(): string[];
    /** HOOK: Called when battle begins (after intro). */
    protected onBattleStart(): void;
    /** HOOK: Called at the start of each turn. */
    protected onTurnStart(turnNumber: number): void;
    /**
     * HOOK: Player's turn begins. Cards are drawn and interactable.
     * Default implementation draws cards. Override to add custom behavior.
     */
    protected onPlayerTurnStart(): void;
    /** HOOK: A card was drawn from deck into hand. */
    protected onCardDrawn(card: CardConfig): void;
    /** HOOK: Quiz phase begins (after card selection). */
    protected onQuizPhaseStart(): void;
    /** HOOK: Resolve phase (apply card effect, then enemy turn). */
    protected onResolvePhase(): void;
    /** HOOK: Player selected a card from hand. */
    protected onCardSelected(card: CardConfig): void;
    /** HOOK: A quiz question is presented to the player. */
    protected onQuizPresented(question: QuizQuestion): void;
    /** HOOK: Player answered the quiz question. */
    protected onQuizAnswered(correct: boolean, question: QuizQuestion, selectedIndex: number): void;
    /** HOOK: Educational feedback is shown after quiz. */
    protected onFeedbackShown(question: QuizQuestion, correct: boolean): void;
    /** HOOK: The selected card's action is executed. */
    protected onActionExecuted(card: CardConfig, finalDamage: number, combo: number): void;
    /** HOOK: Enemy's turn begins (visual indicators, animations). */
    protected onEnemyTurnStart(): void;
    /**
     * HOOK (has default): Execute the full enemy turn sequence.
     *
     * DEFAULT: Waits 500ms, calls onEnemyAction(), then auto-progresses
     * to turn end via completeEnemyTurn().
     *
     * Override for enemy turns that require player interaction (e.g., a
     * defense quiz where the player must answer correctly to block damage).
     * When overriding, you MUST call completeEnemyTurn() when your custom
     * enemy turn logic finishes.
     */
    protected executeEnemyTurn(): void;
    /** HOOK: Define enemy AI behavior (called by default executeEnemyTurn). */
    protected onEnemyAction(): void;
    /** HOOK: Called at the end of each turn. */
    protected onTurnEnd(turnNumber: number): void;
    /** HOOK: Called when battle concludes. */
    protected onBattleEnd(victory: boolean): void;
    /** HOOK: Player took damage. */
    protected onPlayerDamaged(damage: number, remainingHP: number): void;
    /** HOOK: Enemy took damage. */
    protected onEnemyDamaged(damage: number, remainingHP: number): void;
    /** HOOK: Combo streak changed. */
    protected onComboChanged(newCombo: number, multiplier: number): void;
    /** HOOK: Player HP reached 0. */
    protected onPlayerDefeated(): void;
    /** HOOK: Enemy HP reached 0. */
    protected onEnemyDefeated(): void;
    /** HOOK: Define available cards for the deck. */
    protected getCardDeck(): CardConfig[];
    /** HOOK: Define quiz questions. */
    protected getQuestionBank(): QuizQuestion[];
    /** HOOK: Define enemy configuration. */
    protected getEnemyConfig(): EnemyBattleConfig | undefined;
    /** HOOK: Custom per-frame logic. */
    protected onUpdate(time: number, delta: number): void;
    /**
     * Create a semi-transparent gameplay hints panel in the top-right corner.
     * Uses getGameplayHints() hook for content. Subclasses override hints, not this.
     */
    private createHelpPanel;
    /**
     * Complete the enemy turn and progress to the next turn.
     * Call this after your custom enemy turn logic finishes
     * (e.g., after a defense quiz is answered).
     */
    protected completeEnemyTurn(): void;
    /**
     * Start the battle. Override startBattle() or useTurnCycle for custom flow.
     *
     * For PVP / buzzer-race games that do NOT use the turn cycle:
     *   protected override get useTurnCycle(): boolean { return false; }
     * Then drive your own round system (e.g., this.startNextRound()).
     */
    protected startBattle(): void;
    /**
     * Whether the base class should automatically run the turn-based phase cycle
     * (PLAYER_TURN → QUIZ → ENEMY_TURN → CHECK_END → loop).
     *
     * Override to `false` for real-time or round-based PVP games where you
     * manage the game flow yourself (e.g., buzzer race, simultaneous answer).
     *
     * Default: true (standard turn-based flow).
     */
    protected get useTurnCycle(): boolean;
    /** Begin a new turn cycle. */
    protected beginNewTurn(): void;
    /**
     * HOOK (has default): Prepare the player's hand for a new turn.
     *
     * DEFAULT: Discards entire hand to discard pile, then draws handSize cards.
     * Override for games that keep cards between turns, allow selective discard,
     * or have a different hand management system.
     */
    protected prepareHand(): void;
    /** Set the current battle phase and dispatch to phase hooks. */
    protected setPhase(phase: BattlePhase): void;
    /**
     * Handle a card being selected by the player.
     * This is the main entry point for the card->quiz->action flow.
     * Call this from your card UI's 'selected' event handler.
     */
    protected handleCardPlayed(card: CardConfig): void;
    /**
     * Handle quiz answer result. Call this from your QuizModal's 'answered' event.
     *
     * Guarded against double-fire: clears selectedCard immediately so a
     * second call (e.g., from a race condition in the QuizModal) is a no-op.
     */
    protected handleQuizAnswered(correct: boolean, selectedIndex: number): void;
    /**
     * HOOK (has default): Resolve a card's effect (damage, heal, shield, etc.)
     *
     * DEFAULT: Handles 'attack', 'heavy_attack', 'defend', 'heal', 'special'
     * card types with basic math. Override to add custom card types, different
     * damage formulas, or game-specific mechanics.
     *
     * After resolution, automatically proceeds to enemy turn.
     * If you override, remember to call setPhase('ENEMY_TURN') when ready.
     */
    protected resolveCardAction(card: CardConfig, successful: boolean): void;
    /**
     * Deal damage to player (used by enemy actions).
     * VISIBILITY: protected -- subclasses can call but MUST NOT re-declare as private.
     * If you need custom damage logic, override this method with "protected override".
     */
    protected dealDamageToPlayer(damage: number): void;
    /**
     * Deal damage to enemy (used by card actions).
     * VISIBILITY: protected -- subclasses can call but MUST NOT re-declare as private.
     * If you need custom damage logic, override this method with "protected override".
     */
    protected dealDamageToEnemy(damage: number): void;
    /** Heal the player. */
    protected healPlayer(amount: number): void;
    /** Add shield to player. */
    protected addPlayerShield(amount: number): void;
    /** Update combo streak. */
    protected updateCombo(correct: boolean): void;
    /** Draw cards from deck into hand. */
    protected drawCards(count: number): void;
    /** Discard a card from hand. */
    protected discardCard(card: CardConfig): void;
    /** Check if battle should end. Returns true if battle is over. */
    protected checkBattleEnd(): boolean;
    /**
     * Get a random question from the bank WITHOUT removing it.
     * The same question may be returned again in future calls.
     * Use popRandomQuestion() instead for no-repeat behavior.
     */
    protected getRandomQuestion(): QuizQuestion;
    /**
     * Pick a random question and REMOVE it from the bank (no repeats).
     * When the bank is exhausted, it auto-refills from getQuestionBank().
     * Prefer this over getRandomQuestion() for better player experience.
     */
    protected popRandomQuestion(): QuizQuestion;
    /**
     * Show floating text at a position (for damage numbers, status, etc.)
     * Uses the FloatingText STATIC utility component.
     *
     * Subclasses: just call this.showFloatingText(). Do NOT create a private
     * showFloatingText method or instantiate FloatingText via "new".
     */
    protected showFloatingText(text: string, x: number, y: number, config?: FloatingTextConfig): void;
    /** Fisher-Yates shuffle. */
    private shuffleArray;
    /** Play background music with fade-in. */
    private playBackgroundMusic;
}
