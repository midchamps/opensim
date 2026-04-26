/**
 * ============================================================================
 * TURN MANAGER - Phase state machine for turn-based games
 * ============================================================================
 *
 * Manages the flow of turn-based game phases. Not tied to any specific
 * game type -- works for card battlers, quiz games, TRPG, etc.
 *
 * NOTE: BaseBattleScene has its own built-in phase management via setPhase().
 * Use TurnManager only if you need a STANDALONE phase engine outside the
 * base class lifecycle (e.g., custom scenes or advanced multi-phase games).
 *
 * USAGE:
 *   const tm = new TurnManager({ phases: ['PLAYER_TURN', 'QUIZ', 'ENEMY_TURN', 'CHECK'] });
 *   tm.onPhaseEnter('PLAYER_TURN', () => { enableCardHand(); });
 *   tm.onPhaseExit('PLAYER_TURN', () => { disableCardHand(); });
 *   tm.start();          // enters first phase
 *   tm.nextPhase();      // advances to next phase in sequence
 *   tm.goToPhase('QUIZ'); // jump to specific phase
 *
 * EVENTS (callback-based):
 *   - onPhaseEnter(phaseName, callback): fires when entering a phase
 *   - onPhaseExit(phaseName, callback): fires when exiting a phase
 */
export type PhaseCallback = (phaseName: string) => void;
export interface TurnManagerConfig {
    /** Ordered list of phase names for one turn cycle */
    phases: string[];
    /** Whether to auto-advance after phase callbacks (default: false) */
    autoAdvance?: boolean;
}
export declare class TurnManager {
    private phases;
    private autoAdvance;
    private currentIndex;
    private turnNumber;
    private isRunning;
    private isPaused;
    private enterCallbacks;
    private exitCallbacks;
    constructor(config: TurnManagerConfig);
    /** Register a callback for when a phase is entered. */
    onPhaseEnter(phaseName: string, callback: PhaseCallback): void;
    /** Register a callback for when a phase is exited. */
    onPhaseExit(phaseName: string, callback: PhaseCallback): void;
    /** Begin the first turn, enter the first phase. */
    start(): void;
    /** Exit current phase and advance to next. If at end, complete turn cycle. */
    nextPhase(): void;
    /** Jump to a specific phase (exit current first). */
    goToPhase(phaseName: string): void;
    /** Pause phase progression (nextPhase/goToPhase will be no-ops). */
    pause(): void;
    /** Resume phase progression. */
    resume(): void;
    /** Stop the turn manager entirely. */
    stop(): void;
    getCurrentPhase(): string;
    getTurnNumber(): number;
    isActive(): boolean;
    private advanceToNext;
    private enterCurrentPhase;
    private exitCurrentPhase;
}
