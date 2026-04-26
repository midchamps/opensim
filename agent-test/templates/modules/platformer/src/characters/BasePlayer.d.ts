import Phaser from 'phaser';
import { BehaviorManager, PlatformerMovement, MeleeAttack, RangedAttack, SkillBehavior } from '../behaviors';
import { PlayerFSM, type PlayerAnimKeys } from './PlayerFSM';
/**
 * Player configuration interface
 */
export interface PlayerConfig {
    /** Texture key for initial frame (must be IMAGE key from asset-pack.json) */
    textureKey: string;
    /** Display height in pixels (default 128) */
    displayHeight?: number;
    /** Body width factor (0-1, default 0.6) */
    bodyWidthFactor?: number;
    /** Body height factor (0-1, default 0.85) */
    bodyHeightFactor?: number;
    /** Player stats */
    stats: {
        maxHealth: number;
        walkSpeed: number;
        jumpPower: number;
        attackDamage: number;
        hurtingDuration?: number;
        invulnerableTime?: number;
        gravityY?: number;
    };
    /** Movement behavior config overrides */
    movement?: {
        airControl?: number;
        coyoteTime?: number;
        jumpBufferTime?: number;
        doubleJumpEnabled?: boolean;
        doubleJumpPower?: number;
    };
    /** Combat config */
    combat?: {
        meleeRange?: number;
        meleeWidth?: number;
        rangedKey?: string;
        rangedSpeed?: number;
        rangedCooldown?: number;
    };
    /** Animation keys mapping */
    animKeys?: PlayerAnimKeys;
    /**
     * Visual offset Y to sink sprite into ground (in pixels, positive = sink down)
     *
     * PURPOSE: AI-generated character sprites often have extra whitespace above
     * the character (for hair, weapons, etc). This causes the character to
     * "float" above the ground. This offset moves the physics body UP relative
     * to the sprite, making the sprite visually sink into the ground so feet
     * appear to touch the tiles.
     *
     * IMPORTANT: This does NOT cause sprite/tile overlap issues because Phaser's
     * collision detection only uses the physics body, not the sprite image.
     *
     * Default: 50 (works well for most AI-generated sprites)
     * Set to 0 to disable the correction.
     */
    verticalVisualOffset?: number;
}
/**
 * BasePlayer - Foundation class for player characters in platformer games
 *
 * CONTROLS:
 *   - WASD: Move Left/Right or Jump
 *   - Space / W: Jump
 *   - Shift: Melee Attack (alternating combo: odd=punch, even=kick)
 *   - E: Ranged Attack
 *   - Q: Ultimate Skill (long cooldown)
 *
 * This class provides:
 * - Integration with BehaviorManager for movement and combat
 * - Integration with PlayerFSM for state management
 * - Health and damage system
 * - Melee attack trigger
 * - Ultimate skill system with cooldown
 * - Hooks for customization
 *
 * HOOK METHODS (override in subclass):
 * - initBehaviors(config): Add custom behaviors
 * - initUltimate(): Initialize ultimate skill
 * - onUpdate(): Custom per-frame logic
 * - onDamageTaken(damage): React to taking damage
 * - onDeath(): React to dying
 * - onHealthChanged(oldHealth, newHealth): React to health changes
 * - onUltimateUsed(): React to ultimate skill usage
 *
 * Usage:
 *   export class Player extends BasePlayer {
 *     constructor(scene, x, y) {
 *       super(scene, x, y, {
 *         textureKey: 'player_idle_frame1',
 *         stats: { maxHealth: 100, walkSpeed: 200, jumpPower: 620, attackDamage: 25 },
 *         animKeys: { idle: 'player_idle_anim', ... },
 *       });
 *     }
 *   }
 */
export declare abstract class BasePlayer extends Phaser.Physics.Arcade.Sprite {
    body: Phaser.Physics.Arcade.Body;
    /** Behavior manager for this player */
    behaviors: BehaviorManager;
    /** Movement behavior (walking, jumping) */
    movement: PlatformerMovement;
    /** Melee attack behavior */
    melee: MeleeAttack;
    /** Ranged attack behavior (optional) */
    ranged?: RangedAttack;
    /** Ultimate skill behavior (optional) */
    ultimate?: SkillBehavior;
    /** Finite state machine for player states */
    fsm: PlayerFSM;
    /** Current facing direction */
    facingDirection: 'left' | 'right';
    /** Attack damage */
    attackDamage: number;
    /** Walk speed (from config) */
    walkSpeed: number;
    /** Jump power (from config) */
    jumpPower: number;
    /** Visual offset Y to sink sprite into ground (pixels) */
    verticalVisualOffset: number;
    /** Is player dead */
    isDead: boolean;
    /** Is player in hurt state */
    isHurting: boolean;
    /** Is player attacking (melee) */
    isAttacking: boolean;
    /** Is player invulnerable (after taking damage) */
    isInvulnerable: boolean;
    /** Is player using ultimate skill */
    isUsingUltimate: boolean;
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
    /** Melee attack counter (for alternating combo) */
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
    jumpSound?: Phaser.Sound.BaseSound;
    attackSound?: Phaser.Sound.BaseSound;
    hurtSound?: Phaser.Sound.BaseSound;
    shootSound?: Phaser.Sound.BaseSound;
    ultimateSound?: Phaser.Sound.BaseSound;
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
     * HOOK: Initialize ultimate skill
     * Override this to add an ultimate skill behavior
     *
     * CRITICAL TIMING: Called DURING super() constructor. Initialize
     * your ultimate skill HERE, not after super() in the constructor.
     *
     * @example
     *   protected initUltimate(): void {
     *     this.ultimate = this.behaviors.add('ultimate', new DashAttackSkill({
     *       id: 'chidori',
     *       name: 'Chidori',
     *       cooldown: 5000,
     *       damage: 100,
     *     }));
     *   }
     */
    protected initUltimate(): void;
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
     * HOOK: Called when ultimate skill is used
     */
    protected onUltimateUsed(): void;
    /**
     * HOOK: Called when ultimate skill completes
     */
    protected onUltimateComplete(): void;
    /**
     * Play animation and reset origin/offset
     */
    playAnimation(animKey: string): void;
    /**
     * Main update method - call every frame from scene
     *
     * @param wasdKeys - WASD keys for movement
     * @param spaceKey - Space key for jump
     * @param shiftKey - Shift key for melee attack
     * @param eKey - E key for ranged attack
     * @param qKey - Q key for ultimate skill
     */
    update(wasdKeys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    }, spaceKey: Phaser.Input.Keyboard.Key, shiftKey: Phaser.Input.Keyboard.Key, eKey: Phaser.Input.Keyboard.Key, qKey: Phaser.Input.Keyboard.Key): void;
    /**
     * Shoot a projectile (called by FSM)
     */
    shoot(): void;
    /**
     * Check if ultimate can be used
     */
    canUseUltimate(): boolean;
    /**
     * Use ultimate skill (called by FSM)
     */
    useUltimate(): void;
    /**
     * Get ultimate cooldown remaining in milliseconds
     */
    getUltimateCooldownRemaining(): number;
    /**
     * Get ultimate cooldown progress (0 = on cooldown, 1 = ready)
     */
    getUltimateCooldownProgress(): number;
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
     * Check if player is on the ground
     */
    isGrounded(): boolean;
    /**
     * Initialize sound effects
     * Override to customize sound keys
     */
    protected initializeSounds(): void;
}
