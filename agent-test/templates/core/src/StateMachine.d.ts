/**
 * StateMachine - A simple, reusable finite state machine
 *
 * This is a core utility that can be used by any game type.
 * For player-specific FSM with animation support, see PlayerFSM in modules.
 *
 * Usage:
 *   const fsm = new StateMachine(owner, 'idle');
 *   fsm.addState('idle', {
 *     onEnter: () => console.log('entering idle'),
 *     onUpdate: () => { ... },
 *     onExit: () => console.log('exiting idle'),
 *   });
 *   fsm.addState('moving', { ... });
 *   fsm.setState('moving');
 *   fsm.update(); // call every frame
 */
export interface IStateConfig {
    onEnter?: () => void;
    onUpdate?: () => void;
    onExit?: () => void;
}
export declare class StateMachine {
    private owner;
    private states;
    private currentStateName;
    private currentState;
    private isChangingState;
    /**
     * Create a new StateMachine
     * @param owner - The object that owns this state machine
     * @param initialState - Optional initial state name (will call onEnter if state exists)
     */
    constructor(owner: any, initialState?: string);
    /**
     * Add a state to the state machine
     * @param name - Unique state name
     * @param config - State configuration with onEnter, onUpdate, onExit callbacks
     */
    addState(name: string, config: IStateConfig): this;
    /**
     * Transition to a new state
     * @param name - Name of the state to transition to
     * @returns true if transition was successful
     */
    setState(name: string): boolean;
    /**
     * Update the current state (call every frame)
     */
    update(): void;
    /**
     * Get the current state name
     */
    get state(): string | null;
    /**
     * Check if currently in a specific state
     */
    isState(name: string): boolean;
    /**
     * Check if a state exists
     */
    hasState(name: string): boolean;
}
