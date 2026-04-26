import Phaser from 'phaser';
import { type WorldPoint } from '../utils';
export interface TDEnemyConfig {
    textureKey: string;
    displayHeight?: number;
    stats: {
        maxHealth: number;
        speed: number;
        /** gold reward on kill */
        reward: number;
        /** lives lost when reaching exit (default: 1) */
        damage?: number;
    };
}
export interface StatusEffect {
    id: string;
    speedMultiplier: number;
    duration: number;
    elapsed: number;
    tint?: number;
}
export declare class BaseTDEnemy extends Phaser.Physics.Arcade.Sprite {
    protected config: TDEnemyConfig;
    protected _maxHealth: number;
    protected _currentHealth: number;
    protected baseSpeed: number;
    protected reward: number;
    protected exitDamage: number;
    protected waypoints: WorldPoint[];
    protected _currentWaypointIndex: number;
    protected isDead: boolean;
    private statusEffects;
    private healthBar?;
    private healthBarBg?;
    constructor(scene: Phaser.Scene, x: number, y: number, config: TDEnemyConfig);
    get health(): number;
    get maxHealth(): number;
    get currentWaypointIndex(): number;
    /** Effective speed after all status effect multipliers */
    get effectiveSpeed(): number;
    /** 0 = at spawn, 1 = at exit. Used by tower targeting ('first'/'last') */
    get pathProgress(): number;
    /** Gold reward when this enemy is killed */
    get killReward(): number;
    /**
     * Initialize the path for this enemy to follow.
     * Called by BaseTDScene after spawning.
     */
    setPath(waypoints: WorldPoint[]): void;
    update(time: number, delta: number): void;
    private moveAlongPath;
    private updateAnimation;
    takeDamage(damage: number): void;
    private die;
    private reachEnd;
    private destroySelf;
    /**
     * Apply a status effect (e.g., slow). If the same id is already active,
     * the duration is refreshed (not stacked).
     */
    applyStatusEffect(id: string, speedMultiplier: number, duration: number, tint?: number): void;
    hasStatusEffect(id: string): boolean;
    private updateStatusEffects;
    private updateTintFromEffects;
    private createHealthBar;
    private updateHealthBar;
    /** Called when the enemy is spawned and path is set */
    protected onSpawn(): void;
    /** Called when the enemy takes damage */
    protected onDamageTaken(_damage: number): void;
    /** Called when the enemy health reaches 0 */
    protected onDeath(): void;
    /** Called when the enemy reaches the last waypoint */
    protected onReachEnd(): void;
    /** Called when a status effect is applied */
    protected onStatusEffectApplied(_effectId: string): void;
    /** Called when a status effect expires */
    protected onStatusEffectRemoved(_effectId: string): void;
    /**
     * Return an animation key based on facing direction.
     * Override to provide directional walking animations.
     */
    protected getAnimationKey(_direction: 'left' | 'right' | 'up' | 'down'): string | null;
}
