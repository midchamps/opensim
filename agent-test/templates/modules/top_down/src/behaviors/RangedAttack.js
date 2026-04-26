import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
import { createProjectileAtAngle, PROJECTILE_SIZES } from '../utils';
/**
 * RangedAttack - Handles 360° ranged combat for top-down characters
 *
 * Unlike the platformer version (left/right only), this shoots at
 * any angle — perfect for twin-stick shooters and top-down RPGs.
 *
 * This behavior manages:
 * - Projectile creation at any angle
 * - Shooting cooldown
 * - Adding projectiles to scene bullet groups
 *
 * Projectiles are added to either playerBullets or enemyBullets group
 * on the scene. Collision detection is handled by BaseLevelScene.
 *
 * Usage:
 *   const ranged = new RangedAttack({
 *     damage: 15,
 *     projectileKey: 'player_bullet',
 *     projectileSpeed: 600,
 *     cooldown: 300,
 *   });
 *   this.behaviors.add('ranged', ranged);
 *
 *   // Shoot at a specific angle (e.g., from FaceTarget.aimAngle):
 *   ranged.shootAtAngle(aimAngle, 'playerBullets');
 *
 *   // Shoot at a target (for AI enemies):
 *   ranged.shootAt(player, 'enemyBullets');
 */
export class RangedAttack extends BaseBehavior {
    // Configuration
    damage;
    projectileKey;
    projectileSpeed;
    projectileSize;
    cooldown;
    spawnDistance;
    // Timing
    lastShootTime = 0;
    constructor(config) {
        super();
        this.damage = config.damage;
        this.projectileKey = config.projectileKey;
        this.projectileSpeed = config.projectileSpeed ?? 600;
        this.projectileSize =
            config.projectileSize ?? PROJECTILE_SIZES.BULLET_SMALL;
        this.cooldown = config.cooldown ?? 500;
        this.spawnDistance = config.spawnDistance ?? 40;
    }
    /**
     * No per-frame update needed for ranged attack
     */
    update() {
        // No continuous update needed
    }
    /**
     * Check if can shoot (cooldown elapsed)
     */
    canShoot() {
        if (this.cooldown <= 0)
            return true;
        const owner = this.getOwner();
        const now = owner.scene.time.now;
        return now - this.lastShootTime >= this.cooldown;
    }
    /**
     * Shoot a projectile at a specific angle
     * This is the primary shooting method for top-down games.
     *
     * @param angle - Launch angle in radians
     * @param bulletGroup - Name of bullet group on scene ('playerBullets' or 'enemyBullets')
     * @returns The created projectile, or null if on cooldown
     */
    shootAtAngle(angle, bulletGroup) {
        if (!this.canShoot())
            return null;
        const owner = this.getOwner();
        const scene = owner.scene;
        // Spawn projectile offset from owner center in the aim direction
        const spawnX = owner.x + Math.cos(angle) * this.spawnDistance;
        const spawnY = owner.y + Math.sin(angle) * this.spawnDistance;
        // Create and launch projectile
        const projectile = createProjectileAtAngle(scene, spawnX, spawnY, this.projectileKey, angle, this.projectileSpeed, this.projectileSize, this.damage);
        // Add to bullet group
        const group = scene[bulletGroup];
        if (group) {
            group.add(projectile);
        }
        // Update timing
        this.lastShootTime = scene.time.now;
        return projectile;
    }
    /**
     * Shoot at a specific target (for AI enemies)
     * Calculates angle from owner to target automatically.
     *
     * @param target - Target to shoot at
     * @param bulletGroup - Name of bullet group on scene
     * @returns The created projectile, or null if on cooldown
     */
    shootAt(target, bulletGroup) {
        const owner = this.getOwner();
        const angle = Phaser.Math.Angle.Between(owner.x, owner.y, target.x, target.y);
        return this.shootAtAngle(angle, bulletGroup);
    }
    /**
     * Get time remaining until can shoot (ms)
     */
    getCooldownRemaining() {
        if (this.cooldown <= 0)
            return 0;
        const owner = this.getOwner();
        const now = owner.scene.time.now;
        const elapsed = now - this.lastShootTime;
        return Math.max(0, this.cooldown - elapsed);
    }
    /**
     * Get cooldown progress (0 to 1, where 1 is ready)
     */
    getCooldownProgress() {
        if (this.cooldown <= 0)
            return 1;
        return 1 - this.getCooldownRemaining() / this.cooldown;
    }
}
//# sourceMappingURL=RangedAttack.js.map