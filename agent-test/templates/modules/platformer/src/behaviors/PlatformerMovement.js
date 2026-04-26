import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
/**
 * PlatformerMovement - Handles horizontal movement and jumping for platformer characters
 *
 * Features:
 * - Horizontal movement with configurable speed
 * - Jumping with configurable power
 * - Air control (reduced speed while airborne)
 * - Coyote time (grace period for jumping after leaving platform)
 * - Jump buffering (queued jump when pressing jump before landing)
 *
 * Usage:
 *   const movement = new PlatformerMovement({
 *     walkSpeed: 200,
 *     jumpPower: 600,
 *     coyoteTime: 100,
 *     jumpBufferTime: 80,
 *   });
 *   this.behaviors.add('movement', movement);
 *
 *   // In FSM states:
 *   movement.move(1);  // Move right
 *   movement.move(-1); // Move left
 *   movement.move(0);  // Stop
 *   movement.jump();   // Jump
 */
export class PlatformerMovement extends BaseBehavior {
    // Configuration
    walkSpeed;
    jumpPower;
    airControl;
    coyoteTime;
    jumpBufferTime;
    maxFallSpeed;
    doubleJumpEnabled;
    doubleJumpPower;
    // Internal state
    lastGroundedTime = 0;
    jumpBufferedTime = 0;
    hasJumpedThisAirTime = false;
    hasUsedDoubleJump = false;
    constructor(config) {
        super();
        this.walkSpeed = config.walkSpeed;
        this.jumpPower = config.jumpPower;
        this.airControl = config.airControl ?? 0.8;
        this.coyoteTime = config.coyoteTime ?? 0;
        this.jumpBufferTime = config.jumpBufferTime ?? 0;
        this.maxFallSpeed = config.maxFallSpeed ?? 800;
        this.doubleJumpEnabled = config.doubleJumpEnabled ?? false;
        this.doubleJumpPower = config.doubleJumpPower ?? config.jumpPower;
    }
    /**
     * Called every frame - updates coyote time and jump buffer tracking
     */
    update() {
        const owner = this.getOwner();
        const body = owner.body;
        if (!body)
            return;
        const now = owner.scene.time.now;
        // Track when we were last on ground
        if (body.onFloor()) {
            this.lastGroundedTime = now;
            this.hasJumpedThisAirTime = false;
            this.hasUsedDoubleJump = false;
        }
        // Clamp fall speed
        if (body.velocity.y > this.maxFallSpeed) {
            body.setVelocityY(this.maxFallSpeed);
        }
        // Process buffered jump
        if (this.jumpBufferTime > 0 && this.jumpBufferedTime > 0) {
            if (now - this.jumpBufferedTime <= this.jumpBufferTime &&
                this.canJump()) {
                this.executeJump();
                this.jumpBufferedTime = 0;
            }
            else if (now - this.jumpBufferedTime > this.jumpBufferTime) {
                this.jumpBufferedTime = 0;
            }
        }
    }
    /**
     * Move horizontally
     * @param direction -1 for left, 0 for stop, 1 for right
     */
    move(direction) {
        const owner = this.getOwner();
        const body = owner.body;
        if (!body)
            return;
        // Calculate speed based on whether airborne
        const speed = body.onFloor()
            ? this.walkSpeed
            : this.walkSpeed * this.airControl;
        owner.setVelocityX(direction * speed);
    }
    /**
     * Attempt to jump
     * @returns true if jump was executed, false if buffered or failed
     */
    jump() {
        if (this.canJump()) {
            this.executeJump();
            return true;
        }
        // Buffer the jump if we have jump buffering enabled
        if (this.jumpBufferTime > 0) {
            const owner = this.getOwner();
            this.jumpBufferedTime = owner.scene.time.now;
        }
        return false;
    }
    /**
     * Check if jump is currently possible
     */
    canJump() {
        const owner = this.getOwner();
        const body = owner.body;
        if (!body)
            return false;
        // Can always jump if on floor
        if (body.onFloor()) {
            return true;
        }
        // Can jump during coyote time (counts as a ground jump)
        if (this.coyoteTime > 0 && !this.hasJumpedThisAirTime) {
            const now = owner.scene.time.now;
            if (now - this.lastGroundedTime <= this.coyoteTime) {
                return true;
            }
        }
        // Double jump: allowed once while airborne if enabled
        if (this.doubleJumpEnabled &&
            this.hasJumpedThisAirTime &&
            !this.hasUsedDoubleJump) {
            return true;
        }
        return false;
    }
    /**
     * Check if character is on the ground
     */
    isGrounded() {
        const owner = this.getOwner();
        const body = owner.body;
        return body?.onFloor() ?? false;
    }
    /**
     * Check if character is falling (moving downward)
     */
    isFalling() {
        const owner = this.getOwner();
        const body = owner.body;
        return (body?.velocity.y ?? 0) > 0;
    }
    /**
     * Check if character is rising (moving upward)
     */
    isRising() {
        const owner = this.getOwner();
        const body = owner.body;
        return (body?.velocity.y ?? 0) < 0;
    }
    /**
     * Execute the actual jump
     */
    executeJump() {
        const owner = this.getOwner();
        const body = owner.body;
        if (!body)
            return;
        if (this.hasJumpedThisAirTime &&
            this.doubleJumpEnabled &&
            !this.hasUsedDoubleJump) {
            body.setVelocityY(-this.doubleJumpPower);
            this.hasUsedDoubleJump = true;
        }
        else {
            body.setVelocityY(-this.jumpPower);
            this.hasJumpedThisAirTime = true;
        }
    }
    /**
     * Reset coyote time tracking (call when taking damage, etc.)
     */
    resetCoyoteTime() {
        this.lastGroundedTime = 0;
    }
}
//# sourceMappingURL=PlatformerMovement.js.map