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
    /** Distance at which to stop (too close to target) */
    stopDistance?: number;
    /** Distance at which to give up chase (default: never) */
    giveUpDistance?: number;
}
/**
 * ChaseAI - 2D chase behavior for top-down enemies
 *
 * Unlike the platformer version (which has an optional vertical flag),
 * this always chases in full 2D — natural for top-down games.
 *
 * Features:
 * - Full 2D chase (no gravity considerations)
 * - Optional detection range (only chase when target is close)
 * - Stop distance (maintain distance for ranged enemies)
 * - Give up distance (stop chasing when target is too far)
 * - Hysteresis: once chasing, continues until give-up distance
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
 *   // Check state:
 *   if (chase.isChasing()) {
 *     // Play chase animation
 *   }
 */
export declare class ChaseAI extends BaseBehavior {
    speed: number;
    detectionRange?: number;
    stopDistance: number;
    giveUpDistance?: number;
    target: Phaser.Physics.Arcade.Sprite | null;
    facingDirection: 'left' | 'right' | 'up' | 'down';
    private _isChasing;
    constructor(config: ChaseAIConfig);
    /**
     * Set the target to chase
     */
    setTarget(target: Phaser.Physics.Arcade.Sprite | null): void;
    /**
     * Update chase behavior — moves toward target in 2D
     */
    update(): void;
    /**
     * Determine if should be chasing based on distance and hysteresis
     */
    private shouldChase;
    /**
     * Check if currently chasing target
     */
    isChasing(): boolean;
    /**
     * Get distance to current target
     */
    getDistanceToTarget(): number;
    /**
     * Check if target is within a specific range
     */
    isTargetInRange(range: number): boolean;
}
