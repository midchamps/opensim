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
/**
 * BaseBehavior - Abstract base class for behaviors
 *
 * Provides common functionality for all behaviors.
 * Extend this class to create new behavior types.
 */
export class BaseBehavior {
    enabled = true;
    owner = null;
    /**
     * Attach to an owner entity
     */
    attach(owner) {
        this.owner = owner;
        this.onAttach();
    }
    /**
     * Detach from owner entity
     */
    detach() {
        this.onDetach();
        this.owner = null;
    }
    /**
     * Hook: Called after attaching to owner
     * Override in subclasses to set up behavior-specific initialization
     */
    onAttach() {
        // Override in subclasses
    }
    /**
     * Hook: Called before detaching from owner
     * Override in subclasses to clean up behavior-specific state
     */
    onDetach() {
        // Override in subclasses
    }
    /**
     * Get the owner entity
     * @throws Error if not attached to an owner
     */
    getOwner() {
        if (!this.owner) {
            throw new Error(`${this.constructor.name}: Not attached to an owner`);
        }
        return this.owner;
    }
    /**
     * Check if behavior is attached to an owner
     */
    isAttached() {
        return this.owner !== null;
    }
}
//# sourceMappingURL=IBehavior.js.map