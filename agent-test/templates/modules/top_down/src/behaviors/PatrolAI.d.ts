import { BaseBehavior } from './IBehavior';
/**
 * PatrolAI configuration
 */
export interface PatrolAIConfig {
    /** Movement speed in pixels per second */
    speed: number;
    /** Rectangular patrol area (optional — if not set, walks in current direction) */
    patrolArea?: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    /** Time between random direction changes in ms (default 2000) */
    directionChangeInterval?: number;
}
/**
 * PatrolAI - 2D patrol behavior for top-down enemies
 *
 * Unlike the platformer patrol (left/right with cliff detection), this
 * patrols freely in 2D space within an optional rectangular area.
 *
 * Features:
 * - Random 2D wandering within optional patrol bounds
 * - Periodic direction changes
 * - Automatic turn-around at patrol boundaries
 * - Facing direction output for animations
 *
 * Usage:
 *   const patrol = new PatrolAI({
 *     speed: 60,
 *     patrolArea: { minX: 100, maxX: 500, minY: 100, maxY: 400 },
 *     directionChangeInterval: 3000,
 *   });
 *   this.behaviors.add('patrol', patrol);
 */
export declare class PatrolAI extends BaseBehavior {
    speed: number;
    patrolArea?: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    directionChangeInterval: number;
    facingDirection: 'left' | 'right' | 'up' | 'down';
    private moveDirection;
    private lastDirectionChangeTime;
    constructor(config: PatrolAIConfig);
    /**
     * Update patrol behavior
     */
    update(): void;
    /**
     * Pick a random 2D direction to walk in
     */
    private pickRandomDirection;
    /**
     * Set the patrol area
     */
    setPatrolArea(minX: number, maxX: number, minY: number, maxY: number): void;
    /**
     * Reverse direction
     */
    turnAround(): void;
}
