import Phaser from 'phaser';
export class TurnManager extends Phaser.Events.EventEmitter {
    _mode;
    _phase = 'WAITING';
    _turnNumber = 0;
    _moveCount = 0;
    _maxMoves;
    _actionsThisTurn = 0;
    _actionsPerTurn;
    _realtimeInterval;
    _realtimeTimer = 0;
    _realtimePaused = false;
    _started = false;
    constructor(config) {
        super();
        this._mode = config.mode;
        this._maxMoves = config.maxMoves ?? -1;
        this._realtimeInterval = config.realtimeIntervalMs ?? 500;
        this._actionsPerTurn = config.actionsPerTurn ?? 1;
    }
    // --------------------------------------------------------------------------
    // Properties
    // --------------------------------------------------------------------------
    get mode() {
        return this._mode;
    }
    get phase() {
        return this._phase;
    }
    get turnNumber() {
        return this._turnNumber;
    }
    get moveCount() {
        return this._moveCount;
    }
    get maxMoves() {
        return this._maxMoves;
    }
    get actionsThisTurn() {
        return this._actionsThisTurn;
    }
    get actionsPerTurn() {
        return this._actionsPerTurn;
    }
    get isStarted() {
        return this._started;
    }
    get isWaitingForInput() {
        return this._phase === 'WAITING' && this._started;
    }
    get hasMovesRemaining() {
        if (this._maxMoves < 0)
            return true;
        return this._moveCount < this._maxMoves;
    }
    // --------------------------------------------------------------------------
    // Lifecycle
    // --------------------------------------------------------------------------
    start() {
        this._started = true;
        this._turnNumber = 1;
        this._moveCount = 0;
        this._actionsThisTurn = 0;
        this._realtimeTimer = 0;
        this._phase = 'WAITING';
        this.emit('turnStart', this._turnNumber);
        this.emit('phaseChanged', this._phase);
    }
    stop() {
        this._started = false;
        this._realtimePaused = true;
    }
    /**
     * Call this from the scene's update() loop.
     * Only relevant for 'realtime' mode -- triggers automatic steps.
     */
    update(delta) {
        if (!this._started || this._mode !== 'realtime')
            return;
        if (this._realtimePaused)
            return;
        if (this._phase !== 'WAITING')
            return;
        this._realtimeTimer += delta;
        if (this._realtimeTimer >= this._realtimeInterval) {
            this._realtimeTimer -= this._realtimeInterval;
            this.emit('realtimeTick');
        }
    }
    // --------------------------------------------------------------------------
    // Phase Transitions
    // --------------------------------------------------------------------------
    /**
     * Signal that the player has performed an action.
     * In 'step' mode: immediately transitions to PROCESSING.
     * In 'turn' mode: increments action counter, transitions when limit reached
     *                 or when endTurn() is called.
     * In 'freeform' mode: immediately transitions to PROCESSING.
     */
    recordAction() {
        if (!this._started || this._phase !== 'WAITING')
            return;
        this._moveCount++;
        this._actionsThisTurn++;
        this.emit('moveCountChanged', this._moveCount, this._maxMoves);
        if (this._mode === 'step' ||
            this._mode === 'freeform' ||
            this._mode === 'realtime') {
            this.setPhase('PROCESSING');
        }
        else if (this._mode === 'turn') {
            if (this._actionsThisTurn >= this._actionsPerTurn) {
                this.setPhase('PROCESSING');
            }
        }
    }
    /**
     * Explicitly end the current turn (for 'turn' mode).
     * Can be called before all actions are used (voluntary end turn).
     */
    endTurn() {
        if (!this._started)
            return;
        if (this._mode === 'turn' && this._phase === 'WAITING') {
            this.setPhase('PROCESSING');
        }
    }
    /**
     * Transition to the ANIMATING phase (call after game logic is resolved).
     */
    beginAnimating() {
        if (this._phase === 'PROCESSING') {
            this.setPhase('ANIMATING');
        }
    }
    /**
     * Transition to the CHECKING phase (call after animations complete).
     */
    finishAnimating() {
        if (this._phase === 'ANIMATING') {
            this.setPhase('CHECKING');
        }
    }
    /**
     * Transition back to WAITING (call after win/lose checks pass).
     * Automatically advances turn number if needed.
     */
    finishChecking() {
        if (this._phase !== 'CHECKING')
            return;
        if (this._mode === 'step' || this._mode === 'realtime') {
            this._turnNumber++;
            this._actionsThisTurn = 0;
            this.emit('turnEnd', this._turnNumber - 1);
            this.emit('turnStart', this._turnNumber);
        }
        else if (this._mode === 'turn') {
            this._turnNumber++;
            this._actionsThisTurn = 0;
            this.emit('turnEnd', this._turnNumber - 1);
            this.emit('turnStart', this._turnNumber);
        }
        this.setPhase('WAITING');
    }
    /**
     * Shortcut: skip straight from PROCESSING -> WAITING
     * (when no animation is needed and win/lose check passes).
     */
    skipToWaiting() {
        if (this._phase === 'PROCESSING' ||
            this._phase === 'ANIMATING' ||
            this._phase === 'CHECKING') {
            if (this._mode !== 'freeform') {
                this._turnNumber++;
                this._actionsThisTurn = 0;
                this.emit('turnEnd', this._turnNumber - 1);
                this.emit('turnStart', this._turnNumber);
            }
            this.setPhase('WAITING');
        }
    }
    // --------------------------------------------------------------------------
    // Undo Support
    // --------------------------------------------------------------------------
    /**
     * Reverse one recorded action. Decrements move count and turn number.
     * Called by BaseGridScene.undo() to keep turn state in sync with board state.
     */
    undoAction() {
        if (this._moveCount > 0) {
            this._moveCount--;
            this.emit('moveCountChanged', this._moveCount, this._maxMoves);
        }
        if (this._turnNumber > 1) {
            this._turnNumber--;
        }
        this._actionsThisTurn = 0;
        this._phase = 'WAITING';
    }
    // --------------------------------------------------------------------------
    // Realtime Controls
    // --------------------------------------------------------------------------
    setRealtimeInterval(ms) {
        this._realtimeInterval = ms;
    }
    pauseRealtime() {
        this._realtimePaused = true;
    }
    resumeRealtime() {
        this._realtimePaused = false;
    }
    get isRealtimePaused() {
        return this._realtimePaused;
    }
    // --------------------------------------------------------------------------
    // Internal
    // --------------------------------------------------------------------------
    setPhase(phase) {
        const old = this._phase;
        this._phase = phase;
        this.emit('phaseChanged', phase, old);
    }
    // --------------------------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------------------------
    destroy() {
        this.removeAllListeners();
        super.destroy();
    }
}
//# sourceMappingURL=TurnManager.js.map