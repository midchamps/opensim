/**
 * ============================================================================
 * TEMPLATE: Enemy Character (Top-Down)
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename to your enemy class (e.g., Trooper.ts, Droid.ts)
 * 2. Rename the class
 * 3. Update textureKey to match your asset-pack.json IMAGE key
 * 4. Update stats (health, speed, damage)
 * 5. Choose AI type and configure
 * 6. Optionally add combat abilities (melee, ranged)
 *
 * CRITICAL RULES:
 * - textureKey MUST be an IMAGE key, NOT an animation key
 * - Always use playAnimation(), never play() directly
 * - Add to scene.enemies group after creation
 * - For melee bosses, add meleeTrigger to scene.enemyMeleeTriggers
 * - No gravity — top-down view
 * ============================================================================
 */
import Phaser from 'phaser';
import { BaseEnemy, type EnemyConfig } from './BaseEnemy';
export declare class _TemplateEnemy extends BaseEnemy {
    constructor(scene: Phaser.Scene, x: number, y: number);
    /**
     * Add custom behaviors
     *
     * CRITICAL: This method is called DURING super() constructor!
     * Any instance variables initialized AFTER super() will be undefined here.
     * Initialize custom skills INSIDE this method, not after super().
     */
    protected initBehaviors(config: EnemyConfig): void;
    /**
     * Automatic animation selection based on movement state.
     * Return an animation key, or null to manage animations manually in onUpdate.
     */
    protected getAnimationKey(isMoving: boolean, facingDirection: 'left' | 'right' | 'up' | 'down'): string | null;
    /**
     * Custom per-frame update logic
     */
    protected onUpdate(): void;
    /**
     * React to taking damage
     */
    protected onDamageTaken(damage: number): void;
    /**
     * React to death
     */
    protected onDeath(): void;
    /**
     * React to detecting a target for the first time
     */
    protected onAggro(target: Phaser.Physics.Arcade.Sprite): void;
    /**
     * Override to customize sounds.
     * BaseEnemy provides: this.attackSound, this.deathSound
     * Override to reassign these to custom audio keys.
     * DO NOT use this.sounds.xxx — that pattern does not exist!
     */
    protected initializeSounds(): void;
    /**
     * Custom AI logic (when using aiType: 'custom')
     *
     * Use this for boss AI with complex attack patterns.
     *
     * MELEE ATTACK USAGE:
     *   if (this.melee && this.melee.canAttack()) {
     *     this.melee.startAttack();
     *     this.playAnimation('enemy_attack_anim');
     *   }
     *
     * RANGED ATTACK USAGE:
     *   if (this.ranged && this.ranged.canShoot()) {
     *     this.ranged.shootAt(player, 'enemyBullets');
     *   }
     */
    protected executeAI(): void;
}
