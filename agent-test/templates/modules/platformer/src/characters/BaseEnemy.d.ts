import Phaser from 'phaser';
import { BehaviorManager, PatrolAI, ChaseAI, MeleeAttack, RangedAttack } from '../behaviors';
/**
 * Enemy AI type
 */
export type EnemyAIType = 'patrol' | 'chase' | 'stationary' | 'custom';
/**
 * Enemy configuration interface
 */
export interface EnemyConfig {
    /** Texture key for initial frame (must be IMAGE key from asset-pack.json) */
    textureKey: string;
    /** Display name shown in boss health bar UI (optional) */
    displayName?: string;
    /** Display height in pixels (default 80) */
    displayHeight?: number;
    /** Body width factor (0-1, default 0.7) */
    bodyWidthFactor?: number;
    /** Body height factor (0-1, default 0.8) */
    bodyHeightFactor?: number;
    /** Whether enemy is affected by gravity (default true) */
    hasGravity?: boolean;
    /** Enemy stats */
    stats: {
        maxHealth: number;
        speed: number;
        damage: number;
    };
    /** AI configuration */
    ai?: {
        type: EnemyAIType;
        /** For patrol: min/max X bounds */
        patrolMinX?: number;
        patrolMaxX?: number;
        /** For chase: detection range, give up distance */
        detectionRange?: number;
        giveUpDistance?: number;
        stopDistance?: number;
        /** For flying enemies */
        chaseVertical?: boolean;
    };
    /**
     * Visual offset Y to sink sprite into ground (in pixels, positive = sink down)
     *
     * AI-generated sprites often have extra whitespace above the character.
     * This offset compensates by moving the physics body UP, making the sprite
     * visually sink so feet touch the ground.
     *
     * Default: 50. Set to 0 to disable.
     */
    verticalVisualOffset?: number;
    /** Combat configuration */
    combat?: {
        /** Enable melee attacks */
        hasMelee?: boolean;
        meleeRange?: number;
        meleeWidth?: number;
        meleeCooldown?: number;
        /** Enable ranged attacks */
        hasRanged?: boolean;
        rangedKey?: string;
        rangedRange?: number;
        rangedCooldown?: number;
    };
}
/**
 * BaseEnemy - Foundation class for enemy characters in platformer games
 *
 * This class provides:
 * - Integration with BehaviorManager for AI and combat
 * - Health and damage system
 * - Various AI modes (patrol, chase, stationary)
 * - Hooks for customization
 *
 * HOOK METHODS (override in subclass):
 * - initBehaviors(config): Add custom behaviors
 * - onUpdate(): Custom per-frame logic
 * - onDamageTaken(damage): React to taking damage
 * - onDeath(): React to dying
 * - executeAI(): Custom AI logic (called when not using built-in AI)
 *
 * Usage:
 *   export class Slime extends BaseEnemy {
 *     constructor(scene, x, y) {
 *       super(scene, x, y, {
 *         textureKey: 'slime_idle_frame1',
 *         stats: { maxHealth: 50, speed: 80, damage: 15 },
 *         ai: { type: 'patrol' },
 *       });
 *     }
 *   }
 */
export declare abstract class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;
    /** Behavior manager for this enemy */
    behaviors: BehaviorManager;
    /** Patrol AI behavior (optional) */
    patrol?: PatrolAI;
    /** Chase AI behavior (optional) */
    chase?: ChaseAI;
    /** Melee attack behavior (optional) */
    melee?: MeleeAttack;
    /** Ranged attack behavior (optional) */
    ranged?: RangedAttack;
    /** Current facing direction */
    facingDirection: 'left' | 'right';
    /** Movement speed */
    speed: number;
    /** Damage dealt to player */
    damage: number;
    /** Visual offset Y to sink sprite into ground (pixels) */
    verticalVisualOffset: number;
    /** Is enemy dead */
    isDead: boolean;
    /** Is enemy in hurt state */
    isHurting: boolean;
    /** Is enemy attacking */
    isAttacking: boolean;
    /** Maximum health */
    maxHealth: number;
    /** Current health */
    health: number;
    /** AI type */
    aiType: EnemyAIType;
    /** Target (usually player) */
    target?: Phaser.Physics.Arcade.Sprite;
    /** Display name for boss health bar UI */
    displayName?: string;
    /** Melee trigger zone (from MeleeAttack behavior) */
    get meleeTrigger(): Phaser.GameObjects.Zone | undefined;
    /** Targets hit in current melee attack */
    get currentMeleeTargets(): Set<any>;
    deathSound?: Phaser.Sound.BaseSound;
    attackSound?: Phaser.Sound.BaseSound;
    constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig);
    /**
     * Set up AI behaviors based on configuration
     */
    private setupAI;
    /**
     * Set up combat behaviors based on configuration
     */
    private setupCombat;
    /**
     * HOOK: Initialize custom behaviors
     * Override this to add additional behaviors
     *
     * CRITICAL TIMING: This method is called DURING the super() constructor,
     * BEFORE the rest of the subclass constructor executes.
     *
     * Therefore, any instance variables you initialize AFTER super() will be
     * undefined when this method runs.
     *
     * Solution: Initialize custom behaviors/skills INSIDE this method, not in constructor.
     *
     * @example
     * // CORRECT - initialize skill inside initBehaviors:
     * protected initBehaviors(config: EnemyConfig): void {
     *   this.mySkill = new DashAttackSkill({ ... });
     *   this.behaviors.add('dash', this.mySkill);
     * }
     */
    protected initBehaviors(config: EnemyConfig): void;
    /**
     * HOOK: Called every frame after standard update
     * Override this to add custom per-frame logic
     */
    protected onUpdate(): void;
    /**
     * HOOK: Called when enemy takes damage
     * Override this to add custom damage reactions
     */
    protected onDamageTaken(damage: number): void;
    /**
     * HOOK: Called when enemy dies
     * Override this to add custom death logic (drops, effects, etc.)
     */
    protected onDeath(): void;
    /**
     * HOOK: Custom AI logic
     * Override this when using aiType: 'custom'
     */
    protected executeAI(): void;
    /**
     * Play animation and reset origin/offset
     */
    playAnimation(animKey: string): void;
    /**
     * Main update method - call every frame from scene
     */
    update(): void;
    /**
     * Try to perform ranged attack if possible
     */
    private tryRangedAttack;
    /**
     * Set the target for this enemy (usually the player)
     */
    setTarget(target: Phaser.Physics.Arcade.Sprite): void;
    /**
     * Set patrol bounds
     */
    setPatrolBounds(minX: number, maxX: number): void;
    /**
     * Take damage from an attack
     */
    takeDamage(damage: number): void;
    /**
     * Kill this enemy
     */
    die(): void;
    /**
     * Get health as percentage (0-100)
     */
    getHealthPercentage(): number;
    /**
     * Initialize sound effects
     */
    protected initializeSounds(): void;
}
