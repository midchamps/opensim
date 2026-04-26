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
    /** Projectile speed in pixels per second */
    projectileSpeed?: number;
    /** Projectile size (uses PROJECTILE_SIZES constants) */
    projectileSize?: number;
    /** Whether projectiles have gravity */
    hasGravity?: boolean;
    /** Cooldown between shots in ms (default 500) */
    cooldown?: number;
    /** Offset from owner center to spawn projectile */
    spawnOffset?: {
        x: number;
        y: number;
    };
}
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
export declare class RangedAttack extends BaseBehavior {
    damage: number;
    projectileKey: string;
    projectileSpeed: number;
    projectileSize: number;
    hasGravity: boolean;
    cooldown: number;
    spawnOffset: {
        x: number;
        y: number;
    };
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
     * Shoot a projectile
     * @param direction - Direction to shoot ('left' or 'right')
     * @param bulletGroup - Name of bullet group on scene ('playerBullets' or 'enemyBullets')
     * @returns The created projectile, or null if on cooldown
     */
    shoot(direction: 'left' | 'right', bulletGroup: 'playerBullets' | 'enemyBullets'): Phaser.Physics.Arcade.Sprite | null;
    /**
     * Shoot at a specific target (for AI enemies)
     * @param target - Target to shoot at
     * @param bulletGroup - Name of bullet group on scene
     * @returns The created projectile, or null if on cooldown
     */
    shootAt(target: Phaser.Physics.Arcade.Sprite, bulletGroup: 'playerBullets' | 'enemyBullets'): Phaser.Physics.Arcade.Sprite | null;
    /**
     * Get time remaining until can shoot (ms)
     */
    getCooldownRemaining(): number;
    /**
     * Get cooldown progress (0 to 1, where 1 is ready)
     */
    getCooldownProgress(): number;
}
