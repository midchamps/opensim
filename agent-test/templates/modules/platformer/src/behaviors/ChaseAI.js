import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
/**
 * ChaseAI - Chase behavior for enemies
 *
 * This behavior makes an enemy chase a target (usually the player).
 * It can optionally:
 * - Only start chasing when target is within detection range
 * - Stop at a minimum distance from target
 * - Give up chase when target is too far
 * - Chase vertically (for flying enemies)
 *
 * Usage:
 *   const chase = new ChaseAI({
 *     speed: 100,
 *     detectionRange: 300,
 *     stopDistance: 50,
 *   });
 *   this.behaviors.add('chase', chase);
 *   chase.setTarget(player);
 *
 *   // In update:
 *   if (chase.isChasing()) {
 *     // Maybe play chase animation
 *   }
 */
export class ChaseAI extends BaseBehavior {
    // Configuration
    speed;
    detectionRange;
    stopDistance;
    giveUpDistance;
    chaseVertical;
    verticalSpeedMultiplier;
    // State
    target = null;
    facingDirection = 'right';
    _isChasing = false;
    constructor(config) {
        super();
        this.speed = config.speed;
        this.detectionRange = config.detectionRange;
        this.stopDistance = config.stopDistance ?? 0;
        this.giveUpDistance = config.giveUpDistance;
        this.chaseVertical = config.chaseVertical ?? false;
        this.verticalSpeedMultiplier = config.verticalSpeedMultiplier ?? 1.0;
    }
    /**
     * Set the target to chase
     */
    setTarget(target) {
        this.target = target;
    }
    /**
     * Update chase behavior
     */
    update() {
        const owner = this.getOwner();
        // No target or target inactive
        if (!this.target || !this.target.active) {
            this._isChasing = false;
            owner.setVelocityX(0);
            if (this.chaseVertical) {
                owner.setVelocityY(0);
            }
            return;
        }
        // Calculate distance to target
        const distance = Phaser.Math.Distance.Between(owner.x, owner.y, this.target.x, this.target.y);
        // Check if should chase
        const shouldChase = this.shouldChase(distance);
        if (!shouldChase) {
            this._isChasing = false;
            owner.setVelocityX(0);
            if (this.chaseVertical) {
                owner.setVelocityY(0);
            }
            return;
        }
        this._isChasing = true;
        // Calculate direction to target
        const dx = this.target.x - owner.x;
        const dy = this.target.y - owner.y;
        // Update facing direction
        this.facingDirection = dx < 0 ? 'left' : 'right';
        // Sync owner's facing direction if it has one
        if ('facingDirection' in owner) {
            owner.facingDirection = this.facingDirection;
        }
        // Check if too close
        if (distance <= this.stopDistance) {
            owner.setVelocityX(0);
            if (this.chaseVertical) {
                owner.setVelocityY(0);
            }
            return;
        }
        // Apply horizontal movement
        const dirX = dx > 0 ? 1 : -1;
        owner.setVelocityX(dirX * this.speed);
        // Apply vertical movement if enabled
        if (this.chaseVertical) {
            const dirY = dy > 0 ? 1 : -1;
            owner.setVelocityY(dirY * this.speed * this.verticalSpeedMultiplier);
        }
    }
    /**
     * Determine if should be chasing based on distance
     */
    shouldChase(distance) {
        // Check give up distance (too far)
        if (this.giveUpDistance !== undefined && distance > this.giveUpDistance) {
            return false;
        }
        // Check detection range (not close enough to start)
        if (this.detectionRange !== undefined && distance > this.detectionRange) {
            // If already chasing and still within give up distance, continue
            if (this._isChasing &&
                (this.giveUpDistance === undefined || distance <= this.giveUpDistance)) {
                return true;
            }
            return false;
        }
        return true;
    }
    /**
     * Check if currently chasing target
     */
    isChasing() {
        return this._isChasing;
    }
    /**
     * Get distance to target
     */
    getDistanceToTarget() {
        if (!this.target)
            return Infinity;
        const owner = this.getOwner();
        return Phaser.Math.Distance.Between(owner.x, owner.y, this.target.x, this.target.y);
    }
    /**
     * Check if target is within a specific range
     */
    isTargetInRange(range) {
        return this.getDistanceToTarget() <= range;
    }
    /**
     * Check if target is to the left
     */
    isTargetLeft() {
        if (!this.target)
            return false;
        const owner = this.getOwner();
        return this.target.x < owner.x;
    }
    /**
     * Check if target is to the right
     */
    isTargetRight() {
        if (!this.target)
            return false;
        const owner = this.getOwner();
        return this.target.x > owner.x;
    }
}
//# sourceMappingURL=ChaseAI.js.map