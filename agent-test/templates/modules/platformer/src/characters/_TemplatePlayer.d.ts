/**
 * ============================================================================
 * TEMPLATE: Player Character
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename to your player class (e.g., Player.ts, Hero.ts)
 * 2. Rename the class (e.g., Player, Hero)
 * 3. Update textureKey to match your asset-pack.json IMAGE key
 * 4. Update stats from gameConfig.json values
 * 5. Update animKeys to match your animations.json keys
 * 6. Optionally override hooks for custom behavior
 *
 * CRITICAL RULES:
 * - textureKey MUST be an IMAGE key, NOT an animation key
 * - Always use playAnimation(), never play() directly
 * - Stats should come from gameConfig.json
 * ============================================================================
 */
import Phaser from 'phaser';
import { BasePlayer, type PlayerConfig } from './BasePlayer';
export declare class _TemplatePlayer extends BasePlayer {
    constructor(scene: Phaser.Scene, x: number, y: number);
    /**
     * Add custom behaviors
     */
    protected initBehaviors(config: PlayerConfig): void;
    /**
     * Initialize ultimate skill (Q key)
     *
     * AVAILABLE SKILL TYPES — pick the one that fits your character:
     *
     * DashAttackSkill       — Linear dash that damages enemies in path
     * AreaDamageSkill       — AOE burst around the player
     * TargetedExecutionSkill — Lock-on to nearest enemy, instant kill
     * TargetedAOESkill      — Lock-on with AOE at target
     * BeamAttackSkill       — Horizontal beam across the screen
     * GroundQuakeSkill      — Ground slam (affects grounded enemies only)
     * BoomerangSkill        — Returning projectile (hammer, shuriken)
     * MultishotSkill        — Fires N projectiles in a spread
     * ArcProjectileSkill    — Gravity arc projectile (boulder, grenade)
     */
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
     * React to health changes
     */
    protected onHealthChanged(oldHealth: number, newHealth: number): void;
    /**
     * Override to customize sounds
     */
    protected initializeSounds(): void;
}
