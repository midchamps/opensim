import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
import { angleToDirection } from '../utils';
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
export class EightWayMovement extends BaseBehavior {
    // Configuration
    walkSpeed;
    friction;
    // Current input direction (-1, 0, or 1 per axis)
    inputX = 0;
    inputY = 0;
    /** Last movement direction (for facing when input stops) */
    movementDirection = 'down';
    constructor(config) {
        super();
        this.walkSpeed = config.walkSpeed;
        this.friction = config.friction ?? 1;
    }
    /**
     * Called every frame — applies velocity based on current input
     */
    update() {
        const owner = this.getOwner();
        const body = owner.body;
        if (!body)
            return;
        let targetVX = this.inputX * this.walkSpeed;
        let targetVY = this.inputY * this.walkSpeed;
        // Diagonal normalization — prevent faster diagonal movement
        if (this.inputX !== 0 && this.inputY !== 0) {
            const factor = 1 / Math.SQRT2;
            targetVX *= factor;
            targetVY *= factor;
        }
        // Apply velocity (with optional friction smoothing)
        if (this.friction >= 1) {
            owner.setVelocity(targetVX, targetVY);
        }
        else {
            body.velocity.x = Phaser.Math.Linear(body.velocity.x, targetVX, this.friction);
            body.velocity.y = Phaser.Math.Linear(body.velocity.y, targetVY, this.friction);
        }
        // Update movement direction (only when actively moving)
        if (this.inputX !== 0 || this.inputY !== 0) {
            const angle = Math.atan2(this.inputY, this.inputX);
            this.movementDirection = angleToDirection(angle);
        }
    }
    /**
     * Set movement input direction
     * Values should be -1, 0, or 1 per axis (will be clamped via Math.sign)
     *
     * @param x - Horizontal input (-1 = left, 0 = none, 1 = right)
     * @param y - Vertical input (-1 = up, 0 = none, 1 = down)
     */
    setInput(x, y) {
        this.inputX = Math.sign(x);
        this.inputY = Math.sign(y);
    }
    /**
     * Stop all movement input
     */
    stop() {
        this.inputX = 0;
        this.inputY = 0;
    }
    /**
     * Check if there is any movement input
     */
    isMoving() {
        return this.inputX !== 0 || this.inputY !== 0;
    }
    /**
     * Get raw input values
     */
    getInput() {
        return { x: this.inputX, y: this.inputY };
    }
}
//# sourceMappingURL=EightWayMovement.js.map