/**
 * ============================================================================
 * TEMPLATE: Player Character (Top-Down)
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename to your player class (e.g., Player.ts, Mando.ts)
 * 2. Rename the class (e.g., Player, Mando)
 * 3. Update textureKey to match your asset-pack.json IMAGE key (use {name}_idle_front)
 * 4. Update stats from gameConfig.json values
 * 5. Update animKeys to match your animations.json BASE keys (e.g., {name}_idle_anim)
 * 6. KEEP the playAnimation() override — it maps base keys to directional variants
 * 7. Optionally override other hooks for custom behavior
 *
 * CRITICAL RULES:
 * - textureKey MUST be an IMAGE key, NOT an animation key
 * - Always use playAnimation(), never play() directly
 * - Stats should come from gameConfig.json
 * - No gravity in top-down — body.setAllowGravity(false) is already set
 * ============================================================================
 */
import Phaser from 'phaser';
import { BasePlayer, type PlayerConfig } from './BasePlayer';
export declare class _TemplatePlayer extends BasePlayer {
    constructor(scene: Phaser.Scene, x: number, y: number);
    /**
     * Resolve base animation key to directional variant based on facingDirection.
     *
     * Mapping: 'down' → '_front', 'up' → '_back', 'left'|'right' → '_side'
     * Example: 'player_idle_anim' + facing 'up' → 'player_idle_back_anim'
     *
     * Falls back to the base key if directional variant doesn't exist (e.g., die_back_anim).
     * flipX for left/right is handled automatically by BasePlayer.update().
     */
    playAnimation(animKey: string): void;
    /**
     * Add custom behaviors
     */
    protected initBehaviors(config: PlayerConfig): void;
    /**
     * Initialize special abilities
     */
    protected initAbilities(): void;
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
     * React to dash start
     */
    protected onDashUsed(): void;
    /**
     * React to dash end
     */
    protected onDashComplete(): void;
    /**
     * React to ranged attack fired
     */
    protected onShoot(bullet: Phaser.Physics.Arcade.Sprite | null): void;
    /**
     * React to melee attack start
     */
    protected onMeleeStart(): void;
    /**
     * Override to customize sounds.
     * BasePlayer provides: this.attackSound, this.hurtSound, this.shootSound, this.dashSound
     * Override to reassign these to custom audio keys.
     * DO NOT use this.sounds.xxx — that pattern does not exist!
     */
    protected initializeSounds(): void;
}
