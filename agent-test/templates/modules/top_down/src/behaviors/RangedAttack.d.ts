import Phaser from 'phaser';
import { BaseBehavior } from './IBehavior';
/**
 * RangedAttack configuration
 */
export interface RangedAttackConfig {
    /** Damage dealt per projectile */
    damage: number;
    /** Projectile texture key */
    projectileKey: string;
    /** Projectile speed in pixels per second (default 600) */
    projectileSpeed?: number;
    /** Projectile display size in pixels (use PROJECTILE_SIZES, default BULLET_SMALL) */
    projectileSize?: number;
    /** Cooldown between shots in ms (default 500) */
    cooldown?: number;
    /** Distance from owner center to spawn projectile (default 40) */
    spawnDistance?: number;
}
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
export declare class RangedAttack extends BaseBehavior {
    damage: number;
    projectileKey: string;
    projectileSpeed: number;
    projectileSize: number;
    cooldown: number;
    spawnDistance: number;
    private lastShootTime;
    constructor(config: RangedAttackConfig);
    /**
     * No per-frame update needed for ranged attack
     */
    update(): void;
    /**
     * Check if can shoot (cooldown elapsed)
     */
    canShoot(): boolean;
    /**
     * Shoot a projectile at a specific angle
     * This is the primary shooting method for top-down games.
     *
     * @param angle - Launch angle in radians
     * @param bulletGroup - Name of bullet group on scene ('playerBullets' or 'enemyBullets')
     * @returns The created projectile, or null if on cooldown
     */
    shootAtAngle(angle: number, bulletGroup: 'playerBullets' | 'enemyBullets'): Phaser.Physics.Arcade.Sprite | null;
    /**
     * Shoot at a specific target (for AI enemies)
     * Calculates angle from owner to target automatically.
     *
     * @param target - Target to shoot at
     * @param bulletGroup - Name of bullet group on scene
     * @returns The created projectile, or null if on cooldown
     */
    shootAt(target: {
        x: number;
        y: number;
    }, bulletGroup: 'playerBullets' | 'enemyBullets'): Phaser.Physics.Arcade.Sprite | null;
    /**
     * Get time remaining until can shoot (ms)
     */
    getCooldownRemaining(): number;
    /**
     * Get cooldown progress (0 to 1, where 1 is ready)
     */
    getCooldownProgress(): number;
}
