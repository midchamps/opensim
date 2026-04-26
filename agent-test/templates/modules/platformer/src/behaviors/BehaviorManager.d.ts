import type { IBehavior } from './IBehavior';
/**
 * BehaviorManager - Manages behavior components for an entity
 *
 * The BehaviorManager is responsible for:
 * - Adding/removing behaviors
 * - Updating all enabled behaviors each frame
 * - Providing access to behaviors by name
 *
 * Usage:
 *   // In entity constructor:
 *   this.behaviors = new BehaviorManager(this);
 *   this.movement = this.behaviors.add('movement', new PlatformerMovement(config));
 *   this.combat = this.behaviors.add('combat', new MeleeAttack(config));
 *
 *   // In entity update:
 *   this.behaviors.update();
 *
 *   // Access behaviors:
 *   const movement = this.behaviors.get<PlatformerMovement>('movement');
 *   movement.jump();
 */
export declare class BehaviorManager {
    private owner;
    private behaviors;
    /**
     * Create a new BehaviorManager
     * @param owner - The entity that owns this manager
     */
    constructor(owner: any);
    /**
     * Add a behavior to this entity
     * @param name - Unique name for this behavior
     * @param behavior - The behavior instance to add
     * @returns The added behavior (for chaining)
     */
    add<T extends IBehavior>(name: string, behavior: T): T;
    /**
     * Get a behavior by name
     * @param name - Name of the behavior to get
     * @returns The behavior, or undefined if not found
     */
    get<T extends IBehavior>(name: string): T | undefined;
    /**
     * Check if a behavior exists
     * @param name - Name of the behavior to check
     */
    has(name: string): boolean;
    /**
     * Remove a behavior by name
     * @param name - Name of the behavior to remove
     * @returns true if behavior was removed
     */
    remove(name: string): boolean;
    /**
     * Enable a behavior
     * @param name - Name of the behavior to enable
     */
    enable(name: string): void;
    /**
     * Disable a behavior
     * @param name - Name of the behavior to disable
     */
    disable(name: string): void;
    /**
     * Toggle a behavior's enabled state
     * @param name - Name of the behavior to toggle
     * @returns The new enabled state, or undefined if behavior not found
     */
    toggle(name: string): boolean | undefined;
    /**
     * Update all enabled behaviors
     * Call this in the entity's update method
     */
    update(): void;
    /**
     * Remove all behaviors
     */
    clear(): void;
    /**
     * Get all behavior names
     */
    getNames(): string[];
    /**
     * Get all behaviors
     */
    getAll(): IBehavior[];
}
