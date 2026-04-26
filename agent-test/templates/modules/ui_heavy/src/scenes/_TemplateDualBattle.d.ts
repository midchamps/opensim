/**
 * ============================================================================
 * TEMPLATE: Dual-Player Battle Scene (2P Quiz / Card Battle)
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename (e.g., QuizDuelScene.ts)
 * 2. Rename the class and constructor scene key
 * 3. Choose a DualPlayerMode:
 *    - 'TURN_BASED': P1 and P2 alternate turns (like a board game)
 *    - 'BUZZER_RACE': Both see the question, first to buzz gets to answer
 *    - 'SIMULTANEOUS': Both answer independently, score by speed + correctness
 * 4. Configure player key bindings
 * 5. Implement quiz/card presentation per mode
 *
 * CRITICAL RULES:
 * - This extends BaseBattleScene. All single-player hooks still work.
 * - DualPlayerSystem is a COMPOSABLE SYSTEM, not a base class.
 * - In TURN_BASED mode, "ENEMY_TURN" becomes "Player 2's turn" via
 *   executeEnemyTurn() override.
 * - In BUZZER_RACE / SIMULTANEOUS mode, the quiz phase is replaced
 *   with the dual-player round.
 * - Always clean up dualSystem in scene shutdown (see cleanup section below).
 *
 * BUZZER TRACKING (BUZZER_RACE mode):
 *   When using BUZZER_RACE mode, you MUST track who buzzed in a class property:
 *     private lastBuzzedPlayerId?: string;
 *   Set it in the 'playerBuzzed' event handler:
 *     this.dualSystem.on('playerBuzzed', (id) => { this.lastBuzzedPlayerId = id; });
 *   Then use it to attribute damage/score correctly.
 *
 * CONFIG ACCESS:
 *   There is NO "this.gameConfig" property. Import values directly:
 *     import gameConfig from '../gameConfig.json';
 *     const battleConfig = gameConfig.battleConfig ?? {};
 *   Then: battleConfig.playerMaxHP.value
 *
 * SCENE CLEANUP:
 *   Phaser.Scene does NOT have an overridable shutdown() method.
 *   Register cleanup in create() (after super.create()):
 *     this.events.once('shutdown', () => {
 *       this.dualSystem.destroy();
 *       // remove timers, etc.
 *     });
 *
 * TYPE IMPORTS:
 *   All interfaces/types MUST use the "type" keyword:
 *     import { type DualPlayerSystemConfig } from '../systems/DualPlayerSystem';
 *
 * FILE CHECKLIST (complete AFTER implementing this scene):
 *   [ ] main.ts — import { YourScene } from './scenes/YourScene';
 *   [ ] main.ts — game.scene.add("YourSceneKey", YourScene);
 *   [ ] LevelManager.ts — add "YourSceneKey" to LEVEL_ORDER
 *   [ ] asset-pack.json — all texture/audio keys used here must be registered
 *   [ ] gameConfig.json — merge battleConfig + dualPlayerConfig values
 *   [ ] TitleScreen.ts — update game title text
 * ============================================================================
 */
import { BaseBattleScene, type CardConfig, type QuizQuestion } from './BaseBattleScene';
export declare class _TemplateDualBattle extends BaseBattleScene {
    constructor();
    protected initializeBattle(): void;
    protected getCardDeck(): CardConfig[];
    protected getQuestionBank(): QuizQuestion[];
    protected createCombatants(): void;
    protected createHUD(): void;
    protected getGameplayHints(): string[];
    protected onBattleEnd(victory: boolean): void;
}
