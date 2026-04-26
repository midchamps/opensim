import { BaseBehavior } from './IBehavior';
/**
 * PatrolAI configuration
 */
export interface PatrolAIConfig {
    /** Movement speed in pixels per second */
    speed: number;
    /** Minimum patrol X position (optional - uses cliff detection if not set) */
    minX?: number;
    /** Maximum patrol X position (optional - uses cliff detection if not set) */
    maxX?: number;
    /** Delay before changing direction in ms (default 500) */
    directionChangeDelay?: number;
    /** Distance ahead to check for cliffs in pixels (default 32) */
    cliffCheckDistance?: number;
    /** Whether to detect and turn at cliffs (default true) */
    detectCliffs?: boolean;
}
/**
 * PatrolAI - Simple patrol behavior for enemies
 *
 * This behavior makes an enemy walk back and forth.
 * It can use either:
 * 1. Fixed patrol bounds (minX/maxX) - turns at specified positions
 * 2. Cliff detection - turns when about to walk off a platform
 *
 * Usage:
 *   const patrol = new PatrolAI({
 *     speed: 80,
 *     detectCliffs: true,
 *   });
 *   this.behaviors.add('patrol', patrol);
 *
 *   // In update or AI logic:
 *   patrol.update(); // Handles movement and turning
 */
export declare class PatrolAI extends BaseBehavior {
    speed: number;
    minX?: number;
    maxX?: number;
    directionChangeDelay: number;
    cliffCheckDistance: number;
    detectCliffs: boolean;
    facingDirection: 'left' | 'right';
    private lastDirectionChangeTime;
    constructor(config: PatrolAIConfig);
    /**
     * Called when attached - sync with owner's facing direction if it has one
     */
    protected onAttach(): void;
    /**
     * Update patrol behavior
     */
    update(): void;
    /**
     * Check if there's a cliff ahead
     */
    private checkCliff;
    /**
     * Set patrol bounds
     */
    setBounds(minX: number, maxX: number): void;
    /**
     * Force direction change
     */
    turnAround(): void;
    /**
     * Set facing direction
     */
    setDirection(direction: 'left' | 'right'): void;
}
