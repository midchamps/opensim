import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
import { angleToDirection } from '../utils';
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
export class FaceTarget extends BaseBehavior {
    // Configuration
    useMouseAim;
    rotateSprite;
    // State
    /** Current aim angle in radians */
    aimAngle = 0;
    /** Current 4-direction facing derived from aimAngle */
    facingDirection = 'down';
    constructor(config) {
        super();
        this.useMouseAim = config?.useMouseAim ?? true;
        this.rotateSprite = config?.rotateSprite ?? false;
    }
    /**
     * Update aim direction from mouse position each frame
     */
    update() {
        const owner = this.getOwner();
        if (!owner.scene)
            return;
        if (this.useMouseAim) {
            const pointer = owner.scene.input.activePointer;
            const worldPoint = owner.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.aimAngle = Phaser.Math.Angle.Between(owner.x, owner.y, worldPoint.x, worldPoint.y);
        }
        // Update 4-direction facing from angle
        this.facingDirection = angleToDirection(this.aimAngle);
        // Optionally rotate sprite directly
        if (this.rotateSprite) {
            owner.setRotation(this.aimAngle);
        }
    }
    /**
     * Manually aim at a specific world position
     * Useful for AI enemies or overriding mouse aim
     *
     * @param x - Target world X
     * @param y - Target world Y
     */
    aimAt(x, y) {
        const owner = this.getOwner();
        this.aimAngle = Phaser.Math.Angle.Between(owner.x, owner.y, x, y);
        this.facingDirection = angleToDirection(this.aimAngle);
    }
    /**
     * Get a normalized aim direction vector
     * Useful for projectile velocity calculation
     */
    getAimVector() {
        return {
            x: Math.cos(this.aimAngle),
            y: Math.sin(this.aimAngle),
        };
    }
}
//# sourceMappingURL=FaceTarget.js.map