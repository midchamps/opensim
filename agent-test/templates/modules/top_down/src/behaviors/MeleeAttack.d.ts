import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
/**
 * MeleeAttack configuration
 */
export interface MeleeAttackConfig {
    /** Damage dealt per hit */
    damage: number;
    /** Attack range (forward distance in pixels, default 80) */
    range?: number;
    /** Attack width (perpendicular to direction in pixels, default 60) */
    width?: number;
    /** Cooldown between attacks in ms (default 0) */
    cooldown?: number;
}
/**
 * MeleeAttack - Handles 360° melee combat for top-down characters
 *
 * This behavior manages:
 * - Melee trigger zone (attack hitbox) positioned in 4 directions
 * - Attack cooldown
 * - Tracking of targets hit in current attack
 *
 * The trigger zone is repositioned each frame based on the owner's
 * facingDirection (up/down/left/right). This gives 360° coverage
 * in 4-directional discrete steps.
 *
 * The actual collision detection is handled by BaseLevelScene.
 * This behavior provides the melee trigger and tracks attack state.
 *
 * Usage:
 *   const melee = new MeleeAttack({ damage: 25, range: 80, width: 60 });
 *   this.behaviors.add('melee', melee);
 *
 *   // When attacking:
 *   if (melee.canAttack()) {
 *     melee.startAttack();
 *   }
 *
 *   // After attack animation completes:
 *   melee.endAttack();
 */
export declare class MeleeAttack extends BaseBehavior {
    damage: number;
    range: number;
    width: number;
    cooldown: number;
    isAttacking: boolean;
    currentTargets: Set<any>;
    meleeTrigger: Phaser.GameObjects.Zone;
    private lastAttackTime;
    constructor(config: MeleeAttackConfig);
    /**
     * Called when attached to owner - create melee trigger
     */
    protected onAttach(): void;
    /**
     * Called when detached - destroy melee trigger
     */
    protected onDetach(): void;
    /**
     * Update melee trigger position based on owner's facing direction (4-way)
     */
    update(): void;
    /**
     * Check if attack is ready (cooldown elapsed)
     */
    canAttack(): boolean;
    /**
     * Start an attack
     * @returns true if attack started, false if on cooldown
     */
    startAttack(): boolean;
    /**
     * End the current attack
     * Call this when attack animation completes
     */
    endAttack(): void;
    /**
     * Register a target as hit (prevents multi-hit in same attack)
     * @param target - The target that was hit
     * @returns true if this is a new hit, false if already hit
     */
    registerHit(target: any): boolean;
    /**
     * Check if a target has been hit in current attack
     */
    hasHit(target: any): boolean;
    /**
     * Get the melee trigger for collision detection
     */
    getTrigger(): Phaser.GameObjects.Zone;
    /**
     * Get time remaining until attack is ready (ms)
     */
    getCooldownRemaining(): number;
}
