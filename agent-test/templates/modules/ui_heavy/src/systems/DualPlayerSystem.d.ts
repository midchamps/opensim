/**
 * ============================================================================
 * DUAL PLAYER SYSTEM - Two-player real-time interaction manager
 * ============================================================================
 *
 * Manages two-player local gameplay: input splitting, per-player state,
 * buzzer/race mechanics, and score tracking.
 *
 * NOT a base class. This is a COMPOSABLE SYSTEM that a battle scene can
 * instantiate and use. It does NOT modify BaseBattleScene's turn flow.
 * Instead, the subclass uses BaseBattleScene's existing hooks (especially
 * executeEnemyTurn) to integrate Player 2's turn.
 *
 * SUPPORTED MODES:
 *   1. TURN_BASED: Players alternate turns. P1 plays, then P2, repeat.
 *      Integration: Override executeEnemyTurn() to run P2's card/quiz turn.
 *   2. BUZZER_RACE: Both see the same question. First to buzz gets to answer.
 *      Integration: In onQuizPhaseStart(), call dualSystem.startBuzzerRound().
 *   3. SIMULTANEOUS: Both answer independently. Score by correctness + speed.
 *      Integration: In onQuizPhaseStart(), call dualSystem.startSimultaneousRound().
 *
 * EVENTS (via Phaser.Events.EventEmitter):
 *   - 'playerBuzzed': (playerId: string) => void
 *   - 'playerAnswered': (playerId: string, answerIndex: number, timeMs: number) => void
 *   - 'roundResult': (result: RoundResult) => void
 *   - 'scoreChanged': (playerId: string, newScore: number) => void
 *   - 'gameOver': (winnerId: string) => void
 *
 * USAGE (in a BaseBattleScene subclass):
 *   // In initializeBattle():
 *   this.dualSystem = new DualPlayerSystem(this, {
 *     mode: 'BUZZER_RACE',
 *     scoreToWin: 10,
 *     player1: { id: 'P1', name: 'Player 1', color: 0x4488ff,
 *       keys: { buzz: Phaser.Input.Keyboard.KeyCodes.Q,
 *               answers: [ONE, TWO, THREE, FOUR] } },
 *     player2: { id: 'P2', name: 'Player 2', color: 0xff4444,
 *       keys: { buzz: Phaser.Input.Keyboard.KeyCodes.P,
 *               answers: [SEVEN, EIGHT, NINE, ZERO] } },
 *   });
 *
 *   // Listen for events (IMPORTANT: store buzzed player for later use):
 *   this.dualSystem.on('playerBuzzed', (playerId) => {
 *     this.lastBuzzedPlayerId = playerId;  // MUST store for damage attribution
 *   });
 *   this.dualSystem.on('roundResult', (result) => { updateScoreUI(result); });
 *
 *   // In onQuizPhaseStart() (BUZZER_RACE mode):
 *   this.dualSystem.startBuzzerRound(this.currentQuestion!);
 *
 *   // In executeEnemyTurn() (TURN_BASED mode):
 *   this.dualSystem.startPlayer2Turn();
 */
import Phaser from 'phaser';
import { type QuizQuestion } from '../scenes/BaseBattleScene';
/** Dual-player game mode */
export type DualPlayerMode = 'TURN_BASED' | 'BUZZER_RACE' | 'SIMULTANEOUS';
/** Key binding configuration for one player */
export interface PlayerKeyConfig {
    /** Buzzer key (used in BUZZER_RACE mode) */
    buzz: number;
    /** Answer keys [option0, option1, option2, option3] (used in SIMULTANEOUS mode) */
    answers: number[];
}
/** Player configuration */
export interface DualPlayerConfig {
    /** Player identifier ('P1' or 'P2', or custom) */
    id: string;
    /** Display name */
    name: string;
    /** Player color (hex) for UI elements */
    color: number;
    /** Key bindings */
    keys: PlayerKeyConfig;
}
/** System configuration */
export interface DualPlayerSystemConfig {
    /** Game mode */
    mode: DualPlayerMode;
    /** Score needed to win (0 = no win condition, scene handles it) */
    scoreToWin?: number;
    /** Player 1 config */
    player1: DualPlayerConfig;
    /** Player 2 config */
    player2: DualPlayerConfig;
    /** Time limit per buzzer round in ms (0 = no limit) */
    buzzerTimeLimit?: number;
    /** Points for correct answer */
    correctPoints?: number;
    /** Points deducted for wrong answer */
    wrongPenalty?: number;
    /** Bonus points for faster answer in SIMULTANEOUS mode */
    speedBonus?: number;
}
/** Result of a single round */
export interface RoundResult {
    /** Round number */
    round: number;
    /** Who won the round (null = tie or no winner) */
    winnerId: string | null;
    /** Per-player details */
    details: {
        playerId: string;
        answered: boolean;
        correct: boolean;
        timeMs: number;
        pointsEarned: number;
    }[];
}
export declare class DualPlayerSystem extends Phaser.Events.EventEmitter {
    private scene;
    private config;
    private players;
    private roundNumber;
    private isRoundActive;
    private currentQuestion?;
    private buzzedPlayerId?;
    private roundStartTime;
    private buzzerTimer?;
    private answerTimer?;
    private playerAnswers;
    constructor(scene: Phaser.Scene, config: DualPlayerSystemConfig);
    private setupPlayers;
    /**
     * Start a buzzer race round. Both players see the question.
     * First to press their buzz key gets to answer.
     * Call this from onQuizPhaseStart() or similar hook.
     */
    startBuzzerRound(question: QuizQuestion): void;
    /**
     * After a player buzzes, listen for their answer key press.
     * Starts an answer timeout (uses buzzerTimeLimit) — if the buzzed player
     * doesn't answer in time, the round ends with a wrong-answer penalty.
     */
    private waitForBuzzerAnswer;
    private handleBuzzerAnswer;
    /**
     * Start a simultaneous answer round. Both players answer independently.
     * Points awarded based on correctness. Faster correct answer gets bonus.
     * Call this from onQuizPhaseStart() or similar hook.
     */
    startSimultaneousRound(question: QuizQuestion): void;
    private resolveSimultaneousRound;
    /**
     * Signal that Player 2's turn is starting (TURN_BASED mode).
     * The battle scene's executeEnemyTurn() override should call this,
     * then present a card/quiz UI to Player 2.
     * The scene handles the actual UI; this just tracks state.
     */
    startPlayer2Turn(): void;
    /**
     * Record Player 2's quiz answer in TURN_BASED mode.
     * Call from the scene's quiz answer handler when it's P2's turn.
     */
    recordTurnAnswer(playerId: string, correct: boolean): void;
    /** Get a player's current score. */
    getScore(playerId: string): number;
    /** Get a player's config. */
    getPlayerConfig(playerId: string): DualPlayerConfig | undefined;
    /** Get all player IDs. */
    getPlayerIds(): string[];
    /** Get current round number. */
    getRound(): number;
    /** Get player stats. */
    getPlayerStats(playerId: string): {
        score: number;
        correct: number;
        wrong: number;
        streak: number;
        bestStreak: number;
    } | undefined;
    /** Determine the winner (by score). Returns null if tied. */
    getWinner(): DualPlayerConfig | null;
    /** Get the game mode. */
    getMode(): DualPlayerMode;
    /** Check if a round is currently active. */
    isActive(): boolean;
    /** Reset all scores and stats. */
    reset(): void;
    /** Clean up keyboard listeners and timers. Call when scene shuts down. */
    destroy(): void;
    private cleanupRoundListeners;
    private buildRoundResult;
    private checkWinCondition;
}
