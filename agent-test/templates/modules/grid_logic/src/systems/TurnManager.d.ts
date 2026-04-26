import Phaser from 'phaser';
/**
 * Grid game timing modes:
 * - 'step':     Each player input = one game step (Sokoban, sliding puzzle)
 * - 'turn':     Player takes multiple actions, then ends turn (tactics, chess)
 * - 'realtime': Timer-driven steps at fixed intervals (Snake, Tetris)
 * - 'freeform': No turn structure, process input immediately (Match-3)
 */
export type GridTimingMode = 'step' | 'turn' | 'realtime' | 'freeform';
/**
 * Phases within a single turn/step cycle.
 * WAITING    -> Ready for player input
 * PROCESSING -> Resolving game logic (push, match, gravity, AI)
 * ANIMATING  -> Playing visual animations
 * CHECKING   -> Evaluating win/lose conditions
 */
export type GridPhase = 'WAITING' | 'PROCESSING' | 'ANIMATING' | 'CHECKING';
export interface TurnManagerConfig {
    mode: GridTimingMode;
    maxMoves?: number;
    realtimeIntervalMs?: number;
    actionsPerTurn?: number;
}
export declare class TurnManager extends Phaser.Events.EventEmitter {
    private _mode;
    private _phase;
    private _turnNumber;
    private _moveCount;
    private _maxMoves;
    private _actionsThisTurn;
    private _actionsPerTurn;
    private _realtimeInterval;
    private _realtimeTimer;
    private _realtimePaused;
    private _started;
    constructor(config: TurnManagerConfig);
    get mode(): GridTimingMode;
    get phase(): GridPhase;
    get turnNumber(): number;
    get moveCount(): number;
    get maxMoves(): number;
    get actionsThisTurn(): number;
    get actionsPerTurn(): number;
    get isStarted(): boolean;
    get isWaitingForInput(): boolean;
    get hasMovesRemaining(): boolean;
    start(): void;
    stop(): void;
    /**
     * Call this from the scene's update() loop.
     * Only relevant for 'realtime' mode -- triggers automatic steps.
     */
    update(delta: number): void;
    /**
     * Signal that the player has performed an action.
     * In 'step' mode: immediately transitions to PROCESSING.
     * In 'turn' mode: increments action counter, transitions when limit reached
     *                 or when endTurn() is called.
     * In 'freeform' mode: immediately transitions to PROCESSING.
     */
    recordAction(): void;
    /**
     * Explicitly end the current turn (for 'turn' mode).
     * Can be called before all actions are used (voluntary end turn).
     */
    endTurn(): void;
    /**
     * Transition to the ANIMATING phase (call after game logic is resolved).
     */
    beginAnimating(): void;
    /**
     * Transition to the CHECKING phase (call after animations complete).
     */
    finishAnimating(): void;
    /**
     * Transition back to WAITING (call after win/lose checks pass).
     * Automatically advances turn number if needed.
     */
    finishChecking(): void;
    /**
     * Shortcut: skip straight from PROCESSING -> WAITING
     * (when no animation is needed and win/lose check passes).
     */
    skipToWaiting(): void;
    /**
     * Reverse one recorded action. Decrements move count and turn number.
     * Called by BaseGridScene.undo() to keep turn state in sync with board state.
     */
    undoAction(): void;
    setRealtimeInterval(ms: number): void;
    pauseRealtime(): void;
    resumeRealtime(): void;
    get isRealtimePaused(): boolean;
    setPhase(phase: GridPhase): void;
    destroy(): void;
}
