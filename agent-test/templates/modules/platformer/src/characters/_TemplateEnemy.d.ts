/**
 * ============================================================================
 * TEMPLATE: Enemy Character
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename to your enemy class (e.g., Slime.ts, Goblin.ts)
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
     *
     * WRONG:
     *   constructor() {
     *     super(scene, x, y, config);
     *     this.mySkill = new Skill();  // Initialized AFTER super()
     *   }
     *   initBehaviors() {
     *     this.behaviors.add('skill', this.mySkill);  // ERROR: mySkill is undefined!
     *   }
     *
     * CORRECT:
     *   initBehaviors() {
     *     this.mySkill = new Skill();  // Initialize HERE
     *     this.behaviors.add('skill', this.mySkill);  // Now it works
     *   }
     */
    protected initBehaviors(config: EnemyConfig): void;
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
/**
 * Example boss configuration with special skills
 * Demonstrates safe JSON import and defensive programming
 *
 * CRITICAL: Use default import for JSON with fallback values!
 * Named imports like `import { bossConfig } from '../gameConfig.json'`
 * can fail in some TypeScript/build configurations.
 */
