import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
/**
 * DashAbility - Handles dash/dodge mechanic for top-down characters
 *
 * Features:
 * - Direction-based dash (toward movement direction)
 * - Configurable speed, duration, and cooldown
 * - Optional invulnerability frames (i-frames) during dash
 * - Cooldown management with progress tracking
 *
 * The dash direction is provided by the caller (usually from movement input
 * or facing direction). During the dash, this behavior overrides the owner's
 * velocity and optionally sets invulnerability.
 *
 * Usage:
 *   const dash = new DashAbility({
 *     dashSpeed: 500,
 *     dashDuration: 200,
 *     cooldown: 1000,
 *   });
 *   this.behaviors.add('dash', dash);
 *
 *   // When dash input is pressed:
 *   if (dash.canDash()) {
 *     dash.dash(directionX, directionY);
 *   }
 */
export class DashAbility extends BaseBehavior {
    // Configuration
    dashSpeed;
    dashDuration;
    cooldown;
    /** Flag indicating if dash should grant invulnerability (read by character class) */
    invulnerable;
    // State
    isDashing = false;
    dashTimer;
    lastDashTime = 0;
    dashDirection = { x: 0, y: 0 };
    constructor(config) {
        super();
        this.dashSpeed = config.dashSpeed;
        this.dashDuration = config.dashDuration;
        this.cooldown = config.cooldown;
        this.invulnerable = config.invulnerable ?? true;
    }
    /**
     * During dash, maintain dash velocity (overrides normal movement)
     */
    update() {
        if (this.isDashing) {
            const owner = this.getOwner();
            owner.setVelocity(this.dashDirection.x * this.dashSpeed, this.dashDirection.y * this.dashSpeed);
        }
    }
    /**
     * Check if dash is available (not currently dashing and cooldown elapsed)
     */
    canDash() {
        if (this.isDashing)
            return false;
        const owner = this.getOwner();
        const now = owner.scene.time.now;
        return now - this.lastDashTime >= this.cooldown;
    }
    /**
     * Execute a dash in the specified direction
     *
     * @param directionX - X component of dash direction (will be normalized)
     * @param directionY - Y component of dash direction (will be normalized)
     * @returns true if dash started, false if on cooldown or zero direction
     */
    dash(directionX, directionY) {
        if (!this.canDash())
            return false;
        // Normalize direction vector
        const len = Math.sqrt(directionX * directionX + directionY * directionY);
        if (len === 0)
            return false;
        this.dashDirection.x = directionX / len;
        this.dashDirection.y = directionY / len;
        const owner = this.getOwner();
        this.isDashing = true;
        this.lastDashTime = owner.scene.time.now;
        // NOTE: Invulnerability is managed by the character class (BasePlayer),
        // NOT here. This avoids conflicts with damage i-frames.
        // Schedule dash end
        this.dashTimer = owner.scene.time.delayedCall(this.dashDuration, () => {
            this.endDash();
        });
        return true;
    }
    /**
     * End the current dash (called automatically by timer)
     */
    endDash() {
        if (!this.isDashing)
            return;
        this.isDashing = false;
        const owner = this.getOwner();
        owner.setVelocity(0, 0);
        // NOTE: Invulnerability cleanup is handled by the character class
        // (BasePlayer.performDash monitors dash completion)
    }
    /**
     * Called when detached - clean up timer
     */
    onDetach() {
        if (this.dashTimer) {
            this.dashTimer.destroy();
            this.dashTimer = undefined;
        }
        this.isDashing = false;
    }
    /**
     * Get time remaining until dash is ready (ms)
     */
    getCooldownRemaining() {
        if (this.cooldown <= 0)
            return 0;
        const owner = this.getOwner();
        const elapsed = owner.scene.time.now - this.lastDashTime;
        return Math.max(0, this.cooldown - elapsed);
    }
    /**
     * Get cooldown progress (0 = on cooldown, 1 = ready)
     */
    getCooldownProgress() {
        if (this.cooldown <= 0)
            return 1;
        return 1 - this.getCooldownRemaining() / this.cooldown;
    }
}
//# sourceMappingURL=DashAbility.js.map