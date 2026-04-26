import { BaseBehavior } from './IBehavior';
/**
 * EightWayMovement configuration
 */
export interface EightWayMovementConfig {
    /** Walking speed in pixels per second */
    walkSpeed: number;
    /**
     * Movement friction (0-1, default 1)
     * 1 = instant stop (snappy), lower values = gradual deceleration (slidey)
     */
    friction?: number;
}
/**
 * EightWayMovement - Handles 8-directional movement for top-down characters
 *
 * Features:
 * - 8-directional movement (WASD)
 * - Diagonal speed normalization (prevents faster diagonal movement)
 * - Configurable movement friction
 * - Automatic facing direction update (4-way: up/down/left/right)
 *
 * This behavior does NOT handle input directly — the FSM or scene sets
 * the input direction via setInput(). This keeps input handling separate
 * from movement logic, allowing the same behavior for player and AI.
 *
 * Usage:
 *   const movement = new EightWayMovement({
 *     walkSpeed: 200,
 *     friction: 1, // instant stop
 *   });
 *   this.behaviors.add('movement', movement);
 *
 *   // In FSM or update:
 *   movement.setInput(1, 0);   // Move right
 *   movement.setInput(-1, 1);  // Move down-left (diagonal)
 *   movement.setInput(0, 0);   // Stop
 */
export declare class EightWayMovement extends BaseBehavior {
    walkSpeed: number;
    friction: number;
    private inputX;
    private inputY;
    /** Last movement direction (for facing when input stops) */
    movementDirection: 'left' | 'right' | 'up' | 'down';
    constructor(config: EightWayMovementConfig);
    /**
     * Called every frame — applies velocity based on current input
     */
    update(): void;
    /**
     * Set movement input direction
     * Values should be -1, 0, or 1 per axis (will be clamped via Math.sign)
     *
     * @param x - Horizontal input (-1 = left, 0 = none, 1 = right)
     * @param y - Vertical input (-1 = up, 0 = none, 1 = down)
     */
    setInput(x: number, y: number): void;
    /**
     * Stop all movement input
     */
    stop(): void;
    /**
     * Check if there is any movement input
     */
    isMoving(): boolean;
    /**
     * Get raw input values
     */
    getInput(): {
        x: number;
        y: number;
    };
}
