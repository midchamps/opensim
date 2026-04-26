import { BaseBehavior } from './IBehavior';
/**
 * PlatformerMovement configuration
 */
export interface PlatformerMovementConfig {
    /** Walking speed in pixels per second */
    walkSpeed: number;
    /** Jump force (negative Y velocity) */
    jumpPower: number;
    /** Air control multiplier (0-1, default 0.8) */
    airControl?: number;
    /** Coyote time in ms - allows jumping shortly after leaving platform (default 0) */
    coyoteTime?: number;
    /** Jump buffer time in ms - queues jump if pressed shortly before landing (default 0) */
    jumpBufferTime?: number;
    /** Maximum fall speed (default 800) */
    maxFallSpeed?: number;
    /** Enable double jump — allows one extra jump while airborne (default false) */
    doubleJumpEnabled?: boolean;
    /** Double jump power — if not set, uses jumpPower */
    doubleJumpPower?: number;
}
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
export declare class PlatformerMovement extends BaseBehavior {
    walkSpeed: number;
    jumpPower: number;
    airControl: number;
    coyoteTime: number;
    jumpBufferTime: number;
    maxFallSpeed: number;
    doubleJumpEnabled: boolean;
    doubleJumpPower: number;
    private lastGroundedTime;
    private jumpBufferedTime;
    private hasJumpedThisAirTime;
    private hasUsedDoubleJump;
    constructor(config: PlatformerMovementConfig);
    /**
     * Called every frame - updates coyote time and jump buffer tracking
     */
    update(): void;
    /**
     * Move horizontally
     * @param direction -1 for left, 0 for stop, 1 for right
     */
    move(direction: -1 | 0 | 1): void;
    /**
     * Attempt to jump
     * @returns true if jump was executed, false if buffered or failed
     */
    jump(): boolean;
    /**
     * Check if jump is currently possible
     */
    canJump(): boolean;
    /**
     * Check if character is on the ground
     */
    isGrounded(): boolean;
    /**
     * Check if character is falling (moving downward)
     */
    isFalling(): boolean;
    /**
     * Check if character is rising (moving upward)
     */
    isRising(): boolean;
    /**
     * Execute the actual jump
     */
    private executeJump;
    /**
     * Reset coyote time tracking (call when taking damage, etc.)
     */
    resetCoyoteTime(): void;
}
