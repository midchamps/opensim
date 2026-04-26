import Phaser from 'phaser';
import type { IBehavior } from './IBehavior';
/**
 * Base skill configuration
 */
export interface SkillConfig {
    /** Skill unique identifier */
    id: string;
    /** Skill display name */
    name: string;
    /** Cooldown time in milliseconds */
    cooldown: number;
    /** Charge animation key (played before skill executes) */
    chargeAnimKey?: string;
    /** Sound effect key */
    soundKey?: string;
}
/**
 * Skill execution context
 */
export interface SkillContext {
    /** The scene reference */
    scene: Phaser.Scene;
    /** The owner (player) who activated the skill */
    owner: any;
    /** Facing direction of the owner */
    facingDirection: 'left' | 'right';
    /** Enemies group from the scene */
    enemies?: Phaser.GameObjects.Group;
    /** Callback when skill execution completes */
    onComplete?: () => void;
}
/**
 * SkillBehavior - Abstract base class for all skill behaviors
 *
 * Provides:
 * - Cooldown management
 * - Basic flow: canUse() -> use() -> executeSkill() -> onComplete
 *
 * SKILL FLOW:
 * 1. Button press
 * 2. canUse() check (cooldown)
 * 3. Lock state (owner.isUsingUltimate = true)
 * 4. Stop movement
 * 5. Play charge animation (optional)
 * 6. ANIMATION_COMPLETE event
 * 7. Execute skill logic
 * 8. Unlock state
 */
export declare abstract class SkillBehavior implements IBehavior {
    config: SkillConfig;
    enabled: boolean;
    protected lastUseTime: number;
    protected isExecuting: boolean;
    protected owner: any;
    protected scene?: Phaser.Scene;
    constructor(config: SkillConfig);
    attach(owner: any): void;
    detach(): void;
    update(): void;
    canUse(): boolean;
    getCooldownRemaining(): number;
    getCooldownProgress(): number;
    resetCooldown(): void;
    use(context: SkillContext): boolean;
    protected abstract executeSkill(context: SkillContext, onComplete: () => void): void;
    protected getActiveEnemies(context: SkillContext): any[];
    protected findNearestEnemy(context: SkillContext): any;
    protected findEnemiesInRange(context: SkillContext, range: number): any[];
}
/**
 * DashAttackSkill configuration
 */
export interface DashAttackConfig extends SkillConfig {
    /** Dash distance in pixels (default: 300) */
    dashDistance?: number;
    /** Dash duration in ms (default: 400) */
    dashDuration?: number;
    /** Hit detection range (default: 80) */
    hitRange?: number;
    /** Damage per hit (default: 50) */
    damage?: number;
    /** Horizontal knockback force (default: 350) */
    knockbackForceX?: number;
    /** Vertical knockback force (default: -150) */
    knockbackForceY?: number;
    /** Screen shake config */
    screenShake?: {
        duration: number;
        intensity: number;
    };
    /** Trail effect image key (optional) */
    trailEffectKey?: string;
    /** Trail effect tint color (optional) */
    trailTint?: number;
    /** Warning duration before dash (for boss attacks) */
    warningDuration?: number;
    /** Warning effect image key (flashing indicator) */
    warningEffectKey?: string;
    /** Warning tint color (default: 0xff0000 red) */
    warningTint?: number;
}
/**
 * DashAttackSkill - Linear dash attack with optional warning phase
 *
 * Style: Charge-up dash, energy trail, high-speed burst
 *
 * FLOW:
 * 1. (Optional) Warning phase with flashing indicator
 * 2. Stop movement, play charge animation
 * 3. On animation complete: execute dash
 * 4. Dash uses tweens (not physics velocity)
 * 5. onUpdate checks collisions each frame
 * 6. Apply damage + knockback to enemies in range
 * 7. Screen shake on complete
 */
export declare class DashAttackSkill extends SkillBehavior {
    dashDistance: number;
    dashDuration: number;
    hitRange: number;
    damage: number;
    knockbackForceX: number;
    knockbackForceY: number;
    screenShake: {
        duration: number;
        intensity: number;
    };
    trailEffectKey?: string;
    trailTint?: number;
    warningDuration: number;
    warningEffectKey?: string;
    warningTint: number;
    private hitTargets;
    private warningEffect?;
    constructor(config: DashAttackConfig);
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
    /**
     * Show warning effect before dash (useful for boss attacks)
     * Creates a flashing indicator to warn the player
     */
    private showWarning;
    private performDash;
    private checkCollisions;
}
/**
 * TargetedExecutionSkill configuration
 */
export interface TargetedExecutionConfig extends SkillConfig {
    /** Effect image key (e.g., 'vortex_effect') */
    effectKey: string;
    /** Delay before execution in ms (default: 1000) */
    executionDelay?: number;
    /** Total skill duration in ms (default: 2500) */
    totalDuration?: number;
    /** Screen shake config */
    screenShake?: {
        duration: number;
        intensity: number;
    };
    /** Enemy death animation key (optional) */
    enemyDeathAnimKey?: string;
}
/**
 * TargetedExecutionSkill - Auto-target and instantly execute nearest enemy
 *
 * Style: Dark magic, time-space distortion, instant death effect
 *
 * FLOW:
 * 1. Find nearest enemy - if none, abort
 * 2. Lock state, play animation
 * 3. Create vortex effect at enemy position
 * 4. Strong screen shake
 * 5. After delay: instant kill (health=0, isDead=true)
 * 6. Effect fades, state unlocks
 */
export declare class TargetedExecutionSkill extends SkillBehavior {
    effectKey: string;
    executionDelay: number;
    totalDuration: number;
    screenShake: {
        duration: number;
        intensity: number;
    };
    enemyDeathAnimKey?: string;
    private vortexEffect?;
    constructor(config: TargetedExecutionConfig);
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
    private executeTarget;
}
/**
 * AreaDamageSkill configuration
 */
export interface AreaDamageConfig extends SkillConfig {
    /** Effect image key (e.g., 'explosion_effect') */
    effectKey: string;
    /** Attack range radius (default: 250) */
    attackRange?: number;
    /** Damage to enemies (default: 80) */
    damage?: number;
    /** Horizontal knockback force (default: 400) */
    knockbackForceX?: number;
    /** Vertical knockback force (default: -200) */
    knockbackForceY?: number;
    /** Screen shake config */
    screenShake?: {
        duration: number;
        intensity: number;
    };
    /** Charge effect key (spinning effect during charge) */
    chargeEffectKey?: string;
}
/**
 * AreaDamageSkill - AOE damage centered on player position
 *
 * Style: Energy burst, shockwave, radial explosion
 *
 * FLOW:
 * 1. Lock state, play charge animation
 * 2. Create spinning charge effect (optional)
 * 3. On animation complete: execute AOE
 * 4. Create explosion effect
 * 5. Find all enemies in range
 * 6. Apply damage + knockback to all
 * 7. Screen shake
 */
export declare class AreaDamageSkill extends SkillBehavior {
    effectKey: string;
    attackRange: number;
    damage: number;
    knockbackForceX: number;
    knockbackForceY: number;
    screenShake: {
        duration: number;
        intensity: number;
    };
    chargeEffectKey?: string;
    private chargeEffect?;
    constructor(config: AreaDamageConfig);
    /**
     * Create charge effect (call during charge animation)
     * Returns the effect so owner can track/destroy it
     */
    createChargeEffect(context: SkillContext): Phaser.GameObjects.Image | undefined;
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
}
/**
 * TargetedAOESkill configuration
 */
export interface TargetedAOEConfig extends SkillConfig {
    /** Effect image key (e.g., 'lightning_bolt', 'meteor_strike') */
    effectKey: string;
    /** AOE radius around target (default: 200) */
    aoeRadius?: number;
    /** Damage to all enemies in AOE (default: 70) */
    damage?: number;
    /** Delay before damage is applied (default: 300ms) */
    strikeDelay?: number;
    /** Effect scale (default: 0.6) */
    effectScale?: number;
    /** Effect tint (optional) */
    effectTint?: number;
    /** Horizontal knockback force (default: 300) */
    knockbackForceX?: number;
    /** Vertical knockback force (default: -150) */
    knockbackForceY?: number;
    /** Screen shake */
    screenShake?: {
        duration: number;
        intensity: number;
    };
    /** Total skill duration (default: 1000ms) */
    totalDuration?: number;
}
/**
 * TargetedAOESkill - Lock nearest enemy, AOE damage at their position
 *
 * Style: Lightning strike, meteor, orbital bombardment
 *
 * Key difference from AreaDamageSkill:
 * - AreaDamageSkill: AOE centered on PLAYER
 * - TargetedAOESkill: AOE centered on TARGET ENEMY
 *
 * FLOW:
 * 1. Find nearest enemy (if none, abort)
 * 2. Create strike effect at enemy position
 * 3. After delay, deal AOE damage to all enemies near that position
 * 4. Screen shake
 */
export declare class TargetedAOESkill extends SkillBehavior {
    effectKey: string;
    aoeRadius: number;
    damage: number;
    strikeDelay: number;
    effectScale: number;
    effectTint?: number;
    knockbackForceX: number;
    knockbackForceY: number;
    screenShake: {
        duration: number;
        intensity: number;
    };
    totalDuration: number;
    constructor(config: TargetedAOEConfig);
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
    private createStrikeEffect;
    /**
     * Apply AOE damage to all enemies near the strike position
     * (NOT centered on player, centered on TARGET)
     */
    private applyAOEDamage;
}
/**
 * BeamAttackSkill configuration
 */
export interface BeamAttackConfig extends SkillConfig {
    /** Beam image key (or use rectangle if not provided) */
    beamKey: string;
    /** Beam width (height of the image) in pixels (default: 64) */
    beamWidth?: number;
    /** Beam length/range in pixels (default: 800) */
    beamLength?: number;
    /** Damage to each enemy hit (default: 40) */
    damage?: number;
    /** Beam duration (how long it stays visible, default: 500ms) */
    beamDuration?: number;
    /** Beam tint color (optional) */
    beamTint?: number;
    /** Whether beam goes through all enemies or stops at first (default: true) */
    penetrating?: boolean;
    /** Screen shake */
    screenShake?: {
        duration: number;
        intensity: number;
    };
}
/**
 * BeamAttackSkill - Horizontal beam that damages enemies in path
 *
 * Style: Laser beam, energy ray, wide-range projectile
 *
 * FLOW:
 * 1. Create horizontal beam visual from player
 * 2. Find all enemies intersecting the beam rectangle
 * 3. Apply damage to all (or first if not penetrating)
 * 4. Beam fades out with shrink effect
 */
export declare class BeamAttackSkill extends SkillBehavior {
    beamKey: string;
    beamWidth: number;
    beamLength: number;
    damage: number;
    beamDuration: number;
    beamTint?: number;
    penetrating: boolean;
    screenShake: {
        duration: number;
        intensity: number;
    };
    constructor(config: BeamAttackConfig);
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
    private findEnemiesInBeam;
}
/**
 * GroundQuakeSkill configuration
 */
export interface GroundQuakeConfig extends SkillConfig {
    /** Effect image key */
    effectKey: string;
    /** Damage to grounded enemies (default: 100) */
    damage?: number;
    /** Horizontal knockback force (default: 300) */
    knockbackForceX?: number;
    /** Vertical knockback force (default: -250) */
    knockbackForceY?: number;
    /** Screen shake (strong for ground pound) */
    screenShake?: {
        duration: number;
        intensity: number;
    };
    /** Effect spread distance from player (default: 400) */
    effectRange?: number;
    /** Number of ground crack effects (default: 4) */
    effectCount?: number;
}
/**
 * GroundQuakeSkill - Ground pound that damages only grounded enemies
 *
 * Style: Seismic slam, ground pound, shockwave
 *
 * Key feature: Only affects enemies touching the ground
 * (Airborne enemies are immune)
 *
 * FLOW:
 * 1. Player slams ground (animation handled by FSM)
 * 2. Create ground crack effects spreading outward
 * 3. Strong screen shake
 * 4. Find all enemies currently on the ground
 * 5. Apply heavy damage + vertical knockback (launch them)
 */
export declare class GroundQuakeSkill extends SkillBehavior {
    effectKey: string;
    damage: number;
    knockbackForceX: number;
    knockbackForceY: number;
    screenShake: {
        duration: number;
        intensity: number;
    };
    effectRange: number;
    effectCount: number;
    constructor(config: GroundQuakeConfig);
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
    private createGroundEffects;
    /**
     * Find enemies that are currently on the ground
     * Uses body.blocked.down or body.onFloor() check
     */
    private findGroundedEnemies;
}
/**
 * BoomerangSkill configuration
 */
export interface BoomerangConfig extends SkillConfig {
    /** Projectile texture key */
    projectileKey: string;
    /** Forward throw speed in px/s (default: 500) */
    throwSpeed?: number;
    /** Return speed in px/s (default: 600) */
    returnSpeed?: number;
    /** Max travel distance before returning (default: 400) */
    maxDistance?: number;
    /** Damage per hit (default: 40) */
    damage?: number;
    /** Rotation speed in deg/s (default: 720) */
    rotationSpeed?: number;
    /** Projectile display width (default: 50) */
    projectileSize?: number;
    /** Screen shake on throw */
    screenShake?: {
        duration: number;
        intensity: number;
    };
}
/**
 * BoomerangSkill - Projectile that travels forward then returns to owner
 *
 * Style: Thrown weapon that comes back (hammer, shuriken, boomerang)
 *
 * FLOW:
 * 1. Create projectile, launch in facing direction
 * 2. After reaching maxDistance (or a timer), reverse toward owner
 * 3. Deals damage to every enemy it touches (once per enemy per throw)
 * 4. Projectile destroyed when it returns close to the owner
 *
 * The skill needs per-frame updates to steer the returning projectile,
 * so it overrides update() from IBehavior.
 */
export declare class BoomerangSkill extends SkillBehavior {
    projectileKey: string;
    throwSpeed: number;
    returnSpeed: number;
    maxDistance: number;
    damage: number;
    rotationSpeed: number;
    projectileSize: number;
    screenShake: {
        duration: number;
        intensity: number;
    };
    private projectile?;
    private isReturning;
    private hitTargets;
    private rotationTween?;
    constructor(config: BoomerangConfig);
    update(): void;
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
    private destroyProjectile;
}
/**
 * MultishotSkill configuration
 */
export interface MultishotConfig extends SkillConfig {
    /** Projectile texture key */
    projectileKey: string;
    /** Number of projectiles (default: 3) */
    projectileCount?: number;
    /** Spread angle in degrees (default: 30 — total arc) */
    spreadAngle?: number;
    /** Projectile speed in px/s (default: 400) */
    projectileSpeed?: number;
    /** Damage per projectile (default: 25) */
    damage?: number;
    /** Projectile lifetime in ms (default: 2000) */
    projectileLifetime?: number;
    /** Projectile display size (default: 30) */
    projectileSize?: number;
    /** Screen shake */
    screenShake?: {
        duration: number;
        intensity: number;
    };
}
/**
 * MultishotSkill - Fires multiple projectiles in a spread pattern
 *
 * Style: Spread shot, missile volley, shotgun blast
 *
 * FLOW:
 * 1. Calculate N angle offsets distributed across spreadAngle
 * 2. Create one projectile per angle
 * 3. Each projectile moves in its own direction
 * 4. Auto-destroy after projectileLifetime
 *
 * Projectiles are added to the scene's playerBullets group so
 * BaseLevelScene's collision system handles damage automatically.
 */
export declare class MultishotSkill extends SkillBehavior {
    projectileKey: string;
    projectileCount: number;
    spreadAngle: number;
    projectileSpeed: number;
    damage: number;
    projectileLifetime: number;
    projectileSize: number;
    screenShake: {
        duration: number;
        intensity: number;
    };
    constructor(config: MultishotConfig);
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
}
/**
 * ArcProjectileSkill configuration
 */
export interface ArcProjectileConfig extends SkillConfig {
    /** Projectile texture key */
    projectileKey: string;
    /** Horizontal launch speed in px/s (default: 400) */
    launchSpeedX?: number;
    /** Vertical launch speed in px/s — negative = upward (default: -200) */
    launchSpeedY?: number;
    /** Damage on hit (default: 50) */
    damage?: number;
    /** Projectile gravity (default: 400) */
    gravity?: number;
    /** Projectile display size (default: 50) */
    projectileSize?: number;
    /** Rotation speed in deg per full tween loop (default: 360) */
    rotationSpeed?: number;
    /** Projectile lifetime in ms (default: 3000) */
    projectileLifetime?: number;
    /** Whether to show explosion on expiry/ground hit (default: true) */
    hasExplosion?: boolean;
    /** Explosion AOE radius — damages enemies within this range on impact (default: 0, no AOE) */
    explosionRadius?: number;
    /** Screen shake */
    screenShake?: {
        duration: number;
        intensity: number;
    };
}
/**
 * ArcProjectileSkill - Fires a projectile with gravity for parabolic trajectory
 *
 * Style: Boulder throw, grenade lob, mortar strike
 *
 * FLOW:
 * 1. Create projectile with initial velocity (forward + upward)
 * 2. Gravity pulls it into an arc
 * 3. On ground hit or timeout: optional explosion effect
 * 4. If explosionRadius > 0, damages all enemies in that radius
 *
 * The projectile is added to playerBullets so BaseLevelScene handles
 * direct-hit collision. The explosion AOE is a separate check.
 */
export declare class ArcProjectileSkill extends SkillBehavior {
    projectileKey: string;
    launchSpeedX: number;
    launchSpeedY: number;
    damage: number;
    gravity: number;
    projectileSize: number;
    rotationSpeed: number;
    projectileLifetime: number;
    hasExplosion: boolean;
    explosionRadius: number;
    screenShake: {
        duration: number;
        intensity: number;
    };
    constructor(config: ArcProjectileConfig);
    protected executeSkill(context: SkillContext, onComplete: () => void): void;
    private onProjectileImpact;
}
