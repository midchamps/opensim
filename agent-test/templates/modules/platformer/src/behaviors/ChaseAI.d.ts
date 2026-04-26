import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
/**
 * ChaseAI configuration
 */
export interface ChaseAIConfig {
    /** Movement speed when chasing in pixels per second */
    speed: number;
    /** Distance at which to start chasing (default: always chase) */
    detectionRange?: number;
    /** Distance at which to stop (too close) */
    stopDistance?: number;
    /** Distance at which to give up chase (default: never) */
    giveUpDistance?: number;
    /** Whether to chase in Y direction as well (for flying enemies) */
    chaseVertical?: boolean;
    /** Vertical speed multiplier when chasing vertically (default 1.0) */
    verticalSpeedMultiplier?: number;
}
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
export declare class ChaseAI extends BaseBehavior {
    speed: number;
    detectionRange?: number;
    stopDistance: number;
    giveUpDistance?: number;
    chaseVertical: boolean;
    verticalSpeedMultiplier: number;
    target: Phaser.Physics.Arcade.Sprite | null;
    facingDirection: 'left' | 'right';
    private _isChasing;
    constructor(config: ChaseAIConfig);
    /**
     * Set the target to chase
     */
    setTarget(target: Phaser.Physics.Arcade.Sprite | null): void;
    /**
     * Update chase behavior
     */
    update(): void;
    /**
     * Determine if should be chasing based on distance
     */
    private shouldChase;
    /**
     * Check if currently chasing target
     */
    isChasing(): boolean;
    /**
     * Get distance to target
     */
    getDistanceToTarget(): number;
    /**
     * Check if target is within a specific range
     */
    isTargetInRange(range: number): boolean;
    /**
     * Check if target is to the left
     */
    isTargetLeft(): boolean;
    /**
     * Check if target is to the right
     */
    isTargetRight(): boolean;
}
