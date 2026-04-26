import Phaser from 'phaser';
import { BehaviorManager, EightWayMovement, FaceTarget, MeleeAttack, RangedAttack, DashAbility } from '../behaviors';
import { PlayerFSM, type PlayerAnimKeys } from './PlayerFSM';
/**
 * Player configuration interface
 */
export interface PlayerConfig {
    /** Texture key for initial frame (must be IMAGE key from asset-pack.json) */
    textureKey: string;
    /** Display height in pixels (default 64 = 1 tile) */
    displayHeight?: number;
    /** Body width factor (0-1, default 0.5) — narrower for top-down foot hitbox */
    bodyWidthFactor?: number;
    /** Body height factor (0-1, default 0.4) — shorter for top-down foot hitbox */
    bodyHeightFactor?: number;
    /** Player stats */
    stats: {
        maxHealth: number;
        walkSpeed: number;
        attackDamage: number;
        hurtingDuration?: number;
        invulnerableTime?: number;
    };
    /** Movement behavior config overrides */
    movement?: {
        friction?: number;
    };
    /** Combat config */
    combat?: {
        meleeRange?: number;
        meleeWidth?: number;
        rangedKey?: string;
        rangedSpeed?: number;
        rangedCooldown?: number;
    };
    /** Dash config */
    dash?: {
        dashSpeed?: number;
        dashDuration?: number;
        cooldown?: number;
        invulnerable?: boolean;
    };
    /** Animation keys mapping */
    animKeys?: PlayerAnimKeys;
}
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
export declare abstract class BasePlayer extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;
    /** Behavior manager for this player */
    behaviors: BehaviorManager;
    /** 8-way movement behavior */
    movement: EightWayMovement;
    /** Mouse/target aiming behavior */
    faceTarget: FaceTarget;
    /** Melee attack behavior */
    melee: MeleeAttack;
    /** Ranged attack behavior (optional) */
    ranged?: RangedAttack;
    /** Dash ability behavior (optional) */
    dash?: DashAbility;
    /** Finite state machine for player states */
    fsm: PlayerFSM;
    /** Current facing direction (4-way) */
    facingDirection: 'left' | 'right' | 'up' | 'down';
    /** Attack damage */
    attackDamage: number;
    /** Walk speed (from config) */
    walkSpeed: number;
    /** Is player dead */
    isDead: boolean;
    /** Is player in hurt state */
    isHurting: boolean;
    /** Is player attacking (melee) */
    isAttacking: boolean;
    /**
     * Is player invulnerable (after taking damage or during dash).
     *
     * Uses a timestamp-based system: multiple invulnerability sources
     * (damage i-frames, dash i-frames) never conflict — the longest
     * remaining duration always wins.
     */
    private _invulnerableUntil;
    get isInvulnerable(): boolean;
    /** Is player currently dashing */
    isDashing: boolean;
    /** Hurt state duration in ms */
    hurtingDuration: number;
    /** Invulnerability duration after taking damage in ms */
    invulnerableTime: number;
    /** Timer for hurt state */
    hurtingTimer?: Phaser.Time.TimerEvent;
    /** Maximum health */
    maxHealth: number;
    /** Current health */
    health: number;
    /** Melee trigger zone (from MeleeAttack behavior) */
    get meleeTrigger(): Phaser.GameObjects.Zone;
    /** Targets hit in current melee attack */
    get currentMeleeTargets(): Set<any>;
    /** Melee attack counter (for combo tracking) */
    meleeComboCount: number;
    wasdKeys?: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    spaceKey?: Phaser.Input.Keyboard.Key;
    shiftKey?: Phaser.Input.Keyboard.Key;
    eKey?: Phaser.Input.Keyboard.Key;
    qKey?: Phaser.Input.Keyboard.Key;
    attackSound?: Phaser.Sound.BaseSound;
    hurtSound?: Phaser.Sound.BaseSound;
    shootSound?: Phaser.Sound.BaseSound;
    dashSound?: Phaser.Sound.BaseSound;
    constructor(scene: Phaser.Scene, x: number, y: number, config: PlayerConfig);
    /**
     * HOOK: Initialize custom behaviors
     * Override this to add additional behaviors or modify existing ones
     *
     * CRITICAL TIMING: Called DURING super() constructor, BEFORE subclass
     * constructor code after super() executes. Initialize behaviors HERE.
     */
    protected initBehaviors(config: PlayerConfig): void;
    /**
     * HOOK: Initialize special abilities
     * Override this to add special skills or abilities
     *
     * CRITICAL TIMING: Called DURING super() constructor.
     */
    protected initAbilities(): void;
    /**
     * HOOK: Called every frame after standard update
     */
    protected onUpdate(): void;
    /**
     * HOOK: Called when player takes damage
     */
    protected onDamageTaken(damage: number): void;
    /**
     * HOOK: Called when player dies
     */
    protected onDeath(): void;
    /**
     * HOOK: Called when health changes
     */
    protected onHealthChanged(oldHealth: number, newHealth: number): void;
    /**
     * HOOK: Called when dash starts
     */
    protected onDashUsed(): void;
    /**
     * HOOK: Called when dash completes
     */
    protected onDashComplete(): void;
    /**
     * HOOK: Called when a ranged attack is fired
     * @param bullet - The projectile that was created, or null if failed
     */
    protected onShoot(bullet: Phaser.Physics.Arcade.Sprite | null): void;
    /**
     * HOOK: Called when melee attack starts
     * Override for screen shake, combo logic, etc.
     */
    protected onMeleeStart(): void;
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
    checkMeleeInput(): boolean;
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
    checkRangedInput(): boolean;
    /**
     * INPUT HOOK: Check if dash should trigger this frame.
     * Default: Space key (JustDown).
     */
    checkDashInput(): boolean;
    /**
     * INPUT HOOK: Check if special ability should trigger this frame.
     * Default: Q key (JustDown).
     */
    checkSpecialInput(): boolean;
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
    playAnimation(animKey: string): void;
    /**
     * Grant invulnerability for a duration.
     * Multiple sources (damage, dash) never conflict — the longest remaining
     * duration always wins via Math.max.
     *
     * @param durationMs - How long to be invulnerable (in milliseconds)
     */
    grantInvulnerability(durationMs: number): void;
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
    update(wasdKeys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    }, spaceKey: Phaser.Input.Keyboard.Key, shiftKey: Phaser.Input.Keyboard.Key, eKey: Phaser.Input.Keyboard.Key, qKey: Phaser.Input.Keyboard.Key): void;
    /**
     * Shoot a projectile toward aim direction (called by FSM)
     */
    shoot(): void;
    /**
     * Check if dash can be used
     */
    canDash(): boolean;
    /**
     * Execute dash in the specified direction (called by FSM).
     *
     * Handles invulnerability granting/cleanup to avoid conflicts
     * with damage i-frames (DashAbility does NOT manage isInvulnerable).
     */
    performDash(dirX: number, dirY: number): void;
    /**
     * Get dash cooldown progress (0 = on cooldown, 1 = ready)
     */
    getDashCooldownProgress(): number;
    /**
     * Take damage from an attack
     */
    takeDamage(damage: number): void;
    /**
     * Heal the player
     */
    heal(amount: number): void;
    /**
     * Kill the player immediately
     */
    kill(): void;
    /**
     * Get health as percentage (0-100)
     */
    getHealthPercentage(): number;
    /**
     * Initialize sound effects
     * Override to customize sound keys
     */
    protected initializeSounds(): void;
}
