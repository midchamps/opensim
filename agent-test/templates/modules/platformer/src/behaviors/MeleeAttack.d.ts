import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
/**
 * MeleeAttack configuration
 */
export interface MeleeAttackConfig {
    /** Damage dealt per hit */
    damage: number;
    /** Attack range (forward distance in pixels) */
    range?: number;
    /** Attack width (perpendicular to direction in pixels) */
    width?: number;
    /** Cooldown between attacks in ms (default 0) */
    cooldown?: number;
}
/**
 * MeleeAttack - Handles melee combat for characters
 *
 * This behavior manages:
 * - Melee trigger zone (attack hitbox)
 * - Attack cooldown
 * - Tracking of targets hit in current attack
 *
 * The actual collision detection is handled by BaseLevelScene.
 * This behavior provides the melee trigger and tracks attack state.
 *
 * Usage:
 *   const melee = new MeleeAttack({ damage: 25, range: 100, width: 80 });
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
     * Update melee trigger position based on facing direction
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
