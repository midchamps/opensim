/**
 * ============================================================================
 * TEMPLATE: Player Character (Top-Down)
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename to your player class (e.g., Player.ts, Mando.ts)
 * 2. Rename the class (e.g., Player, Mando)
 * 3. Update textureKey to match your asset-pack.json IMAGE key (use {name}_idle_front)
 * 4. Update stats from gameConfig.json values
 * 5. Update animKeys to match your animations.json BASE keys (e.g., {name}_idle_anim)
 * 6. KEEP the playAnimation() override — it maps base keys to directional variants
 * 7. Optionally override other hooks for custom behavior
 *
 * CRITICAL RULES:
 * - textureKey MUST be an IMAGE key, NOT an animation key
 * - Always use playAnimation(), never play() directly
 * - Stats should come from gameConfig.json
 * - No gravity in top-down — body.setAllowGravity(false) is already set
 * ============================================================================
 */
import Phaser from 'phaser';
import { BasePlayer } from './BasePlayer';
import * as utils from '../utils';
// CRITICAL: Use DEFAULT import for JSON, then destructure with safe defaults
import gameConfig from '../gameConfig.json';
const playerConfig = (gameConfig.playerConfig ?? {
    maxHealth: { value: 100 },
    walkSpeed: { value: 200 },
    attackDamage: { value: 25 },
    hurtingDuration: { value: 100 },
    invulnerableTime: { value: 1000 },
    dashSpeed: { value: 500 },
    dashDuration: { value: 200 },
    dashCooldown: { value: 1000 },
});
// Optional: Import custom behaviors if needed
// import { ShieldBehavior } from '../behaviors/ShieldBehavior';
export class _TemplatePlayer extends BasePlayer {
    constructor(scene, x, y) {
        // Build configuration
        const config = {
            // ========================================
            // TEXTURE KEY
            // ========================================
            // MUST be an IMAGE key from asset-pack.json (use {name}_idle_front for directional sprites)
            textureKey: 'player_idle_front', // TODO: Replace with your texture key
            // ========================================
            // DISPLAY SETTINGS
            // ========================================
            displayHeight: 64, // Standard player height (= 1 tile)
            bodyWidthFactor: 0.5, // Collision body width ratio (feet area)
            bodyHeightFactor: 0.4, // Collision body height ratio (feet area)
            // ========================================
            // STATS (from gameConfig.json)
            // ========================================
            // IMPORTANT: Use ?. and ?? 0 for optional fields like attackDamage.
            // Not all games define attackDamage in gameConfig (e.g., survival games with no combat).
            // Accessing undefined.value WILL crash at runtime!
            stats: {
                maxHealth: playerConfig.maxHealth?.value ?? 100,
                walkSpeed: playerConfig.walkSpeed?.value ?? 200,
                attackDamage: playerConfig.attackDamage?.value ?? 0,
                hurtingDuration: playerConfig.hurtingDuration?.value ?? 100,
                invulnerableTime: playerConfig.invulnerableTime?.value ?? 1000,
            },
            // ========================================
            // MOVEMENT BEHAVIOR CONFIG (optional)
            // ========================================
            movement: {
                friction: 1, // 1 = instant stop, lower = slidey movement
            },
            // ========================================
            // COMBAT CONFIG (optional)
            // ========================================
            combat: {
                meleeRange: 80, // Melee attack range in pixels
                meleeWidth: 60, // Melee attack width in pixels
                // Uncomment for ranged attacks:
                // rangedKey: 'player_bullet',
                // rangedSpeed: 600,
                // rangedCooldown: 300,
            },
            // ========================================
            // DASH CONFIG (optional — values from gameConfig.json)
            // Set to undefined if this game has no dash ability.
            // ========================================
            dash: {
                dashSpeed: playerConfig.dashSpeed?.value ?? 500,
                dashDuration: playerConfig.dashDuration?.value ?? 200,
                cooldown: playerConfig.dashCooldown?.value ?? 1000,
                invulnerable: true, // I-frames during dash
            },
            // ========================================
            // ANIMATION KEYS
            // ========================================
            // Must match keys in animations.json
            animKeys: {
                idle: 'player_idle_anim',
                walk: 'player_walk_anim',
                melee: 'player_melee_anim',
                shoot: 'player_shoot_anim',
                dash: 'player_dash_anim',
                die: 'player_die_anim',
            },
        };
        super(scene, x, y, config);
    }
    // ============================================================================
    // MANDATORY: Directional Animation Override
    // ============================================================================
    /**
     * Resolve base animation key to directional variant based on facingDirection.
     *
     * Mapping: 'down' → '_front', 'up' → '_back', 'left'|'right' → '_side'
     * Example: 'player_idle_anim' + facing 'up' → 'player_idle_back_anim'
     *
     * Falls back to the base key if directional variant doesn't exist (e.g., die_back_anim).
     * flipX for left/right is handled automatically by BasePlayer.update().
     */
    playAnimation(animKey) {
        const dir = this.facingDirection;
        const suffix = dir === 'down' ? '_front' : dir === 'up' ? '_back' : '_side';
        const directionalKey = animKey.replace('_anim', `${suffix}_anim`);
        if (this.scene.anims.exists(directionalKey)) {
            this.play(directionalKey, true);
        }
        else {
            this.play(animKey, true);
        }
        utils.resetOriginAndOffset(this, this.facingDirection);
    }
    // ============================================================================
    // OPTIONAL HOOKS - Override for custom behavior
    // ============================================================================
    /**
     * Add custom behaviors
     */
    initBehaviors(config) {
        // Example: Add shield behavior
        // this.behaviors.add('shield', new ShieldBehavior({ maxShield: 50 }));
        // Example: Modify movement behavior
        // this.movement.walkSpeed = 250;  // Override walk speed
    }
    /**
     * Initialize special abilities
     */
    initAbilities() {
        // Example: Add special attack
        // this.specialAttack = new SpecialAttack({ cooldown: 5000, damage: 100 });
    }
    /**
     * Custom per-frame update logic
     */
    onUpdate() {
        // ACCESS KEYS VIA: this.wasdKeys?.W, this.wasdKeys?.A, this.wasdKeys?.S, this.wasdKeys?.D
        // DO NOT use this.wKey / this.aKey / etc. — those do NOT exist!
        // Example: Check for special ability input
        // if (this.qKey && Phaser.Input.Keyboard.JustDown(this.qKey)) {
        //   this.useSpecialAbility();
        // }
    }
    /**
     * React to taking damage
     */
    onDamageTaken(damage) {
        // Screen shake is appropriate here (damage is infrequent):
        // ScreenEffectHelper.shakeLight(this.scene);
        // this.hurtSound?.play();
    }
    /**
     * React to death
     */
    onDeath() {
        // Example: Play death effect
        // this.scene.cameras.main.flash(500, 255, 0, 0);
    }
    /**
     * React to health changes
     */
    onHealthChanged(oldHealth, newHealth) {
        // Example: Low health warning
        // if (newHealth < this.maxHealth * 0.25) {
        //   // Trigger low health visual effect
        // }
    }
    /**
     * React to dash start
     */
    onDashUsed() {
        // Example: Create dash trail effect
        // ScreenEffectHelper.createDashTrail(this.scene, this, 'player_idle_frame1', 0x00ffff);
    }
    /**
     * React to dash end
     */
    onDashComplete() {
        // Example: Clean up dash effects
    }
    /**
     * React to ranged attack fired
     */
    onShoot(bullet) {
        // Play shoot sound — do NOT add screen shake here (shooting is too frequent)
        // this.shootSound?.play();
    }
    /**
     * React to melee attack start
     */
    onMeleeStart() {
        // Play attack sound — do NOT add screen shake here (attacks are too frequent)
        // this.attackSound?.play();
    }
    // ============================================================================
    // OPTIONAL INPUT HOOKS — Override to customize controls
    // ============================================================================
    // Example: Add mouse left-click for ranged attack (twin-stick shooter style):
    //
    // public override checkRangedInput(): boolean {
    //   return super.checkRangedInput() ||
    //     this.scene.input.activePointer.leftButtonDown();
    // }
    //
    // Example: Add mouse right-click for melee attack:
    //
    // public override checkMeleeInput(): boolean {
    //   return super.checkMeleeInput() ||
    //     Phaser.Input.Keyboard.JustDown(this.shiftKey!);
    // }
    /**
     * Override to customize sounds.
     * BasePlayer provides: this.attackSound, this.hurtSound, this.shootSound, this.dashSound
     * Override to reassign these to custom audio keys.
     * DO NOT use this.sounds.xxx — that pattern does not exist!
     */
    initializeSounds() {
        super.initializeSounds();
        // Example: Override with custom sounds
        // this.shootSound = utils.safeAddSound(this.scene, 'blaster_sfx', { volume: 0.3 });
        // this.attackSound = utils.safeAddSound(this.scene, 'melee_sfx', { volume: 0.3 });
        // this.hurtSound = utils.safeAddSound(this.scene, 'damage_sfx', { volume: 0.3 });
        // this.dashSound = utils.safeAddSound(this.scene, 'dash_sfx', { volume: 0.3 });
    }
}
//# sourceMappingURL=_TemplatePlayer.js.map