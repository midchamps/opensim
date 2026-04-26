/**
 * ============================================================================
 * TEMPLATE: Battle Scene (Turn-Based Combat / Quiz)
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename (e.g., DuelScene.ts, BattleScene.ts)
 * 2. Rename the class and constructor scene key
 * 3. Define battle setup in initializeBattle()
 * 4. Define card deck in getCardDeck()
 * 5. Define quiz questions in getQuestionBank() (optional)
 * 6. Define enemy AI in onEnemyAction()
 * 7. Override hooks as needed for visual/audio effects
 *
 * CRITICAL RULES:
 * - initializeBattle() is REQUIRED and runs BEFORE createHUD(),
 *   so set HP values there (they are used when creating status bars)
 * - Do NOT override create() unless you call super.create() first.
 *   Base class handles the full lifecycle in create().
 *   If you do override, register cleanup:
 *     this.events.once('shutdown', () => { your cleanup });
 * - Card textureKeys must match asset-pack.json
 * - Questions should include explanation field for feedback
 * - Use handleCardPlayed(card) when a card UI is clicked
 * - Use handleQuizAnswered(correct, index) when quiz modal reports answer
 * - Base class auto-draws cards each turn via prepareHand() (overridable)
 * - Override prepareHand() to customize hand management (e.g., keep cards)
 * - Override resolveCardAction() to customize card effect resolution
 * - IMPORTANT: If overriding resolveCardAction(), hide the quiz modal first
 *   via quizModal.hide() so the player can see the HP bar effect.
 *   The quiz modal (depth 300) covers the HP bars (depth 150).
 *
 * CONFIG ACCESS:
 *   There is NO "this.gameConfig" property on BaseBattleScene.
 *   To read values from gameConfig.json, import it at the top of your file:
 *     import gameConfig from '../gameConfig.json';
 *     const battleConfig = gameConfig.battleConfig ?? {};
 *   Then access values via .value wrapper:
 *     const hp = battleConfig.playerMaxHP.value;       // number
 *
 * FLOATING TEXT:
 *   Use the inherited helper (static API, NOT a constructor):
 *     this.showFloatingText('-25', x, y, { color: '#ff0000', fontSize: '28px' });
 *   NEVER write: new FloatingText(...)
 *
 * TYPE IMPORTS:
 *   All interfaces/types MUST use the "type" keyword:
 *     import { type CardConfig } from './BaseBattleScene';   // CORRECT
 *     import { CardConfig } from './BaseBattleScene';        // WRONG - causes Vite error
 *
 * SCENE CLEANUP:
 *   Phaser.Scene does NOT have an overridable shutdown() method.
 *   Register cleanup via events in create():
 *     this.events.once('shutdown', () => { ... });
 *
 * FILE CHECKLIST (complete AFTER implementing this scene):
 *   [ ] main.ts — import { YourScene } from './scenes/YourScene';
 *   [ ] main.ts — game.scene.add("YourSceneKey", YourScene);
 *   [ ] LevelManager.ts — add "YourSceneKey" to LEVEL_ORDER
 *   [ ] asset-pack.json — all texture/audio keys used here must be registered
 *   [ ] gameConfig.json — merge battleConfig values (keep screenSize/debugConfig)
 *   [ ] TitleScreen.ts — update game title text
 * ============================================================================
 */
import { BaseBattleScene, type CardConfig, type QuizQuestion, type EnemyBattleConfig } from './BaseBattleScene';
export declare class _TemplateBattle extends BaseBattleScene {
    constructor();
    protected initializeBattle(): void;
    protected getCardDeck(): CardConfig[];
    protected getQuestionBank(): QuizQuestion[];
    protected getEnemyConfig(): EnemyBattleConfig | undefined;
    protected createBackground(): void;
    protected createCombatants(): void;
    protected getBackgroundMusicKey(): string | undefined;
    /**
     * OPTIONAL: Gameplay hints displayed in top-right corner.
     * These help the player understand card effects and game flow.
     * Return [] to hide the panel entirely.
     */
    protected getGameplayHints(): string[];
    protected createHUD(): void;
    protected onPlayerTurnStart(): void;
    protected onQuizPhaseStart(): void;
    protected onPlayerDamaged(damage: number, remainingHP: number): void;
    protected onEnemyDamaged(damage: number, remainingHP: number): void;
    protected onEnemyAction(): void;
    protected onBattleEnd(victory: boolean): void;
}
