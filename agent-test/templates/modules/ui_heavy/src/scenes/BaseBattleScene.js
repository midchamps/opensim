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
import { FloatingText } from '../ui/FloatingText';
// ============================================================================
// BASE CLASS
// ============================================================================
export class BaseBattleScene extends Phaser.Scene {
    // -- Battle state --
    currentPhase = 'INTRO';
    turnNumber = 0;
    isBattleActive = false;
    // -- Combatant state --
    playerHP = 100;
    playerMaxHP = 100;
    enemyHP = 100;
    enemyMaxHP = 100;
    playerShield = 0;
    // -- Combo state --
    comboStreak = 0;
    comboMultiplier = 1.0;
    // -- Card state --
    deck = [];
    hand = [];
    discardPile = [];
    handSize = 3;
    // -- Question bank --
    questionBank = [];
    // -- Current turn state --
    selectedCard;
    currentQuestion;
    // -- Audio --
    backgroundMusic;
    // ============================================================================
    // LIFECYCLE (Template Method Pattern)
    // ============================================================================
    create() {
        // Reset mutable state (Phaser reuses scene instances on scene.start,
        // so constructor field initializers do NOT run again)
        this.turnNumber = 0;
        this.currentPhase = 'INTRO';
        this.isBattleActive = false;
        this.playerHP = 100;
        this.playerMaxHP = 100;
        this.enemyHP = 100;
        this.enemyMaxHP = 100;
        this.playerShield = 0;
        this.comboStreak = 0;
        this.comboMultiplier = 1;
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        this.handSize = 3;
        this.questionBank = [];
        this.selectedCard = undefined;
        this.currentQuestion = undefined;
        // Stop music before clearing the reference to prevent orphaned playback
        if (this.backgroundMusic?.isPlaying) {
            this.backgroundMusic.stop();
        }
        this.backgroundMusic = undefined;
        // initializeBattle MUST run before createHUD so HP values are
        // correct when status bars are created (maxValue, initialValue).
        this.initializeBattle();
        this.createBackground();
        this.createCombatants();
        this.createHUD();
        this.createHelpPanel();
        this.createHandArea();
        this.setupInputs();
        this.playBackgroundMusic();
        this.startBattle();
    }
    update(time, delta) {
        this.onUpdate(time, delta);
    }
    /** HOOK: Create the scene background. */
    createBackground() { }
    /** HOOK: Create player and enemy visual displays. */
    createCombatants() { }
    /** HOOK: Create the HUD (health bars, combo display). */
    createHUD() { }
    /** HOOK: Create the card hand display area. */
    createHandArea() { }
    /** HOOK: Set up custom input bindings. */
    setupInputs() { }
    /** HOOK: Return the audio key for background music. */
    getBackgroundMusicKey() {
        return undefined;
    }
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
    getGameplayHints() {
        return [
            'Select a card to use',
            'Answer the quiz question',
            'Correct = full effect',
            'Wrong = reduced effect',
        ];
    }
    // ============================================================================
    // HOOKS - Turn Flow
    // ============================================================================
    /** HOOK: Called when battle begins (after intro). */
    onBattleStart() { }
    /** HOOK: Called at the start of each turn. */
    onTurnStart(turnNumber) { }
    /**
     * HOOK: Player's turn begins. Cards are drawn and interactable.
     * Default implementation draws cards. Override to add custom behavior.
     */
    onPlayerTurnStart() { }
    /** HOOK: A card was drawn from deck into hand. */
    onCardDrawn(card) { }
    /** HOOK: Quiz phase begins (after card selection). */
    onQuizPhaseStart() { }
    /** HOOK: Resolve phase (apply card effect, then enemy turn). */
    onResolvePhase() { }
    /** HOOK: Player selected a card from hand. */
    onCardSelected(card) { }
    /** HOOK: A quiz question is presented to the player. */
    onQuizPresented(question) { }
    /** HOOK: Player answered the quiz question. */
    onQuizAnswered(correct, question, selectedIndex) { }
    /** HOOK: Educational feedback is shown after quiz. */
    onFeedbackShown(question, correct) { }
    /** HOOK: The selected card's action is executed. */
    onActionExecuted(card, finalDamage, combo) { }
    /** HOOK: Enemy's turn begins (visual indicators, animations). */
    onEnemyTurnStart() { }
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
    executeEnemyTurn() {
        this.time.delayedCall(500, () => {
            this.onEnemyAction();
            this.completeEnemyTurn();
        });
    }
    /** HOOK: Define enemy AI behavior (called by default executeEnemyTurn). */
    onEnemyAction() { }
    /** HOOK: Called at the end of each turn. */
    onTurnEnd(turnNumber) { }
    /** HOOK: Called when battle concludes. */
    onBattleEnd(victory) { }
    // ============================================================================
    // HOOKS - Combat Events
    // ============================================================================
    /** HOOK: Player took damage. */
    onPlayerDamaged(damage, remainingHP) { }
    /** HOOK: Enemy took damage. */
    onEnemyDamaged(damage, remainingHP) { }
    /** HOOK: Combo streak changed. */
    onComboChanged(newCombo, multiplier) { }
    /** HOOK: Player HP reached 0. */
    onPlayerDefeated() {
        this.setPhase('DEFEAT');
        this.onBattleEnd(false);
    }
    /** HOOK: Enemy HP reached 0. */
    onEnemyDefeated() {
        this.setPhase('VICTORY');
        this.onBattleEnd(true);
    }
    // ============================================================================
    // HOOKS - Config
    // ============================================================================
    /** HOOK: Define available cards for the deck. */
    getCardDeck() {
        return [];
    }
    /** HOOK: Define quiz questions. */
    getQuestionBank() {
        return [];
    }
    /** HOOK: Define enemy configuration. */
    getEnemyConfig() {
        return undefined;
    }
    // ============================================================================
    // HOOKS - Per-frame
    // ============================================================================
    /** HOOK: Custom per-frame logic. */
    onUpdate(time, delta) { }
    // ============================================================================
    // HELP PANEL
    // ============================================================================
    /**
     * Create a semi-transparent gameplay hints panel in the top-right corner.
     * Uses getGameplayHints() hook for content. Subclasses override hints, not this.
     */
    createHelpPanel() {
        const hints = this.getGameplayHints();
        if (!hints || hints.length === 0)
            return;
        const cam = this.cameras.main;
        const padding = 10;
        const lineHeight = 18;
        const panelWidth = 180;
        const panelHeight = padding * 2 + hints.length * lineHeight + 4;
        // Panel background
        const panelX = cam.width - panelWidth - 12;
        const panelY = 74;
        const bg = this.add.rectangle(panelX + panelWidth / 2, panelY + panelHeight / 2, panelWidth, panelHeight, 0x000000, 0.5);
        bg.setDepth(500);
        bg.setScrollFactor(0);
        // Rounded corners via stroke
        const border = this.add.rectangle(panelX + panelWidth / 2, panelY + panelHeight / 2, panelWidth, panelHeight);
        border.setStrokeStyle(1, 0x666666, 0.6);
        border.setFillStyle(0x000000, 0);
        border.setDepth(500);
        border.setScrollFactor(0);
        // Hint lines
        hints.forEach((line, i) => {
            const text = this.add.text(panelX + padding, panelY + padding + i * lineHeight, line, {
                fontSize: '12px',
                color: '#cccccc',
                fontFamily: 'Arial',
            });
            text.setDepth(501);
            text.setScrollFactor(0);
        });
    }
    // ============================================================================
    // PROTECTED UTILITIES (available to subclasses)
    // ============================================================================
    /**
     * Complete the enemy turn and progress to the next turn.
     * Call this after your custom enemy turn logic finishes
     * (e.g., after a defense quiz is answered).
     */
    completeEnemyTurn() {
        if (!this.isBattleActive)
            return;
        // CRITICAL: Check if battle ended from enemy turn damage (e.g., defense quiz).
        // Without this, the game freezes if player HP reaches 0 during enemy turn.
        if (this.checkBattleEnd())
            return;
        this.time.delayedCall(800, () => {
            this.onTurnEnd(this.turnNumber);
            if (!this.checkBattleEnd()) {
                this.beginNewTurn();
            }
        });
    }
    /**
     * Start the battle. Override startBattle() or useTurnCycle for custom flow.
     *
     * For PVP / buzzer-race games that do NOT use the turn cycle:
     *   protected override get useTurnCycle(): boolean { return false; }
     * Then drive your own round system (e.g., this.startNextRound()).
     */
    startBattle() {
        this.isBattleActive = true;
        this.deck = this.shuffleArray([...this.getCardDeck()]);
        this.questionBank = [...this.getQuestionBank()];
        this.onBattleStart();
        if (this.useTurnCycle) {
            this.beginNewTurn();
        }
    }
    /**
     * Whether the base class should automatically run the turn-based phase cycle
     * (PLAYER_TURN → QUIZ → ENEMY_TURN → CHECK_END → loop).
     *
     * Override to `false` for real-time or round-based PVP games where you
     * manage the game flow yourself (e.g., buzzer race, simultaneous answer).
     *
     * Default: true (standard turn-based flow).
     */
    get useTurnCycle() {
        return true;
    }
    /** Begin a new turn cycle. */
    beginNewTurn() {
        if (!this.isBattleActive)
            return;
        this.turnNumber++;
        this.selectedCard = undefined;
        this.currentQuestion = undefined;
        this.onTurnStart(this.turnNumber);
        // Prepare hand for new turn (default: discard all, draw fresh)
        this.prepareHand();
        this.setPhase('PLAYER_TURN');
    }
    /**
     * HOOK (has default): Prepare the player's hand for a new turn.
     *
     * DEFAULT: Discards entire hand to discard pile, then draws handSize cards.
     * Override for games that keep cards between turns, allow selective discard,
     * or have a different hand management system.
     */
    prepareHand() {
        this.hand.forEach((card) => this.discardPile.push(card));
        this.hand = [];
        this.drawCards(this.handSize);
    }
    /** Set the current battle phase and dispatch to phase hooks. */
    setPhase(phase) {
        this.currentPhase = phase;
        switch (phase) {
            case 'PLAYER_TURN':
                this.onPlayerTurnStart();
                break;
            case 'QUIZ_PHASE':
                this.onQuizPhaseStart();
                break;
            case 'ENEMY_TURN':
                this.onEnemyTurnStart();
                this.executeEnemyTurn();
                break;
            case 'ACTION_PHASE':
                this.onResolvePhase();
                break;
            case 'VICTORY':
            case 'DEFEAT':
                this.isBattleActive = false;
                break;
            default:
                break;
        }
    }
    /**
     * Handle a card being selected by the player.
     * This is the main entry point for the card->quiz->action flow.
     * Call this from your card UI's 'selected' event handler.
     */
    handleCardPlayed(card) {
        if (this.currentPhase !== 'PLAYER_TURN')
            return;
        this.selectedCard = card;
        this.discardCard(card);
        this.onCardSelected(card);
        // If we have quiz questions, proceed to quiz phase
        if (this.questionBank.length > 0) {
            this.currentQuestion = this.getRandomQuestion();
            this.setPhase('QUIZ_PHASE');
        }
        else {
            // No quiz - directly resolve the card action
            this.resolveCardAction(card, true);
        }
    }
    /**
     * Handle quiz answer result. Call this from your QuizModal's 'answered' event.
     *
     * Guarded against double-fire: clears selectedCard immediately so a
     * second call (e.g., from a race condition in the QuizModal) is a no-op.
     */
    handleQuizAnswered(correct, selectedIndex) {
        if (!this.currentQuestion || !this.selectedCard)
            return;
        // Capture and clear immediately to guard against double-fire
        const card = this.selectedCard;
        this.selectedCard = undefined;
        this.updateCombo(correct);
        this.onQuizAnswered(correct, this.currentQuestion, selectedIndex);
        // Resolve the card action based on quiz result
        this.time.delayedCall(500, () => {
            this.resolveCardAction(card, correct);
        });
    }
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
    resolveCardAction(card, successful) {
        const baseDamage = successful ? card.value : Math.floor(card.value * 0.3);
        // Track the actual effect applied (combo only applies to attacks via dealDamageToEnemy)
        let actualEffect = baseDamage;
        switch (card.type) {
            case 'attack':
            case 'heavy_attack':
                this.dealDamageToEnemy(baseDamage);
                // dealDamageToEnemy applies combo multiplier internally
                actualEffect = Math.floor(baseDamage * this.comboMultiplier);
                break;
            case 'defend':
                // Correct: full shield. Wrong: reduced shield (30%).
                this.addPlayerShield(baseDamage);
                actualEffect = baseDamage;
                break;
            case 'heal':
                // Correct: full heal. Wrong: reduced heal (30%).
                this.healPlayer(baseDamage);
                actualEffect = baseDamage;
                break;
            case 'special':
                // Subclass handles special cards via onActionExecuted
                actualEffect = baseDamage;
                break;
        }
        this.onActionExecuted(card, actualEffect, this.comboStreak);
        // Proceed to enemy turn
        this.time.delayedCall(800, () => {
            if (!this.checkBattleEnd()) {
                this.setPhase('ENEMY_TURN');
            }
        });
    }
    /**
     * Deal damage to player (used by enemy actions).
     * VISIBILITY: protected -- subclasses can call but MUST NOT re-declare as private.
     * If you need custom damage logic, override this method with "protected override".
     */
    dealDamageToPlayer(damage) {
        const actualDamage = Math.max(0, damage - this.playerShield);
        this.playerHP = Math.max(0, this.playerHP - actualDamage);
        this.playerShield = Math.max(0, this.playerShield - damage);
        this.onPlayerDamaged(actualDamage, this.playerHP);
    }
    /**
     * Deal damage to enemy (used by card actions).
     * VISIBILITY: protected -- subclasses can call but MUST NOT re-declare as private.
     * If you need custom damage logic, override this method with "protected override".
     */
    dealDamageToEnemy(damage) {
        const finalDamage = Math.floor(damage * this.comboMultiplier);
        this.enemyHP = Math.max(0, this.enemyHP - finalDamage);
        this.onEnemyDamaged(finalDamage, this.enemyHP);
    }
    /** Heal the player. */
    healPlayer(amount) {
        this.playerHP = Math.min(this.playerMaxHP, this.playerHP + amount);
    }
    /** Add shield to player. */
    addPlayerShield(amount) {
        this.playerShield += amount;
    }
    /** Update combo streak. */
    updateCombo(correct) {
        if (correct) {
            this.comboStreak++;
        }
        else {
            this.comboStreak = 0;
        }
        const tiers = [1.0, 1.2, 1.5, 2.0];
        this.comboMultiplier = tiers[Math.min(this.comboStreak, tiers.length - 1)];
        this.onComboChanged(this.comboStreak, this.comboMultiplier);
    }
    /** Draw cards from deck into hand. */
    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length === 0) {
                this.deck = this.shuffleArray([...this.discardPile]);
                this.discardPile = [];
            }
            if (this.deck.length > 0) {
                const card = this.deck.pop();
                this.hand.push(card);
                this.onCardDrawn(card);
            }
        }
    }
    /** Discard a card from hand. */
    discardCard(card) {
        const idx = this.hand.indexOf(card);
        if (idx >= 0) {
            this.hand.splice(idx, 1);
            this.discardPile.push(card);
        }
    }
    /** Check if battle should end. Returns true if battle is over. */
    checkBattleEnd() {
        // Already ended? Don't re-trigger.
        if (!this.isBattleActive)
            return true;
        if (this.currentPhase === 'VICTORY' || this.currentPhase === 'DEFEAT')
            return true;
        if (this.playerHP <= 0) {
            this.onPlayerDefeated();
            return true;
        }
        if (this.enemyHP <= 0) {
            this.onEnemyDefeated();
            return true;
        }
        return false;
    }
    /**
     * Get a random question from the bank WITHOUT removing it.
     * The same question may be returned again in future calls.
     * Use popRandomQuestion() instead for no-repeat behavior.
     */
    getRandomQuestion() {
        const idx = Math.floor(Math.random() * this.questionBank.length);
        return this.questionBank[idx];
    }
    /**
     * Pick a random question and REMOVE it from the bank (no repeats).
     * When the bank is exhausted, it auto-refills from getQuestionBank().
     * Prefer this over getRandomQuestion() for better player experience.
     */
    popRandomQuestion() {
        if (this.questionBank.length === 0) {
            this.questionBank = [...this.getQuestionBank()];
        }
        const idx = Math.floor(Math.random() * this.questionBank.length);
        return this.questionBank.splice(idx, 1)[0];
    }
    /**
     * Show floating text at a position (for damage numbers, status, etc.)
     * Uses the FloatingText STATIC utility component.
     *
     * Subclasses: just call this.showFloatingText(). Do NOT create a private
     * showFloatingText method or instantiate FloatingText via "new".
     */
    showFloatingText(text, x, y, config) {
        FloatingText.show(this, x, y, text, config);
    }
    // ============================================================================
    // PRIVATE UTILITIES
    // ============================================================================
    /** Fisher-Yates shuffle. */
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    /** Play background music with fade-in. */
    playBackgroundMusic() {
        const key = this.getBackgroundMusicKey();
        if (!key)
            return;
        try {
            if (this.sound.get(key)) {
                this.backgroundMusic = this.sound.get(key);
            }
            else {
                this.backgroundMusic = this.sound.add(key, { loop: true, volume: 0 });
            }
            this.backgroundMusic?.play();
            this.tweens.add({
                targets: this.backgroundMusic,
                volume: 0.5,
                duration: 1000,
            });
        }
        catch (e) {
            console.warn(`[BaseBattleScene] Could not play music: ${key}`, e);
        }
    }
}
//# sourceMappingURL=BaseBattleScene.js.map