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
export class TurnManager {
    phases;
    autoAdvance;
    currentIndex = -1;
    turnNumber = 0;
    isRunning = false;
    isPaused = false;
    // Event callbacks
    enterCallbacks = new Map();
    exitCallbacks = new Map();
    constructor(config) {
        this.phases = config.phases;
        this.autoAdvance = config.autoAdvance ?? false;
    }
    // -- Phase registration --
    /** Register a callback for when a phase is entered. */
    onPhaseEnter(phaseName, callback) {
        const existing = this.enterCallbacks.get(phaseName) ?? [];
        existing.push(callback);
        this.enterCallbacks.set(phaseName, existing);
    }
    /** Register a callback for when a phase is exited. */
    onPhaseExit(phaseName, callback) {
        const existing = this.exitCallbacks.get(phaseName) ?? [];
        existing.push(callback);
        this.exitCallbacks.set(phaseName, existing);
    }
    // -- Control --
    /** Begin the first turn, enter the first phase. */
    start() {
        if (this.phases.length === 0)
            return;
        this.isRunning = true;
        this.isPaused = false;
        this.turnNumber = 1;
        this.currentIndex = -1;
        this.advanceToNext();
    }
    /** Exit current phase and advance to next. If at end, complete turn cycle. */
    nextPhase() {
        if (!this.isRunning || this.isPaused)
            return;
        this.advanceToNext();
    }
    /** Jump to a specific phase (exit current first). */
    goToPhase(phaseName) {
        if (!this.isRunning || this.isPaused)
            return;
        const targetIndex = this.phases.indexOf(phaseName);
        if (targetIndex === -1)
            return;
        // Exit current phase
        this.exitCurrentPhase();
        // Enter target phase
        this.currentIndex = targetIndex;
        this.enterCurrentPhase();
    }
    /** Pause phase progression (nextPhase/goToPhase will be no-ops). */
    pause() {
        this.isPaused = true;
    }
    /** Resume phase progression. */
    resume() {
        this.isPaused = false;
    }
    /** Stop the turn manager entirely. */
    stop() {
        this.exitCurrentPhase();
        this.isRunning = false;
        this.currentIndex = -1;
    }
    // -- Query --
    getCurrentPhase() {
        if (this.currentIndex < 0 || this.currentIndex >= this.phases.length)
            return '';
        return this.phases[this.currentIndex];
    }
    getTurnNumber() {
        return this.turnNumber;
    }
    isActive() {
        return this.isRunning;
    }
    // -- Internal --
    advanceToNext() {
        // Use a loop instead of recursion to prevent stack overflow
        // when autoAdvance is true.
        // Safety: cap iterations at (phases.length + 1) per call to
        // guarantee termination even if no callback pauses/stops.
        const maxIterations = this.phases.length + 1;
        let iterations = 0;
        do {
            // Exit current phase (if any)
            this.exitCurrentPhase();
            // Advance index
            this.currentIndex++;
            // If past the end, one full cycle is complete -> start new turn
            if (this.currentIndex >= this.phases.length) {
                this.turnNumber++;
                this.currentIndex = 0;
            }
            // Enter new phase
            this.enterCurrentPhase();
            iterations++;
        } while (this.autoAdvance &&
            this.isRunning &&
            !this.isPaused &&
            iterations < maxIterations);
    }
    enterCurrentPhase() {
        const phase = this.getCurrentPhase();
        if (!phase)
            return;
        const callbacks = this.enterCallbacks.get(phase);
        if (callbacks) {
            for (const cb of callbacks) {
                cb(phase);
            }
        }
    }
    exitCurrentPhase() {
        const phase = this.getCurrentPhase();
        if (!phase)
            return;
        const callbacks = this.exitCallbacks.get(phase);
        if (callbacks) {
            for (const cb of callbacks) {
                cb(phase);
            }
        }
    }
}
//# sourceMappingURL=TurnManager.js.map