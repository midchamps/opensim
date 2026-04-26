import Phaser from 'phaser';
import FSM from 'phaser3-rex-plugins/plugins/fsm.js';
/**
 * PlayerAnimKeys - Configurable animation key mapping
 *
 * Allows customization of animation keys without modifying FSM code.
 * All keys are optional - defaults are used if not provided.
 */
export interface PlayerAnimKeys {
    idle?: string;
    walk?: string;
    jumpUp?: string;
    jumpDown?: string;
    /** Punch animation (odd melee attacks) */
    punch?: string;
    /** Kick animation (even melee attacks) */
    kick?: string;
    /** Ranged attack animation */
    shoot?: string;
    /** Ultimate skill animation */
    ultimate?: string;
    die?: string;
}
/**
 * Default animation keys - used when custom keys not provided
 */
export declare const DEFAULT_PLAYER_ANIM_KEYS: Required<PlayerAnimKeys>;
/**
 * PlayerFSM - Player Finite State Machine (Platformer)
 *
 * CONTROLS:
 *   - WASD: Move Left/Right or Jump
 *   - Space / W: Jump
 *   - Shift: Melee Attack (alternating combo: odd=punch, even=kick)
 *   - E: Ranged Attack
 *   - Q: Ultimate Skill (long cooldown)
 *
 * STATES:
 *   - idle: Standing still
 *   - moving: Walking left/right
 *   - jumping: In the air
 *   - punching: Melee attack (odd count)
 *   - kicking: Melee attack (even count)
 *   - shooting: Ranged attack
 *   - ultimate: Using ultimate skill
 *   - hurting: Taking damage
 *   - dying: Death sequence
 *
 * Each state has:
 *   - enter_xxx(): Called when entering the state
 *   - update_xxx(): Called every frame while in the state
 */
export declare class PlayerFSM extends FSM {
    scene: Phaser.Scene;
    player: any;
    animKeys: Required<PlayerAnimKeys>;
    constructor(scene: Phaser.Scene, player: any, animKeys?: PlayerAnimKeys);
    /**
     * Check if player should die (health-based only)
     * Returns true if transitioning to dying state
     *
     * NOTE: Fall death (player.y > mapHeight) is handled by
     * BaseLevelScene.checkPlayerFall(), which correctly calls
     * the onPlayerDeath() hook. Do NOT duplicate that check here,
     * or the hook will be bypassed.
     */
    checkDeath(): boolean;
    /**
     * Check if moving left (A key)
     */
    isMovingLeft(): boolean;
    /**
     * Check if moving right (D key)
     */
    isMovingRight(): boolean;
    /**
     * Check if jumping (W or Space)
     */
    isJumping(): boolean;
    /**
     * Check if melee attack pressed (Shift - JustDown)
     */
    isMeleePressed(): boolean;
    /**
     * Check if ranged attack pressed (E - JustDown)
     */
    isRangedPressed(): boolean;
    /**
     * Check if ultimate pressed (Q - JustDown)
     */
    isUltimatePressed(): boolean;
    /**
     * Return to appropriate base state based on current input
     */
    returnToBaseState(): void;
    enter_idle(): void;
    update_idle(): void;
    enter_moving(): void;
    update_moving(): void;
    enter_jumping(): void;
    update_jumping(): void;
    enter_punching(): void;
    update_punching(): void;
    enter_kicking(): void;
    update_kicking(): void;
    enter_shooting(): void;
    update_shooting(): void;
    enter_ultimate(): void;
    update_ultimate(): void;
    enter_hurting(): void;
    enter_dying(): void;
}
