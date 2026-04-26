/**
 * IBehavior - Interface for behavior components
 *
 * Behaviors are reusable pieces of game logic that can be attached to entities.
 * They follow the Component pattern - entities are composed of behaviors rather
 * than inheriting from complex class hierarchies.
 *
 * Key Concepts:
 * - Behaviors are attached to an owner (Player, Enemy, etc.)
 * - Behaviors can be enabled/disabled at runtime
 * - Behaviors have lifecycle hooks: attach, detach, update
 * - Behaviors should be stateless where possible (config-driven)
 */
export interface IBehavior {
    /** Whether this behavior is currently active */
    enabled: boolean;
    /**
     * Called when behavior is attached to an owner
     * Use this to set up references and initialize state
     * @param owner - The game object this behavior is attached to
     */
    attach(owner: any): void;
    /**
     * Called when behavior is removed from owner
     * Use this to clean up references and state
     */
    detach(): void;
    /**
     * Called every frame when behavior is enabled
     * Implement behavior logic here
     */
    update(): void;
}
/**
 * BaseBehavior - Abstract base class for behaviors
 *
 * Provides common functionality for all behaviors.
 * Extend this class to create new behavior types.
 */
export declare abstract class BaseBehavior implements IBehavior {
    enabled: boolean;
    protected owner: any;
    /**
     * Attach to an owner entity
     */
    attach(owner: any): void;
    /**
     * Detach from owner entity
     */
    detach(): void;
    /**
     * Update behavior (called every frame when enabled)
     */
    abstract update(): void;
    /**
     * Hook: Called after attaching to owner
     * Override in subclasses to set up behavior-specific initialization
     */
    protected onAttach(): void;
    /**
     * Hook: Called before detaching from owner
     * Override in subclasses to clean up behavior-specific state
     */
    protected onDetach(): void;
    /**
     * Get the owner entity
     * @throws Error if not attached to an owner
     */
    protected getOwner<T = any>(): T;
    /**
     * Check if behavior is attached to an owner
     */
    isAttached(): boolean;
}
