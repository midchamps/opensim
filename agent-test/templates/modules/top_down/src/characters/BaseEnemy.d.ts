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
    /** Display height in pixels (default 64 = 1 tile; use 80 for boss) */
    displayHeight?: number;
    /** Body width factor (0-1, default 0.5) — narrow for top-down foot hitbox */
    bodyWidthFactor?: number;
    /** Body height factor (0-1, default 0.4) — short for top-down foot hitbox */
    bodyHeightFactor?: number;
    /** Enemy stats */
    stats: {
        maxHealth: number;
        speed: number;
        damage: number;
    };
    /** AI configuration */
    ai?: {
        type: EnemyAIType;
        /** For patrol: rectangular area bounds */
        patrolArea?: {
            minX: number;
            maxX: number;
            minY: number;
            maxY: number;
        };
        /** For patrol: ms between direction changes (default 2000) */
        directionChangeInterval?: number;
        /** For chase: detection range */
        detectionRange?: number;
        /** For chase: give up distance */
        giveUpDistance?: number;
        /** For chase: stop distance (maintain distance for ranged enemies) */
        stopDistance?: number;
    };
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
        rangedCooldown?: number;
    };
}
/**
 * BaseEnemy - Foundation class for enemy characters in top-down games
 *
 * KEY DIFFERENCES FROM PLATFORMER:
 *   - No gravity (top-down view, setAllowGravity(false))
 *   - 4-direction facing (up/down/left/right)
 *   - PatrolAI wanders in 2D area (not just left/right)
 *   - ChaseAI always chases in 2D (no chaseVertical flag needed)
 *   - Body positioned at sprite feet for Y-sort
 *
 * This class provides:
 * - Integration with BehaviorManager for AI and combat
 * - Health and damage system
 * - Various AI modes (patrol, chase, stationary, custom)
 * - Hooks for customization
 *
 * HOOK METHODS (override in subclass):
 * - initBehaviors(config): Add custom behaviors
 * - onUpdate(): Custom per-frame logic
 * - onDamageTaken(damage): React to taking damage
 * - onDeath(): React to dying
 * - executeAI(): Custom AI logic (called when using aiType: 'custom')
 *
 * Usage:
 *   export class Trooper extends BaseEnemy {
 *     constructor(scene, x, y) {
 *       super(scene, x, y, {
 *         textureKey: 'trooper_idle_frame1',
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
    /** Current facing direction (4-way) */
    facingDirection: 'left' | 'right' | 'up' | 'down';
    /** Movement speed */
    speed: number;
    /** Damage dealt to player */
    damage: number;
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
     */
    protected initBehaviors(config: EnemyConfig): void;
    /**
     * HOOK: Called every frame after standard update
     */
    protected onUpdate(): void;
    /**
     * HOOK: Called when enemy takes damage
     */
    protected onDamageTaken(damage: number): void;
    /**
     * HOOK: Called when enemy dies
     */
    protected onDeath(): void;
    /**
     * HOOK: Custom AI logic (when using aiType: 'custom')
     */
    protected executeAI(): void;
    /**
     * HOOK: Get animation key for the current state.
     * Override to provide idle/walk/attack/directional animations.
     *
     * Default returns null (no animation management by base class).
     * Return an animation key string to have BaseEnemy play it automatically.
     *
     * @param isMoving - Whether the enemy is currently moving
     * @param facingDirection - Current facing direction
     * @returns Animation key to play, or null to skip
     *
     * @example
     *   protected override getAnimationKey(isMoving: boolean): string | null {
     *     if (this.isDead) return 'enemy_die_anim';
     *     return isMoving ? 'enemy_walk_anim' : 'enemy_idle_anim';
     *   }
     */
    protected getAnimationKey(isMoving: boolean, facingDirection: 'left' | 'right' | 'up' | 'down'): string | null;
    /**
     * HOOK: Called when enemy switches to chase mode (e.g., player detected).
     * Useful for playing alert sound effects or changing appearance.
     */
    protected onAggro(target: Phaser.Physics.Arcade.Sprite): void;
    /**
     * Play animation and reset origin/offset
     */
    playAnimation(animKey: string): void;
    /**
     * Main update method — call every frame from scene.
     *
     * UPDATE ORDER (intentional):
     *   1. Behaviors update — AI sets velocity & facing, melee trigger repositions
     *   2. Sync facingDirection from AI behaviors
     *   3. Custom AI / ranged attack logic
     *   4. Visual updates (flipX, animation, resetOriginAndOffset)
     *   5. onUpdate() hook
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
     * Set patrol area
     */
    setPatrolArea(minX: number, maxX: number, minY: number, maxY: number): void;
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
