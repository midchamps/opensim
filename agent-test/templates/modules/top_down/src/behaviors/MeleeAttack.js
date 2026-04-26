import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
import { createTrigger, updateMeleeTrigger } from '../utils';
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
export class MeleeAttack extends BaseBehavior {
    // Configuration
    damage;
    range;
    width;
    cooldown;
    // State
    isAttacking = false;
    currentTargets = new Set();
    meleeTrigger;
    // Timing
    lastAttackTime = 0;
    constructor(config) {
        super();
        this.damage = config.damage;
        this.range = config.range ?? 80;
        this.width = config.width ?? 60;
        this.cooldown = config.cooldown ?? 0;
    }
    /**
     * Called when attached to owner - create melee trigger
     */
    onAttach() {
        const owner = this.getOwner();
        this.meleeTrigger = createTrigger(owner.scene, owner, 0, 0, this.range, this.width);
    }
    /**
     * Called when detached - destroy melee trigger
     */
    onDetach() {
        if (this.meleeTrigger) {
            this.meleeTrigger.destroy();
        }
    }
    /**
     * Update melee trigger position based on owner's facing direction (4-way)
     */
    update() {
        if (!this.meleeTrigger)
            return;
        const owner = this.getOwner();
        const facingDirection = owner.facingDirection ?? 'down';
        updateMeleeTrigger(owner, this.meleeTrigger, facingDirection, this.range, this.width);
    }
    /**
     * Check if attack is ready (cooldown elapsed)
     */
    canAttack() {
        if (this.isAttacking)
            return false;
        if (this.cooldown <= 0)
            return true;
        const owner = this.getOwner();
        const now = owner.scene.time.now;
        return now - this.lastAttackTime >= this.cooldown;
    }
    /**
     * Start an attack
     * @returns true if attack started, false if on cooldown
     */
    startAttack() {
        if (!this.canAttack())
            return false;
        const owner = this.getOwner();
        this.isAttacking = true;
        this.currentTargets.clear();
        this.lastAttackTime = owner.scene.time.now;
        return true;
    }
    /**
     * End the current attack
     * Call this when attack animation completes
     */
    endAttack() {
        this.isAttacking = false;
        this.currentTargets.clear();
    }
    /**
     * Register a target as hit (prevents multi-hit in same attack)
     * @param target - The target that was hit
     * @returns true if this is a new hit, false if already hit
     */
    registerHit(target) {
        if (this.currentTargets.has(target)) {
            return false;
        }
        this.currentTargets.add(target);
        return true;
    }
    /**
     * Check if a target has been hit in current attack
     */
    hasHit(target) {
        return this.currentTargets.has(target);
    }
    /**
     * Get the melee trigger for collision detection
     */
    getTrigger() {
        return this.meleeTrigger;
    }
    /**
     * Get time remaining until attack is ready (ms)
     */
    getCooldownRemaining() {
        if (this.cooldown <= 0)
            return 0;
        const owner = this.getOwner();
        const now = owner.scene.time.now;
        const elapsed = now - this.lastAttackTime;
        return Math.max(0, this.cooldown - elapsed);
    }
}
//# sourceMappingURL=MeleeAttack.js.map