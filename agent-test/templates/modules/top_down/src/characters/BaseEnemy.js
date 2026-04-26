import Phaser from 'phaser';
import * as utils from '../utils';
import { BehaviorManager, PatrolAI, ChaseAI, MeleeAttack, RangedAttack, } from '../behaviors';
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
export class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    // ============================================================================
    // BEHAVIOR SYSTEM
    // ============================================================================
    /** Behavior manager for this enemy */
    behaviors;
    /** Patrol AI behavior (optional) */
    patrol;
    /** Chase AI behavior (optional) */
    chase;
    /** Melee attack behavior (optional) */
    melee;
    /** Ranged attack behavior (optional) */
    ranged;
    // ============================================================================
    // ATTRIBUTES
    // ============================================================================
    /** Current facing direction (4-way) */
    facingDirection = 'down';
    /** Movement speed */
    speed;
    /** Damage dealt to player */
    damage;
    // ============================================================================
    // STATE FLAGS
    // ============================================================================
    /** Is enemy dead */
    isDead = false;
    /** Is enemy in hurt state */
    isHurting = false;
    /** Is enemy attacking */
    isAttacking = false;
    // ============================================================================
    // HEALTH SYSTEM
    // ============================================================================
    /** Maximum health */
    maxHealth;
    /** Current health */
    health;
    // ============================================================================
    // AI
    // ============================================================================
    /** AI type */
    aiType;
    /** Target (usually player) */
    target;
    // ============================================================================
    // ATTACK SYSTEM
    // ============================================================================
    /** Melee trigger zone (from MeleeAttack behavior) */
    get meleeTrigger() {
        return this.melee?.meleeTrigger;
    }
    /** Targets hit in current melee attack */
    get currentMeleeTargets() {
        return this.melee?.currentTargets ?? new Set();
    }
    // ============================================================================
    // AUDIO
    // ============================================================================
    deathSound;
    attackSound;
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    constructor(scene, x, y, config) {
        super(scene, x, y, config.textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // Initialize stats
        this.maxHealth = config.stats.maxHealth;
        this.health = this.maxHealth;
        this.speed = config.stats.speed;
        this.damage = config.stats.damage;
        // NO GRAVITY — top-down view
        this.body.setAllowGravity(false);
        // Sprite scaling — origin at bottom-center for Y-sort
        // Body covers feet area only
        utils.initScale(this, { x: 0.5, y: 1.0 }, undefined, config.displayHeight ?? 64, config.bodyWidthFactor ?? 0.5, config.bodyHeightFactor ?? 0.4);
        // Initialize behavior system
        this.behaviors = new BehaviorManager(this);
        // Set up AI type
        this.aiType = config.ai?.type ?? 'stationary';
        // Set up AI behaviors based on type
        this.setupAI(config);
        // Set up combat behaviors
        this.setupCombat(config);
        // Hook: Allow subclass to add custom behaviors
        this.initBehaviors(config);
        // Initialize sounds
        this.initializeSounds();
        // Random initial facing direction
        const directions = [
            'left',
            'right',
            'up',
            'down',
        ];
        this.facingDirection =
            directions[Math.floor(Math.random() * directions.length)];
    }
    /**
     * Set up AI behaviors based on configuration
     */
    setupAI(config) {
        switch (this.aiType) {
            case 'patrol':
                this.patrol = this.behaviors.add('patrol', new PatrolAI({
                    speed: this.speed,
                    patrolArea: config.ai?.patrolArea,
                    directionChangeInterval: config.ai?.directionChangeInterval,
                }));
                break;
            case 'chase':
                this.chase = this.behaviors.add('chase', new ChaseAI({
                    speed: this.speed,
                    detectionRange: config.ai?.detectionRange,
                    giveUpDistance: config.ai?.giveUpDistance,
                    stopDistance: config.ai?.stopDistance ?? 50,
                }));
                break;
            case 'stationary':
            case 'custom':
                // No built-in AI behavior
                break;
        }
    }
    /**
     * Set up combat behaviors based on configuration
     */
    setupCombat(config) {
        // Melee attack
        if (config.combat?.hasMelee) {
            this.melee = this.behaviors.add('melee', new MeleeAttack({
                damage: this.damage,
                range: config.combat.meleeRange ?? 80,
                width: config.combat.meleeWidth ?? 60,
                cooldown: config.combat.meleeCooldown ?? 1000,
            }));
        }
        // Ranged attack
        if (config.combat?.hasRanged && config.combat.rangedKey) {
            this.ranged = this.behaviors.add('ranged', new RangedAttack({
                damage: this.damage,
                projectileKey: config.combat.rangedKey,
                cooldown: config.combat.rangedCooldown ?? 2000,
            }));
        }
    }
    // ============================================================================
    // HOOKS - Override in subclass
    // ============================================================================
    /**
     * HOOK: Initialize custom behaviors
     * Override this to add additional behaviors
     *
     * CRITICAL TIMING: This method is called DURING the super() constructor,
     * BEFORE the rest of the subclass constructor executes.
     */
    initBehaviors(config) {
        // Override in subclass
    }
    /**
     * HOOK: Called every frame after standard update
     */
    onUpdate() {
        // Override in subclass
    }
    /**
     * HOOK: Called when enemy takes damage
     */
    onDamageTaken(damage) {
        // Override in subclass
    }
    /**
     * HOOK: Called when enemy dies
     */
    onDeath() {
        // Override in subclass
    }
    /**
     * HOOK: Custom AI logic (when using aiType: 'custom')
     */
    executeAI() {
        // Override in subclass for custom AI
    }
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
    getAnimationKey(isMoving, facingDirection) {
        return null;
    }
    /**
     * HOOK: Called when enemy switches to chase mode (e.g., player detected).
     * Useful for playing alert sound effects or changing appearance.
     */
    onAggro(target) {
        // Override in subclass
    }
    // ============================================================================
    // ANIMATION
    // ============================================================================
    /**
     * Play animation and reset origin/offset
     */
    playAnimation(animKey) {
        this.play(animKey, true);
        utils.resetOriginAndOffset(this, this.facingDirection);
    }
    // ============================================================================
    // UPDATE
    // ============================================================================
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
    update() {
        if (!this.body || !this.active || this.isDead)
            return;
        // --- PHASE 1: Behaviors drive AI and combat ---
        // PatrolAI/ChaseAI set velocity and facingDirection on owner.
        // MeleeAttack repositions trigger zone.
        this.behaviors.update();
        // --- PHASE 2: Sync facing direction from AI behaviors ---
        // AI behaviors already sync to owner, but we also read back explicitly
        // in case subclass modifies facingDirection in a hook.
        if (this.patrol) {
            this.facingDirection = this.patrol.facingDirection;
        }
        else if (this.chase) {
            this.facingDirection = this.chase.facingDirection;
        }
        // --- PHASE 3: Custom AI and ranged attack ---
        if (!this.isHurting && !this.isAttacking) {
            if (this.aiType === 'custom') {
                this.executeAI();
            }
            // Try ranged attack if has target in range
            this.tryRangedAttack();
        }
        // --- PHASE 4: Visual updates (AFTER facing is resolved) ---
        if (this.facingDirection === 'left') {
            this.setFlipX(true);
        }
        else if (this.facingDirection === 'right') {
            this.setFlipX(false);
        }
        // Automatic animation state management via hook
        const isMoving = this.body.velocity.length() > 10;
        const animKey = this.getAnimationKey(isMoving, this.facingDirection);
        if (animKey) {
            this.playAnimation(animKey);
        }
        // Normalize animation frame size and reposition body at feet
        utils.resetOriginAndOffset(this, this.facingDirection);
        // --- PHASE 5: Custom update logic ---
        this.onUpdate();
    }
    /**
     * Try to perform ranged attack if possible
     */
    tryRangedAttack() {
        if (!this.ranged || !this.target || !this.target.active)
            return;
        if (this.ranged.canShoot()) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            // Only shoot if within reasonable range
            if (distance < 400) {
                const bullet = this.ranged.shootAt(this.target, 'enemyBullets');
                if (bullet) {
                    this.attackSound?.play();
                }
            }
        }
    }
    // ============================================================================
    // TARGET MANAGEMENT
    // ============================================================================
    /**
     * Set the target for this enemy (usually the player)
     */
    setTarget(target) {
        const hadTarget = this.target != null;
        this.target = target;
        if (this.chase) {
            this.chase.setTarget(target);
        }
        // Hook: notify subclass of new target acquisition
        if (target && !hadTarget) {
            this.onAggro(target);
        }
    }
    /**
     * Set patrol area
     */
    setPatrolArea(minX, maxX, minY, maxY) {
        if (this.patrol) {
            this.patrol.setPatrolArea(minX, maxX, minY, maxY);
        }
    }
    // ============================================================================
    // DAMAGE HANDLING
    // ============================================================================
    /**
     * Take damage from an attack
     */
    takeDamage(damage) {
        if (this.isDead || this.isHurting)
            return;
        this.health -= damage;
        this.isHurting = true;
        // Hook: Damage taken
        this.onDamageTaken(damage);
        // Flash red
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) {
                this.clearTint();
                this.isHurting = false;
            }
        });
        if (this.health <= 0) {
            this.die();
        }
    }
    /**
     * Kill this enemy
     */
    die() {
        if (this.isDead)
            return;
        this.isDead = true;
        this.setVelocity(0, 0);
        this.deathSound?.play();
        // Hook: Death
        this.onDeath();
        // Destroy after delay
        this.scene.time.delayedCall(500, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }
    // ============================================================================
    // UTILITY
    // ============================================================================
    /**
     * Get health as percentage (0-100)
     */
    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }
    /**
     * Initialize sound effects
     */
    initializeSounds() {
        this.deathSound = utils.safeAddSound(this.scene, 'enemy_death', {
            volume: 0.3,
        });
        this.attackSound = utils.safeAddSound(this.scene, 'enemy_attack', {
            volume: 0.3,
        });
    }
}
//# sourceMappingURL=BaseEnemy.js.map