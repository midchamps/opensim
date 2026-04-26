import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
import * as utils from '../utils';
/**
 * RangedAttack - Handles ranged combat (shooting) for characters
 *
 * This behavior manages:
 * - Projectile creation and configuration
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
 *   // When shooting:
 *   if (ranged.canShoot()) {
 *     ranged.shoot('right', 'playerBullets');
 *   }
 */
export class RangedAttack extends BaseBehavior {
    // Configuration
    damage;
    projectileKey;
    projectileSpeed;
    projectileSize;
    hasGravity;
    cooldown;
    spawnOffset;
    // Timing
    lastShootTime = 0;
    constructor(config) {
        super();
        this.damage = config.damage;
        this.projectileKey = config.projectileKey;
        this.projectileSpeed = config.projectileSpeed ?? 600;
        this.projectileSize =
            config.projectileSize ?? utils.PROJECTILE_SIZES.BULLET_SMALL;
        this.hasGravity = config.hasGravity ?? false;
        this.cooldown = config.cooldown ?? 500;
        this.spawnOffset = config.spawnOffset ?? { x: 50, y: 0 };
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
     * Shoot a projectile
     * @param direction - Direction to shoot ('left' or 'right')
     * @param bulletGroup - Name of bullet group on scene ('playerBullets' or 'enemyBullets')
     * @returns The created projectile, or null if on cooldown
     */
    shoot(direction, bulletGroup) {
        if (!this.canShoot())
            return null;
        const owner = this.getOwner();
        const scene = owner.scene;
        const body = owner.body;
        // Calculate spawn position
        const dirMultiplier = direction === 'right' ? 1 : -1;
        const spawnX = owner.x + this.spawnOffset.x * dirMultiplier;
        const spawnY = owner.y - (body?.height ?? 0) * 0.5 + this.spawnOffset.y;
        // Ensure fallback bullet textures exist
        utils.createBulletTextures(scene);
        // Resolve texture key — fall back to generic bullet if configured key is missing
        let textureKey = this.projectileKey;
        if (!scene.textures.exists(textureKey)) {
            textureKey =
                bulletGroup === 'playerBullets' ? 'player_bullet' : 'enemy_bullet';
        }
        const projectile = utils.createProjectile(scene, spawnX, spawnY, textureKey, this.projectileSize, this.hasGravity, this.damage);
        // Set velocity
        projectile.setVelocityX(this.projectileSpeed * dirMultiplier);
        // Store direction for knockback calculation
        projectile.direction = dirMultiplier;
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
     * @param target - Target to shoot at
     * @param bulletGroup - Name of bullet group on scene
     * @returns The created projectile, or null if on cooldown
     */
    shootAt(target, bulletGroup) {
        const owner = this.getOwner();
        const direction = target.x < owner.x ? 'left' : 'right';
        return this.shoot(direction, bulletGroup);
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