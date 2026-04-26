import Phaser from 'phaser';
import FSM from 'phaser3-rex-plugins/plugins/fsm.js';
/**
 * PlayerAnimKeys - Configurable animation key mapping for top-down player
 *
 * Allows customization of animation keys without modifying FSM code.
 * All keys are optional — defaults are used if not provided.
 *
 * For directional sprites: The FSM uses a single BASE key per action.
 * Override playAnimation() in your BasePlayer subclass to resolve
 * directional variants (e.g., walk_front, walk_back, walk_side) based
 * on facingDirection. See _TemplatePlayer.ts for the standard pattern.
 */
export interface PlayerAnimKeys {
    idle?: string;
    walk?: string;
    melee?: string;
    shoot?: string;
    dash?: string;
    die?: string;
}
/**
 * Default animation keys - used when custom keys not provided
 */
export declare const DEFAULT_PLAYER_ANIM_KEYS: Required<PlayerAnimKeys>;
/**
 * PlayerFSM - Player Finite State Machine (Top-Down)
 *
 * CONTROLS:
 *   - WASD: 8-directional movement
 *   - Mouse: Aiming (handled by FaceTarget behavior)
 *   - Shift: Melee Attack
 *   - E: Ranged Attack
 *   - Space: Dash (in movement direction or facing direction)
 *   - Q: Reserved for special abilities (hook)
 *
 * STATES:
 *   - idle: Standing still
 *   - walking: Moving in 8 directions
 *   - melee: Melee attack animation (ROOTS player)
 *   - shooting: Ranged attack animation (allows movement — twin-stick)
 *   - dashing: Dash movement (i-frames)
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
    /** Prevents double-triggering of death UI (animation complete + fallback timer) */
    private _deathTriggered;
    constructor(scene: Phaser.Scene, player: any, animKeys?: PlayerAnimKeys);
    /**
     * Check if player should die.
     * Safety net — normally, lethal damage is handled directly in
     * BasePlayer.takeDamage() via kill(). This catches edge cases
     * where health drops below 0 from external code.
     *
     * Returns true if transitioning to dying state
     */
    checkDeath(): boolean;
    /** Check if moving left (A key) */
    isMovingLeft(): boolean;
    /** Check if moving right (D key) */
    isMovingRight(): boolean;
    /** Check if moving up (W key) */
    isMovingUp(): boolean;
    /** Check if moving down (S key) */
    isMovingDown(): boolean;
    /** Check if any movement key is pressed */
    hasMovementInput(): boolean;
    /**
     * Check if melee attack triggered.
     * Delegates to player.checkMeleeInput() — override that for custom input.
     */
    isMeleePressed(): boolean;
    /**
     * Check if ranged attack triggered.
     * Delegates to player.checkRangedInput() — override that for custom input.
     */
    isRangedPressed(): boolean;
    /**
     * Check if dash triggered.
     * Delegates to player.checkDashInput() — override that for custom input.
     */
    isDashPressed(): boolean;
    /**
     * Check if special ability triggered.
     * Delegates to player.checkSpecialInput() — override that for custom input.
     */
    isSpecialPressed(): boolean;
    /**
     * Get movement input as direction values
     * Used to feed EightWayMovement behavior
     */
    getMovementInput(): {
        x: number;
        y: number;
    };
    /**
     * Return to appropriate base state based on current input
     */
    returnToBaseState(): void;
    enter_idle(): void;
    update_idle(): void;
    enter_walking(): void;
    update_walking(): void;
    enter_melee(): void;
    update_melee(): void;
    enter_shooting(): void;
    update_shooting(): void;
    enter_dashing(): void;
    update_dashing(): void;
    enter_hurting(): void;
    enter_dying(): void;
}
