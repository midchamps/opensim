import { BaseBehavior } from './IBehavior';
/**
 * FaceTarget configuration
 */
export interface FaceTargetConfig {
    /**
     * Whether to track mouse position for aiming (default true)
     * When true, the behavior continuously tracks the mouse world position
     * and updates facingDirection accordingly.
     */
    useMouseAim?: boolean;
    /**
     * Whether to rotate the sprite to face the aim angle (default false)
     * When false, uses 4-direction facing + flipX for left/right.
     * When true, directly rotates the sprite (useful for vehicles/turrets).
     */
    rotateSprite?: boolean;
}
/**
 * FaceTarget - Handles aiming and facing direction for top-down characters
 *
 * This behavior tracks a target (mouse or entity) and updates the owner's
 * facing direction. It's the core aiming system for top-down games.
 *
 * Features:
 * - Mouse tracking (converts screen position to world position via camera)
 * - Manual aim override via aimAt()
 * - 4-direction facing output (up/down/left/right)
 * - Optional sprite rotation mode
 * - Provides aim angle and aim vector for projectile direction
 *
 * Usage:
 *   const faceTarget = new FaceTarget({ useMouseAim: true });
 *   this.behaviors.add('faceTarget', faceTarget);
 *
 *   // Read aim state:
 *   faceTarget.facingDirection; // 'left' | 'right' | 'up' | 'down'
 *   faceTarget.aimAngle;       // radians
 *   faceTarget.getAimVector();  // { x: cos, y: sin }
 */
export declare class FaceTarget extends BaseBehavior {
    useMouseAim: boolean;
    rotateSprite: boolean;
    /** Current aim angle in radians */
    aimAngle: number;
    /** Current 4-direction facing derived from aimAngle */
    facingDirection: 'left' | 'right' | 'up' | 'down';
    constructor(config?: FaceTargetConfig);
    /**
     * Update aim direction from mouse position each frame
     */
    update(): void;
    /**
     * Manually aim at a specific world position
     * Useful for AI enemies or overriding mouse aim
     *
     * @param x - Target world X
     * @param y - Target world Y
     */
    aimAt(x: number, y: number): void;
    /**
     * Get a normalized aim direction vector
     * Useful for projectile velocity calculation
     */
    getAimVector(): {
        x: number;
        y: number;
    };
}
