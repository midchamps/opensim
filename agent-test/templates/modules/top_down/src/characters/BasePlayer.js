import Phaser from 'phaser';
import * as utils from '../utils';
import { BehaviorManager, EightWayMovement, FaceTarget, MeleeAttack, RangedAttack, DashAbility, } from '../behaviors';
import { PlayerFSM } from './PlayerFSM';
/**
 * BasePlayer - Foundation class for player characters in top-down games
 *
 * CONTROLS (default, customizable via input hooks):
 *   - WASD: 8-directional movement
 *   - Mouse: Aiming direction (via FaceTarget behavior)
 *   - Shift: Melee Attack (in facing direction)
 *   - E: Ranged Attack (toward mouse aim)
 *   - Space: Dash (in movement direction, or facing direction if idle)
 *   - Q: Reserved for custom abilities
 *
 * KEY DIFFERENCES FROM PLATFORMER:
 *   - No gravity (top-down view)
 *   - 4-direction facing (up/down/left/right) instead of 2 (left/right)
 *   - Mouse aiming via FaceTarget behavior
 *   - Dash ability instead of jump
 *   - Body positioned at sprite feet (bottom ~40%) for Y-sort depth
 *
 * This class provides:
 * - Integration with BehaviorManager for movement, aiming, and combat
 * - Integration with PlayerFSM for state management
 * - Health and damage system with i-frames
 * - Dash ability with cooldown and i-frames
 * - Hooks for customization
 *
 * UPDATE ORDER (critical for correct frame timing):
 *   1. Store input references
 *   2. FSM update — reads input, sets movement.setInput(), drives state transitions
 *   3. Behaviors update — movement applies velocity, faceTarget updates aim, triggers reposition
 *   4. Sync facingDirection from FaceTarget
 *   5. Visual updates (flipX, resetOriginAndOffset)
 *   6. onUpdate() hook
 *
 * HOOK METHODS (override in subclass):
 * - initBehaviors(config): Add custom behaviors
 * - initAbilities(): Initialize special abilities
 * - onUpdate(): Custom per-frame logic
 * - onDamageTaken(damage): React to taking damage
 * - onDeath(): React to dying
 * - onHealthChanged(oldHealth, newHealth): React to health changes
 * - onDashUsed(): React to dash start
 * - onDashComplete(): React to dash end
 * - onShoot(bullet): React to ranged attack fired
 * - onMeleeStart(): React to melee attack start
 * - checkMeleeInput(): Override to customize melee trigger (default: Shift key)
 * - checkRangedInput(): Override to customize ranged trigger (default: E key)
 * - checkDashInput(): Override to customize dash trigger (default: Space key)
 *
 * Usage:
 *   export class Player extends BasePlayer {
 *     constructor(scene, x, y) {
 *       super(scene, x, y, {
 *         textureKey: 'player_idle_frame1',
 *         stats: { maxHealth: 100, walkSpeed: 200, attackDamage: 25 },
 *         animKeys: { idle: 'player_idle_anim', walk: 'player_walk_anim', ... },
 *       });
 *     }
 *   }
 */
export class BasePlayer extends Phaser.Physics.Arcade.Sprite {
    // ============================================================================
    // BEHAVIOR SYSTEM
    // ============================================================================
    /** Behavior manager for this player */
    behaviors;
    /** 8-way movement behavior */
    movement;
    /** Mouse/target aiming behavior */
    faceTarget;
    /** Melee attack behavior */
    melee;
    /** Ranged attack behavior (optional) */
    ranged;
    /** Dash ability behavior (optional) */
    dash;
    // ============================================================================
    // STATE MACHINE
    // ============================================================================
    /** Finite state machine for player states */
    fsm;
    // ============================================================================
    // ATTRIBUTES
    // ============================================================================
    /** Current facing direction (4-way) */
    facingDirection = 'down';
    /** Attack damage */
    attackDamage;
    /** Walk speed (from config) */
    walkSpeed;
    // ============================================================================
    // STATE FLAGS
    // ============================================================================
    /** Is player dead */
    isDead = false;
    /** Is player in hurt state */
    isHurting = false;
    /** Is player attacking (melee) */
    isAttacking = false;
    /**
     * Is player invulnerable (after taking damage or during dash).
     *
     * Uses a timestamp-based system: multiple invulnerability sources
     * (damage i-frames, dash i-frames) never conflict — the longest
     * remaining duration always wins.
     */
    _invulnerableUntil = 0;
    get isInvulnerable() {
        if (!this.scene?.time)
            return false;
        return this.scene.time.now < this._invulnerableUntil;
    }
    /** Is player currently dashing */
    isDashing = false;
    /** Hurt state duration in ms */
    hurtingDuration;
    /** Invulnerability duration after taking damage in ms */
    invulnerableTime;
    /** Timer for hurt state */
    hurtingTimer;
    // ============================================================================
    // HEALTH SYSTEM
    // ============================================================================
    /** Maximum health */
    maxHealth;
    /** Current health */
    health;
    // ============================================================================
    // ATTACK SYSTEM
    // ============================================================================
    /** Melee trigger zone (from MeleeAttack behavior) */
    get meleeTrigger() {
        return this.melee.meleeTrigger;
    }
    /** Targets hit in current melee attack */
    get currentMeleeTargets() {
        return this.melee.currentTargets;
    }
    /** Melee attack counter (for combo tracking) */
    meleeComboCount = 0;
    // ============================================================================
    // INPUT REFERENCES
    // ============================================================================
    wasdKeys;
    spaceKey;
    shiftKey;
    eKey;
    qKey;
    // ============================================================================
    // AUDIO
    // ============================================================================
    attackSound;
    hurtSound;
    shootSound;
    dashSound;
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
        this.attackDamage = config.stats.attackDamage;
        this.walkSpeed = config.stats.walkSpeed;
        this.hurtingDuration = config.stats.hurtingDuration ?? 100;
        this.invulnerableTime = config.stats.invulnerableTime ?? 1000;
        // NO GRAVITY — top-down view
        this.body.setAllowGravity(false);
        // Sprite scaling — origin at bottom-center for Y-sort
        // Body covers feet area only (narrow width, short height)
        utils.initScale(this, { x: 0.5, y: 1.0 }, undefined, config.displayHeight ?? 64, config.bodyWidthFactor ?? 0.5, config.bodyHeightFactor ?? 0.4);
        // Initialize behavior system
        this.behaviors = new BehaviorManager(this);
        // Add 8-way movement behavior
        this.movement = this.behaviors.add('movement', new EightWayMovement({
            walkSpeed: config.stats.walkSpeed,
            friction: config.movement?.friction,
        }));
        // Add mouse aiming behavior
        this.faceTarget = this.behaviors.add('faceTarget', new FaceTarget({
            useMouseAim: true,
        }));
        // Add melee attack behavior
        this.melee = this.behaviors.add('melee', new MeleeAttack({
            damage: config.stats.attackDamage,
            range: config.combat?.meleeRange ?? 80,
            width: config.combat?.meleeWidth ?? 60,
        }));
        // Add ranged attack behavior if configured
        if (config.combat?.rangedKey) {
            this.ranged = this.behaviors.add('ranged', new RangedAttack({
                damage: config.stats.attackDamage,
                projectileKey: config.combat.rangedKey,
                projectileSpeed: config.combat.rangedSpeed ?? 600,
                cooldown: config.combat.rangedCooldown ?? 300,
            }));
        }
        // Add dash ability if configured
        if (config.dash) {
            this.dash = this.behaviors.add('dash', new DashAbility({
                dashSpeed: config.dash.dashSpeed ?? 500,
                dashDuration: config.dash.dashDuration ?? 200,
                cooldown: config.dash.cooldown ?? 1000,
                invulnerable: config.dash.invulnerable ?? true,
            }));
        }
        // Hook: Allow subclass to add custom behaviors
        this.initBehaviors(config);
        // Hook: Allow subclass to initialize special abilities
        this.initAbilities();
        // Initialize sounds
        this.initializeSounds();
        // Initialize FSM (must be after behaviors are set up)
        this.fsm = new PlayerFSM(scene, this, config.animKeys);
    }
    // ============================================================================
    // HOOKS - Override in subclass
    // ============================================================================
    /**
     * HOOK: Initialize custom behaviors
     * Override this to add additional behaviors or modify existing ones
     *
     * CRITICAL TIMING: Called DURING super() constructor, BEFORE subclass
     * constructor code after super() executes. Initialize behaviors HERE.
     */
    initBehaviors(config) {
        // Override in subclass to add custom behaviors
    }
    /**
     * HOOK: Initialize special abilities
     * Override this to add special skills or abilities
     *
     * CRITICAL TIMING: Called DURING super() constructor.
     */
    initAbilities() {
        // Override in subclass to add special abilities
    }
    /**
     * HOOK: Called every frame after standard update
     */
    onUpdate() {
        // Override in subclass
    }
    /**
     * HOOK: Called when player takes damage
     */
    onDamageTaken(damage) {
        // Override in subclass
    }
    /**
     * HOOK: Called when player dies
     */
    onDeath() {
        // Override in subclass
    }
    /**
     * HOOK: Called when health changes
     */
    onHealthChanged(oldHealth, newHealth) {
        // Override in subclass
    }
    /**
     * HOOK: Called when dash starts
     */
    onDashUsed() {
        // Override in subclass
    }
    /**
     * HOOK: Called when dash completes
     */
    onDashComplete() {
        // Override in subclass
    }
    /**
     * HOOK: Called when a ranged attack is fired
     * @param bullet - The projectile that was created, or null if failed
     */
    onShoot(bullet) {
        // Override in subclass (e.g., screen shake on fire, ammo tracking)
    }
    /**
     * HOOK: Called when melee attack starts
     * Override for screen shake, combo logic, etc.
     */
    onMeleeStart() {
        // Override in subclass
    }
    // ============================================================================
    // INPUT HOOKS — Override for mouse/touch/custom input support
    // ============================================================================
    /**
     * INPUT HOOK: Check if melee attack should trigger this frame.
     * Default: Shift key (JustDown).
     * Override to add mouse right-click, touch, gamepad, etc.
     *
     * @example
     *   // Add right-click melee:
     *   protected override checkMeleeInput(): boolean {
     *     return super.checkMeleeInput() ||
     *       (this.scene.input.activePointer.rightButtonDown() &&
     *        Phaser.Input.Keyboard.JustDown(this.shiftKey!)); // prevent re-trigger
     *   }
     */
    checkMeleeInput() {
        return this.shiftKey
            ? Phaser.Input.Keyboard.JustDown(this.shiftKey)
            : false;
    }
    /**
     * INPUT HOOK: Check if ranged attack should trigger this frame.
     * Default: E key (JustDown).
     * Override to add left-click shooting, etc.
     *
     * @example
     *   // Add left-click shooting:
     *   protected override checkRangedInput(): boolean {
     *     return super.checkRangedInput() ||
     *       this.scene.input.activePointer.leftButtonDown();
     *   }
     */
    checkRangedInput() {
        return this.eKey ? Phaser.Input.Keyboard.JustDown(this.eKey) : false;
    }
    /**
     * INPUT HOOK: Check if dash should trigger this frame.
     * Default: Space key (JustDown).
     */
    checkDashInput() {
        return this.spaceKey
            ? Phaser.Input.Keyboard.JustDown(this.spaceKey)
            : false;
    }
    /**
     * INPUT HOOK: Check if special ability should trigger this frame.
     * Default: Q key (JustDown).
     */
    checkSpecialInput() {
        return this.qKey ? Phaser.Input.Keyboard.JustDown(this.qKey) : false;
    }
    // ============================================================================
    // ANIMATION
    // ============================================================================
    /**
     * Play animation and reset origin/offset.
     * MUST override in subclass for directional sprites (front/back/side):
     *
     * @example
     *   playAnimation(animKey: string): void {
     *     const dir = this.facingDirection;
     *     const suffix = dir === 'down' ? '_front' : dir === 'up' ? '_back' : '_side';
     *     const directionalKey = animKey.replace('_anim', `${suffix}_anim`);
     *     if (this.scene.anims.exists(directionalKey)) {
     *       this.play(directionalKey, true);
     *     } else {
     *       this.play(animKey, true);  // Safe fallback
     *     }
     *     utils.resetOriginAndOffset(this, this.facingDirection);
     *   }
     */
    playAnimation(animKey) {
        this.play(animKey, true);
        utils.resetOriginAndOffset(this, this.facingDirection);
    }
    // ============================================================================
    // INVULNERABILITY
    // ============================================================================
    /**
     * Grant invulnerability for a duration.
     * Multiple sources (damage, dash) never conflict — the longest remaining
     * duration always wins via Math.max.
     *
     * @param durationMs - How long to be invulnerable (in milliseconds)
     */
    grantInvulnerability(durationMs) {
        const endTime = this.scene.time.now + durationMs;
        this._invulnerableUntil = Math.max(this._invulnerableUntil, endTime);
    }
    // ============================================================================
    // UPDATE
    // ============================================================================
    /**
     * Main update method — call every frame from scene.
     *
     * UPDATE ORDER (intentional — critical for correct frame timing):
     *   1. Store input references
     *   2. FSM update — reads input, calls movement.setInput(), state transitions
     *   3. Behaviors update — movement applies velocity, faceTarget updates aim
     *   4. Sync facing + visual flip + origin/offset
     *   5. onUpdate() hook
     *
     * The FSM runs BEFORE behaviors so that movement input set in
     * update_walking is applied in the SAME frame (no one-frame lag).
     */
    update(wasdKeys, spaceKey, shiftKey, eKey, qKey) {
        // Store input references for FSM and input hooks
        this.wasdKeys = wasdKeys;
        this.spaceKey = spaceKey;
        this.shiftKey = shiftKey;
        this.eKey = eKey;
        this.qKey = qKey;
        // Safety check
        if (!this.body || !this.active)
            return;
        // --- PHASE 1: FSM drives state and movement intent ---
        // The FSM reads input keys, calls movement.setInput(), and manages state
        // transitions. Running FSM FIRST ensures movement input is current for
        // the behavior update that follows (eliminates one-frame movement lag).
        this.fsm.update(0, 0);
        // --- PHASE 2: Behaviors apply physics and update aim ---
        // EightWayMovement applies velocity from the input just set by FSM.
        // FaceTarget tracks mouse position and updates aimAngle.
        // MeleeAttack repositions trigger zone.
        // DashAbility overrides velocity during dash.
        this.behaviors.update();
        // --- PHASE 3: Sync facing direction from aim ---
        // Skip facing sync during incapacitated states to prevent visual flicker
        // (e.g., sprite flipping direction during knockback or death animation).
        if (!this.isHurting && !this.isDead) {
            this.facingDirection = this.faceTarget.facingDirection;
            // FlipX for left/right (up/down use separate animations if available)
            if (this.facingDirection === 'left') {
                this.setFlipX(true);
            }
            else if (this.facingDirection === 'right') {
                this.setFlipX(false);
            }
        }
        // --- PHASE 4: Body positioning (ALWAYS runs) ---
        // Normalize animation frame size and reposition body at feet.
        // Must run every frame because animation frames may change size.
        utils.resetOriginAndOffset(this, this.facingDirection);
        // --- PHASE 5: Custom update logic ---
        this.onUpdate();
    }
    // ============================================================================
    // SHOOTING (E key / custom input)
    // ============================================================================
    /**
     * Shoot a projectile toward aim direction (called by FSM)
     */
    shoot() {
        if (this.isDead || !this.ranged)
            return;
        const bullet = this.ranged.shootAtAngle(this.faceTarget.aimAngle, 'playerBullets');
        if (bullet) {
            this.shootSound?.play();
        }
        // Hook: notify subclass of ranged attack
        this.onShoot(bullet);
    }
    // ============================================================================
    // DASH (Space / custom input)
    // ============================================================================
    /**
     * Check if dash can be used
     */
    canDash() {
        if (this.isDead || this.isHurting || this.isDashing)
            return false;
        return this.dash?.canDash() ?? false;
    }
    /**
     * Execute dash in the specified direction (called by FSM).
     *
     * Handles invulnerability granting/cleanup to avoid conflicts
     * with damage i-frames (DashAbility does NOT manage isInvulnerable).
     */
    performDash(dirX, dirY) {
        if (!this.canDash() || !this.dash)
            return;
        this.isDashing = true;
        this.onDashUsed();
        this.dashSound?.play();
        // Grant dash invulnerability via timestamp (never conflicts with damage i-frames)
        if (this.dash.invulnerable) {
            this.grantInvulnerability(this.dash.dashDuration);
        }
        this.dash.dash(dirX, dirY);
        // Monitor dash completion
        const checkDash = this.scene.time.addEvent({
            delay: 16,
            loop: true,
            callback: () => {
                if (!this.dash?.isDashing) {
                    this.isDashing = false;
                    this.onDashComplete();
                    checkDash.destroy();
                }
            },
        });
    }
    /**
     * Get dash cooldown progress (0 = on cooldown, 1 = ready)
     */
    getDashCooldownProgress() {
        return this.dash?.getCooldownProgress() ?? 1;
    }
    // ============================================================================
    // DAMAGE HANDLING
    // ============================================================================
    /**
     * Take damage from an attack
     */
    takeDamage(damage) {
        if (this.isInvulnerable || this.isDead)
            return;
        const oldHealth = this.health;
        this.health -= damage;
        this.isHurting = true;
        // Grant damage invulnerability via timestamp (never conflicts with dash i-frames)
        this.grantInvulnerability(this.invulnerableTime);
        // Hook: Damage taken
        this.onDamageTaken(damage);
        // Hook: Health changed
        this.onHealthChanged(oldHealth, this.health);
        // Lethal damage → skip hurting state, go directly to dying
        if (this.health <= 0) {
            this.kill();
            return;
        }
        // Non-lethal → hurt state with blinking
        this.fsm.goto('hurting');
        // Blinking effect during invulnerability (visual only — invulnerability is time-based)
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(this.invulnerableTime / 200),
            onComplete: () => {
                this.alpha = 1;
                // NOTE: Do NOT set isInvulnerable here — it's managed by timestamp
            },
        });
    }
    /**
     * Heal the player
     */
    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.health + amount, this.maxHealth);
        if (this.health !== oldHealth) {
            this.onHealthChanged(oldHealth, this.health);
        }
    }
    /**
     * Kill the player immediately
     */
    kill() {
        if (this.isDead)
            return;
        this.health = 0;
        this.isDead = true;
        this.onDeath();
        this.fsm.goto('dying');
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
     * Override to customize sound keys
     */
    initializeSounds() {
        this.attackSound = utils.safeAddSound(this.scene, 'player_attack', {
            volume: 0.3,
        });
        this.hurtSound = utils.safeAddSound(this.scene, 'player_hurt', {
            volume: 0.3,
        });
        this.shootSound = utils.safeAddSound(this.scene, 'player_shoot', {
            volume: 0.3,
        });
        this.dashSound = utils.safeAddSound(this.scene, 'player_dash', {
            volume: 0.3,
        });
    }
}
//# sourceMappingURL=BasePlayer.js.map