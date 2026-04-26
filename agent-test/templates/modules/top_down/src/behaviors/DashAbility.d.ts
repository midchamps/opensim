import { BaseBehavior } from './IBehavior';
/**
 * DashAbility configuration
 */
export interface DashAbilityConfig {
    /** Dash speed in pixels per second */
    dashSpeed: number;
    /** Dash duration in milliseconds */
    dashDuration: number;
    /** Cooldown between dashes in milliseconds */
    cooldown: number;
    /**
     * Whether player should be invulnerable during dash (default true).
     * NOTE: This is a FLAG read by the character class (e.g., BasePlayer).
     * DashAbility itself does NOT manage isInvulnerable on the owner.
     * The character class is responsible for granting/revoking invulnerability
     * to avoid conflicts with damage i-frames.
     */
    invulnerable?: boolean;
}
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
export declare class DashAbility extends BaseBehavior {
    dashSpeed: number;
    dashDuration: number;
    cooldown: number;
    /** Flag indicating if dash should grant invulnerability (read by character class) */
    readonly invulnerable: boolean;
    isDashing: boolean;
    private dashTimer?;
    private lastDashTime;
    private dashDirection;
    constructor(config: DashAbilityConfig);
    /**
     * During dash, maintain dash velocity (overrides normal movement)
     */
    update(): void;
    /**
     * Check if dash is available (not currently dashing and cooldown elapsed)
     */
    canDash(): boolean;
    /**
     * Execute a dash in the specified direction
     *
     * @param directionX - X component of dash direction (will be normalized)
     * @param directionY - Y component of dash direction (will be normalized)
     * @returns true if dash started, false if on cooldown or zero direction
     */
    dash(directionX: number, directionY: number): boolean;
    /**
     * End the current dash (called automatically by timer)
     */
    private endDash;
    /**
     * Called when detached - clean up timer
     */
    protected onDetach(): void;
    /**
     * Get time remaining until dash is ready (ms)
     */
    getCooldownRemaining(): number;
    /**
     * Get cooldown progress (0 = on cooldown, 1 = ready)
     */
    getCooldownProgress(): number;
}
