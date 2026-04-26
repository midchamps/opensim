import Phaser from 'phaser';
import { ScreenEffectHelper } from './ScreenEffectHelper';
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
export class SkillBehavior {
    config;
    enabled = true;
    lastUseTime = 0;
    isExecuting = false;
    owner;
    scene;
    constructor(config) {
        this.config = config;
    }
    // IBehavior interface
    attach(owner) {
        this.owner = owner;
        this.scene = owner.scene;
    }
    detach() {
        this.owner = undefined;
        this.scene = undefined;
    }
    update() {
        // Skills don't need per-frame updates
    }
    // ============================================================================
    // COOLDOWN
    // ============================================================================
    canUse() {
        if (!this.scene)
            return false;
        return this.scene.time.now - this.lastUseTime >= this.config.cooldown;
    }
    getCooldownRemaining() {
        if (!this.scene)
            return 0;
        return Math.max(0, this.config.cooldown - (this.scene.time.now - this.lastUseTime));
    }
    getCooldownProgress() {
        if (!this.scene)
            return 1;
        const remaining = this.getCooldownRemaining();
        return remaining === 0 ? 1 : 1 - remaining / this.config.cooldown;
    }
    resetCooldown() {
        this.lastUseTime = 0;
    }
    // ============================================================================
    // SKILL EXECUTION
    // ============================================================================
    use(context) {
        if (!this.canUse() || this.isExecuting)
            return false;
        this.lastUseTime = context.scene.time.now;
        this.isExecuting = true;
        this.scene = context.scene;
        // Play sound
        if (this.config.soundKey && context.scene.sound.get(this.config.soundKey)) {
            context.scene.sound.play(this.config.soundKey, { volume: 0.3 });
        }
        // Execute skill
        this.executeSkill(context, () => {
            this.isExecuting = false;
            context.onComplete?.();
        });
        return true;
    }
    // ============================================================================
    // UTILITY: Find enemies
    // ============================================================================
    getActiveEnemies(context) {
        return (context.enemies?.children.entries.filter((enemy) => enemy.active && !enemy.isDead) ?? []);
    }
    findNearestEnemy(context) {
        const enemies = this.getActiveEnemies(context);
        if (enemies.length === 0)
            return null;
        let nearest = null;
        let nearestDist = Infinity;
        enemies.forEach((enemy) => {
            const dist = Phaser.Math.Distance.Between(context.owner.x, context.owner.y, enemy.x, enemy.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        });
        return nearest;
    }
    findEnemiesInRange(context, range) {
        return this.getActiveEnemies(context).filter((enemy) => Phaser.Math.Distance.Between(context.owner.x, context.owner.y, enemy.x, enemy.y) < range);
    }
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
export class DashAttackSkill extends SkillBehavior {
    dashDistance;
    dashDuration;
    hitRange;
    damage;
    knockbackForceX;
    knockbackForceY;
    screenShake;
    trailEffectKey;
    trailTint;
    warningDuration;
    warningEffectKey;
    warningTint;
    hitTargets = new Set();
    warningEffect;
    constructor(config) {
        super(config);
        this.dashDistance = config.dashDistance ?? 300;
        this.dashDuration = config.dashDuration ?? 400;
        this.hitRange = config.hitRange ?? 80;
        this.damage = config.damage ?? 50;
        this.knockbackForceX = config.knockbackForceX ?? 350;
        this.knockbackForceY = config.knockbackForceY ?? -150;
        this.screenShake = config.screenShake ?? {
            duration: 400,
            intensity: 0.008,
        };
        this.trailEffectKey = config.trailEffectKey;
        this.trailTint = config.trailTint;
        this.warningDuration = config.warningDuration ?? 0;
        this.warningEffectKey = config.warningEffectKey;
        this.warningTint = config.warningTint ?? 0xff0000;
    }
    executeSkill(context, onComplete) {
        // If warning is configured, show warning first
        if (this.warningDuration > 0) {
            this.showWarning(context, () => {
                this.performDash(context, onComplete);
            });
        }
        else {
            this.performDash(context, onComplete);
        }
    }
    /**
     * Show warning effect before dash (useful for boss attacks)
     * Creates a flashing indicator to warn the player
     */
    showWarning(context, onComplete) {
        const owner = context.owner;
        const scene = context.scene;
        // Create warning effect (flashing on the owner)
        if (this.warningEffectKey) {
            this.warningEffect = scene.add.image(owner.x, owner.y - 50, this.warningEffectKey);
            this.warningEffect.setTint(this.warningTint);
            this.warningEffect.setAlpha(0.8);
            this.warningEffect.setScale(0.5);
            // Flash animation
            scene.tweens.add({
                targets: this.warningEffect,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: Math.floor(this.warningDuration / 200) - 1,
            });
        }
        // Also flash the owner sprite (red tint)
        const originalTint = owner.tintTopLeft;
        let flashCount = 0;
        const flashInterval = scene.time.addEvent({
            delay: 100,
            repeat: Math.floor(this.warningDuration / 100) - 1,
            callback: () => {
                flashCount++;
                if (flashCount % 2 === 0) {
                    owner.clearTint();
                }
                else {
                    owner.setTint(this.warningTint);
                }
            },
        });
        // After warning, cleanup and dash
        scene.time.delayedCall(this.warningDuration, () => {
            // Cleanup warning
            if (this.warningEffect) {
                this.warningEffect.destroy();
                this.warningEffect = undefined;
            }
            owner.clearTint();
            flashInterval.destroy();
            // Now perform the dash
            onComplete();
        });
    }
    performDash(context, onComplete) {
        const owner = context.owner;
        const scene = context.scene;
        // Clear hit targets
        this.hitTargets.clear();
        // Calculate dash target
        const direction = context.facingDirection === 'right' ? 1 : -1;
        const targetX = owner.x + direction * this.dashDistance;
        // Create trail effect (if configured)
        if (this.trailEffectKey) {
            ScreenEffectHelper.createDashTrail(scene, owner, this.trailEffectKey, this.trailTint);
        }
        // Execute dash using tween (not physics)
        scene.tweens.add({
            targets: owner,
            x: targetX,
            duration: this.dashDuration,
            ease: 'Power2.easeOut',
            onUpdate: () => {
                this.checkCollisions(context, direction);
            },
            onComplete: () => {
                // Stop any residual velocity
                owner.body?.setVelocityX(0);
                // Screen shake
                ScreenEffectHelper.shake(scene, this.screenShake);
                onComplete();
            },
        });
    }
    checkCollisions(context, direction) {
        const owner = context.owner;
        // Find enemies within hit range
        const enemies = this.findEnemiesInRange(context, this.hitRange);
        enemies.forEach((enemy) => {
            // Skip if already hit
            if (this.hitTargets.has(enemy))
                return;
            // Mark as hit
            this.hitTargets.add(enemy);
            // Apply damage
            if (enemy.takeDamage) {
                enemy.takeDamage(this.damage);
            }
            // Apply knockback
            if (enemy.body) {
                const knockDir = enemy.x > owner.x ? 1 : -1;
                enemy.body.setVelocityX(knockDir * this.knockbackForceX);
                enemy.body.setVelocityY(this.knockbackForceY);
            }
        });
    }
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
export class TargetedExecutionSkill extends SkillBehavior {
    effectKey;
    executionDelay;
    totalDuration;
    screenShake;
    enemyDeathAnimKey;
    vortexEffect;
    constructor(config) {
        super(config);
        this.effectKey = config.effectKey;
        this.executionDelay = config.executionDelay ?? 1000;
        this.totalDuration = config.totalDuration ?? 2500;
        this.screenShake = config.screenShake ?? {
            duration: 2500,
            intensity: 0.015,
        };
        this.enemyDeathAnimKey = config.enemyDeathAnimKey;
    }
    executeSkill(context, onComplete) {
        const scene = context.scene;
        // Find nearest enemy
        const target = this.findNearestEnemy(context);
        if (!target) {
            // No enemy found, abort skill
            onComplete();
            return;
        }
        // Screen shake for duration
        ScreenEffectHelper.shake(scene, this.screenShake);
        // Create vortex effect at enemy position
        const effectY = target.y - (target.body?.height ?? 64) / 2;
        this.vortexEffect = ScreenEffectHelper.createDefaultVortex(scene, target.x, effectY, this.effectKey, () => {
            // Effect complete - cleanup
            this.vortexEffect = undefined;
        });
        // Delayed execution (instant kill)
        scene.time.delayedCall(this.executionDelay, () => {
            this.executeTarget(context, target);
        });
        // Skill complete after total duration
        scene.time.delayedCall(this.totalDuration, onComplete);
    }
    executeTarget(context, target) {
        if (!target || !target.active || target.isDead)
            return;
        // Instant kill - set health to 0, mark dead
        target.health = 0;
        target.isDead = true;
        // Stop movement
        if (target.body) {
            target.body.setVelocityX(0);
            target.body.setVelocityY(0);
        }
        // HOOK: Call onDeath() if the target has it (BaseEnemy hook pattern)
        if (typeof target.onDeath === 'function') {
            target.onDeath();
        }
        // Play death sound (BaseEnemy uses "deathSound", not "dieSound")
        if (target.deathSound?.play) {
            target.deathSound.play();
        }
        // Play death animation if specified
        if (this.enemyDeathAnimKey && target.play) {
            target.play(this.enemyDeathAnimKey, true);
            // Handle animation complete
            target.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                target.setActive(false);
                target.setVisible(false);
            });
        }
        else {
            // No death animation, just hide after short delay
            context.scene.time.delayedCall(500, () => {
                if (target.active) {
                    target.setActive(false);
                    target.setVisible(false);
                }
            });
        }
    }
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
export class AreaDamageSkill extends SkillBehavior {
    effectKey;
    attackRange;
    damage;
    knockbackForceX;
    knockbackForceY;
    screenShake;
    chargeEffectKey;
    chargeEffect;
    constructor(config) {
        super(config);
        this.effectKey = config.effectKey;
        this.attackRange = config.attackRange ?? 250;
        this.damage = config.damage ?? 80;
        this.knockbackForceX = config.knockbackForceX ?? 400;
        this.knockbackForceY = config.knockbackForceY ?? -200;
        this.screenShake = config.screenShake ?? { duration: 300, intensity: 0.01 };
        this.chargeEffectKey = config.chargeEffectKey;
    }
    /**
     * Create charge effect (call during charge animation)
     * Returns the effect so owner can track/destroy it
     */
    createChargeEffect(context) {
        if (!this.chargeEffectKey)
            return undefined;
        this.chargeEffect = ScreenEffectHelper.createChargeEffect(context.scene, context.owner.x, context.owner.y - 50, this.chargeEffectKey, 500);
        return this.chargeEffect;
    }
    executeSkill(context, onComplete) {
        const owner = context.owner;
        const scene = context.scene;
        // Create explosion effect at player position
        ScreenEffectHelper.createExplosion(scene, owner.x, owner.y - 50, {
            imageKey: this.effectKey,
            scale: 0.5,
            endScale: 1.2,
            alpha: 0.8,
            duration: 600,
        });
        // Find all enemies in range
        const enemies = this.findEnemiesInRange(context, this.attackRange);
        // Apply damage and knockback to all
        enemies.forEach((enemy) => {
            // Apply damage
            if (enemy.takeDamage) {
                enemy.takeDamage(this.damage);
            }
            // Apply knockback (direction based on relative position)
            if (enemy.body) {
                const knockDir = enemy.x > owner.x ? 1 : -1;
                enemy.body.setVelocityX(knockDir * this.knockbackForceX);
                enemy.body.setVelocityY(this.knockbackForceY);
            }
        });
        // Cleanup charge effect
        if (this.chargeEffect) {
            this.chargeEffect.destroy();
            this.chargeEffect = undefined;
        }
        // Screen shake
        ScreenEffectHelper.shake(scene, this.screenShake);
        // Complete after short delay
        scene.time.delayedCall(100, onComplete);
    }
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
export class TargetedAOESkill extends SkillBehavior {
    effectKey;
    aoeRadius;
    damage;
    strikeDelay;
    effectScale;
    effectTint;
    knockbackForceX;
    knockbackForceY;
    screenShake;
    totalDuration;
    constructor(config) {
        super(config);
        this.effectKey = config.effectKey;
        this.aoeRadius = config.aoeRadius ?? 200;
        this.damage = config.damage ?? 70;
        this.strikeDelay = config.strikeDelay ?? 300;
        this.effectScale = config.effectScale ?? 0.6;
        this.effectTint = config.effectTint;
        this.knockbackForceX = config.knockbackForceX ?? 300;
        this.knockbackForceY = config.knockbackForceY ?? -150;
        this.screenShake = config.screenShake ?? {
            duration: 400,
            intensity: 0.012,
        };
        this.totalDuration = config.totalDuration ?? 1000;
    }
    executeSkill(context, onComplete) {
        const scene = context.scene;
        // Find nearest enemy (auto-targeting)
        const target = this.findNearestEnemy(context);
        if (!target) {
            // No enemy found, abort skill
            onComplete();
            return;
        }
        // Store target position (in case target moves/dies)
        const targetX = target.x;
        const targetY = target.y - (target.body?.height ?? 64) / 2;
        // Create strike effect at target position
        this.createStrikeEffect(scene, targetX, targetY);
        // Screen shake
        ScreenEffectHelper.shake(scene, this.screenShake);
        // Apply AOE damage after strike delay
        scene.time.delayedCall(this.strikeDelay, () => {
            this.applyAOEDamage(context, targetX, targetY);
        });
        // Complete after total duration
        scene.time.delayedCall(this.totalDuration, onComplete);
    }
    createStrikeEffect(scene, x, y) {
        // Main strike effect (lightning bolt)
        const effect = scene.add.image(x, y, this.effectKey);
        effect.setScale(this.effectScale);
        effect.setOrigin(0.5, 0.5);
        effect.setAlpha(0.95);
        if (this.effectTint !== undefined) {
            effect.setTint(this.effectTint);
        }
        // Flash animation
        scene.tweens.add({
            targets: effect,
            alpha: 0.5,
            duration: 50,
            yoyo: true,
            repeat: 2,
        });
        // Expand and fade
        scene.tweens.add({
            targets: effect,
            scaleX: this.effectScale * 1.8,
            scaleY: this.effectScale * 1.5,
            alpha: 0,
            duration: 500,
            delay: 200,
            onComplete: () => {
                effect.destroy();
            },
        });
    }
    /**
     * Apply AOE damage to all enemies near the strike position
     * (NOT centered on player, centered on TARGET)
     */
    applyAOEDamage(context, centerX, centerY) {
        const enemies = this.getActiveEnemies(context);
        enemies.forEach((enemy) => {
            // Check distance from strike center (not from player!)
            const dist = Phaser.Math.Distance.Between(centerX, centerY, enemy.x, enemy.y);
            if (dist <= this.aoeRadius) {
                // Apply damage
                if (enemy.takeDamage) {
                    enemy.takeDamage(this.damage);
                }
                // Apply knockback (away from strike center)
                if (enemy.body) {
                    const knockDir = enemy.x > centerX ? 1 : -1;
                    enemy.body.setVelocityX(knockDir * this.knockbackForceX);
                    enemy.body.setVelocityY(this.knockbackForceY);
                }
            }
        });
    }
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
export class BeamAttackSkill extends SkillBehavior {
    beamKey;
    beamWidth;
    beamLength;
    damage;
    beamDuration;
    beamTint;
    penetrating;
    screenShake;
    constructor(config) {
        super(config);
        this.beamKey = config.beamKey;
        this.beamWidth = config.beamWidth ?? 64;
        this.beamLength = config.beamLength ?? 800;
        this.damage = config.damage ?? 40;
        this.beamDuration = config.beamDuration ?? 500;
        this.beamTint = config.beamTint;
        this.penetrating = config.penetrating ?? true;
        this.screenShake = config.screenShake ?? {
            duration: 300,
            intensity: 0.008,
        };
    }
    executeSkill(context, onComplete) {
        const owner = context.owner;
        const scene = context.scene;
        const direction = context.facingDirection === 'right' ? 1 : -1;
        // Calculate beam position
        const beamX = owner.x + (direction * this.beamLength) / 2;
        const beamY = owner.y - (owner.body?.height ?? 64) / 2;
        // Create beam visual
        const beam = scene.add.rectangle(beamX, beamY, this.beamLength, this.beamWidth, this.beamTint ?? 0xffff00, 0.8);
        beam.setOrigin(0.5, 0.5);
        // Flash effect
        scene.tweens.add({
            targets: beam,
            alpha: 0.4,
            duration: 50,
            yoyo: true,
            repeat: 2,
        });
        // Find enemies in beam path
        const hitEnemies = this.findEnemiesInBeam(context, beamX, beamY, direction);
        // Apply damage
        hitEnemies.forEach((enemy) => {
            if (enemy.takeDamage) {
                enemy.takeDamage(this.damage);
            }
            // Knockback away from beam source
            if (enemy.body) {
                enemy.body.setVelocityX(direction * 200);
                enemy.body.setVelocityY(-100);
            }
        });
        // Screen shake
        ScreenEffectHelper.shake(scene, this.screenShake);
        // Fade out beam
        scene.tweens.add({
            targets: beam,
            alpha: 0,
            scaleY: 0.3,
            duration: this.beamDuration,
            ease: 'Power2.easeIn',
            onComplete: () => {
                beam.destroy();
                onComplete();
            },
        });
    }
    findEnemiesInBeam(context, beamCenterX, beamCenterY, direction) {
        const owner = context.owner;
        const enemies = this.getActiveEnemies(context);
        const hitEnemies = [];
        // Beam bounds
        const beamLeft = direction > 0 ? owner.x : owner.x - this.beamLength;
        const beamRight = direction > 0 ? owner.x + this.beamLength : owner.x;
        const beamTop = beamCenterY - this.beamWidth / 2;
        const beamBottom = beamCenterY + this.beamWidth / 2;
        // Use for...of instead of forEach so we can break for non-penetrating beams
        for (const enemy of enemies) {
            const enemyX = enemy.x;
            const enemyY = enemy.y - (enemy.body?.height ?? 64) / 2;
            // Check if enemy center is within beam bounds
            if (enemyX >= beamLeft &&
                enemyX <= beamRight &&
                enemyY >= beamTop &&
                enemyY <= beamBottom) {
                hitEnemies.push(enemy);
                // If not penetrating, stop at first enemy hit
                if (!this.penetrating) {
                    break;
                }
            }
        }
        return hitEnemies;
    }
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
export class GroundQuakeSkill extends SkillBehavior {
    effectKey;
    damage;
    knockbackForceX;
    knockbackForceY;
    screenShake;
    effectRange;
    effectCount;
    constructor(config) {
        super(config);
        this.effectKey = config.effectKey;
        this.damage = config.damage ?? 100;
        this.knockbackForceX = config.knockbackForceX ?? 300;
        this.knockbackForceY = config.knockbackForceY ?? -250;
        this.screenShake = config.screenShake ?? { duration: 500, intensity: 0.02 };
        this.effectRange = config.effectRange ?? 400;
        this.effectCount = config.effectCount ?? 4;
    }
    executeSkill(context, onComplete) {
        const owner = context.owner;
        const scene = context.scene;
        // Strong screen shake (ground pound feel)
        ScreenEffectHelper.shake(scene, this.screenShake);
        // Create ground crack effects spreading outward
        this.createGroundEffects(context);
        // Find all GROUNDED enemies (the key difference from AreaDamageSkill)
        const groundedEnemies = this.findGroundedEnemies(context);
        // Apply damage and knockback
        groundedEnemies.forEach((enemy) => {
            if (enemy.takeDamage) {
                enemy.takeDamage(this.damage);
            }
            // Launch enemies into the air
            if (enemy.body) {
                const knockDir = enemy.x > owner.x ? 1 : -1;
                enemy.body.setVelocityX(knockDir * this.knockbackForceX);
                enemy.body.setVelocityY(this.knockbackForceY);
            }
        });
        // Complete after effects
        scene.time.delayedCall(300, onComplete);
    }
    createGroundEffects(context) {
        const owner = context.owner;
        const scene = context.scene;
        // Create effects spreading left and right
        for (let i = 0; i < this.effectCount; i++) {
            const direction = i % 2 === 0 ? 1 : -1;
            const distance = ((Math.floor(i / 2) + 1) / Math.ceil(this.effectCount / 2)) *
                this.effectRange;
            const delay = i * 50; // Stagger the effects
            scene.time.delayedCall(delay, () => {
                const effectX = owner.x + direction * distance;
                const effectY = owner.y;
                const effect = scene.add.image(effectX, effectY, this.effectKey);
                effect.setScale(0.3 + i * 0.05);
                effect.setOrigin(0.5, 1);
                effect.setAlpha(0.9);
                // Fade out
                scene.tweens.add({
                    targets: effect,
                    alpha: 0,
                    scaleX: effect.scaleX * 1.5,
                    duration: 600,
                    onComplete: () => {
                        effect.destroy();
                    },
                });
            });
        }
    }
    /**
     * Find enemies that are currently on the ground
     * Uses body.blocked.down or body.onFloor() check
     */
    findGroundedEnemies(context) {
        return this.getActiveEnemies(context).filter((enemy) => {
            // Check if enemy is on ground
            if (enemy.body) {
                return enemy.body.blocked?.down || enemy.body.onFloor?.();
            }
            return false;
        });
    }
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
export class BoomerangSkill extends SkillBehavior {
    projectileKey;
    throwSpeed;
    returnSpeed;
    maxDistance;
    damage;
    rotationSpeed;
    projectileSize;
    screenShake;
    projectile;
    isReturning = false;
    hitTargets = new Set();
    rotationTween;
    constructor(config) {
        super(config);
        this.projectileKey = config.projectileKey;
        this.throwSpeed = config.throwSpeed ?? 500;
        this.returnSpeed = config.returnSpeed ?? 600;
        this.maxDistance = config.maxDistance ?? 400;
        this.damage = config.damage ?? 40;
        this.rotationSpeed = config.rotationSpeed ?? 720;
        this.projectileSize = config.projectileSize ?? 50;
        this.screenShake = config.screenShake ?? {
            duration: 200,
            intensity: 0.005,
        };
    }
    update() {
        if (!this.projectile || !this.projectile.active || !this.owner)
            return;
        const body = this.projectile.body;
        if (!body)
            return;
        if (this.isReturning) {
            const dx = this.owner.x - this.projectile.x;
            const dy = (this.owner.body?.center?.y ?? this.owner.y) - this.projectile.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 50) {
                this.destroyProjectile();
                return;
            }
            const angle = Math.atan2(dy, dx);
            body.setVelocity(Math.cos(angle) * this.returnSpeed, Math.sin(angle) * this.returnSpeed);
        }
        // Check collisions with enemies
        if (this.scene) {
            const gameScene = this.scene;
            const enemies = gameScene.enemies?.children?.entries ?? [];
            for (const enemy of enemies) {
                if (!enemy?.active || enemy.isDead || this.hitTargets.has(enemy))
                    continue;
                const dist = Phaser.Math.Distance.Between(this.projectile.x, this.projectile.y, enemy.x, enemy.y);
                if (dist < 60) {
                    this.hitTargets.add(enemy);
                    if (enemy.takeDamage)
                        enemy.takeDamage(this.damage);
                    if (enemy.body) {
                        const knockDir = enemy.x > this.projectile.x ? 1 : -1;
                        enemy.body.setVelocityX(knockDir * 200);
                    }
                }
            }
        }
    }
    executeSkill(context, onComplete) {
        const owner = context.owner;
        const scene = context.scene;
        const direction = context.facingDirection === 'right' ? 1 : -1;
        this.hitTargets.clear();
        this.isReturning = false;
        const spawnX = owner.x + direction * 50;
        const spawnY = owner.body?.center?.y ?? owner.y;
        this.projectile = scene.add.image(spawnX, spawnY, this.projectileKey);
        this.projectile.setOrigin(0.5, 0.5);
        const scale = this.projectileSize /
            Math.max(this.projectile.width, this.projectile.height);
        this.projectile.setScale(scale);
        scene.physics.add.existing(this.projectile);
        const body = this.projectile.body;
        body.setAllowGravity(false);
        body.setVelocityX(direction * this.throwSpeed);
        if (context.facingDirection === 'left') {
            this.projectile.setFlipX(true);
        }
        // Add to playerBullets if available (for ground collision)
        const gameScene = scene;
        if (gameScene.playerBullets) {
            gameScene.playerBullets.add(this.projectile);
        }
        // Rotation animation
        this.rotationTween = scene.tweens.add({
            targets: this.projectile,
            angle: direction * this.rotationSpeed,
            duration: 1000,
            repeat: -1,
        });
        // Start returning after time based on maxDistance / throwSpeed
        const travelTime = (this.maxDistance / this.throwSpeed) * 1000;
        scene.time.delayedCall(travelTime, () => {
            this.isReturning = true;
        });
        // Safety: destroy after 4 seconds regardless
        scene.time.delayedCall(4000, () => {
            this.destroyProjectile();
        });
        ScreenEffectHelper.shake(scene, this.screenShake);
        // Skill completes immediately — projectile continues independently
        onComplete();
    }
    destroyProjectile() {
        if (this.rotationTween) {
            this.rotationTween.destroy();
            this.rotationTween = undefined;
        }
        if (this.projectile?.active) {
            this.projectile.destroy();
        }
        this.projectile = undefined;
        this.isReturning = false;
    }
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
export class MultishotSkill extends SkillBehavior {
    projectileKey;
    projectileCount;
    spreadAngle;
    projectileSpeed;
    damage;
    projectileLifetime;
    projectileSize;
    screenShake;
    constructor(config) {
        super(config);
        this.projectileKey = config.projectileKey;
        this.projectileCount = config.projectileCount ?? 3;
        this.spreadAngle = config.spreadAngle ?? 30;
        this.projectileSpeed = config.projectileSpeed ?? 400;
        this.damage = config.damage ?? 25;
        this.projectileLifetime = config.projectileLifetime ?? 2000;
        this.projectileSize = config.projectileSize ?? 30;
        this.screenShake = config.screenShake ?? {
            duration: 200,
            intensity: 0.005,
        };
    }
    executeSkill(context, onComplete) {
        const owner = context.owner;
        const scene = context.scene;
        const dirX = context.facingDirection === 'right' ? 1 : -1;
        const gameScene = scene;
        const spawnX = owner.x + dirX * 50;
        const spawnY = owner.body?.center?.y ?? owner.y;
        const halfSpread = this.spreadAngle / 2;
        const step = this.projectileCount > 1
            ? this.spreadAngle / (this.projectileCount - 1)
            : 0;
        for (let i = 0; i < this.projectileCount; i++) {
            const angleDeg = this.projectileCount > 1 ? -halfSpread + step * i : 0;
            const angleRad = Phaser.Math.DegToRad(angleDeg);
            const proj = scene.add.image(spawnX, spawnY, this.projectileKey);
            proj.setOrigin(0.5, 0.5);
            const scale = this.projectileSize / Math.max(proj.width, proj.height);
            proj.setScale(scale);
            scene.physics.add.existing(proj);
            const body = proj.body;
            body.setAllowGravity(false);
            body.setVelocity(Math.cos(angleRad) * this.projectileSpeed * dirX, Math.sin(angleRad) * this.projectileSpeed);
            // Rotate sprite to match velocity direction
            const velAngle = Math.atan2(body.velocity.y, body.velocity.x);
            proj.setRotation(velAngle);
            proj.damage = this.damage;
            if (gameScene.playerBullets) {
                gameScene.playerBullets.add(proj);
            }
            scene.time.delayedCall(this.projectileLifetime, () => {
                if (proj.active)
                    proj.destroy();
            });
        }
        ScreenEffectHelper.shake(scene, this.screenShake);
        onComplete();
    }
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
export class ArcProjectileSkill extends SkillBehavior {
    projectileKey;
    launchSpeedX;
    launchSpeedY;
    damage;
    gravity;
    projectileSize;
    rotationSpeed;
    projectileLifetime;
    hasExplosion;
    explosionRadius;
    screenShake;
    constructor(config) {
        super(config);
        this.projectileKey = config.projectileKey;
        this.launchSpeedX = config.launchSpeedX ?? 400;
        this.launchSpeedY = config.launchSpeedY ?? -200;
        this.damage = config.damage ?? 50;
        this.gravity = config.gravity ?? 400;
        this.projectileSize = config.projectileSize ?? 50;
        this.rotationSpeed = config.rotationSpeed ?? 360;
        this.projectileLifetime = config.projectileLifetime ?? 3000;
        this.hasExplosion = config.hasExplosion ?? true;
        this.explosionRadius = config.explosionRadius ?? 0;
        this.screenShake = config.screenShake ?? {
            duration: 200,
            intensity: 0.006,
        };
    }
    executeSkill(context, onComplete) {
        const owner = context.owner;
        const scene = context.scene;
        const dirX = context.facingDirection === 'right' ? 1 : -1;
        const gameScene = scene;
        const spawnX = owner.x + dirX * 60;
        const spawnY = (owner.body?.center?.y ?? owner.y) - 20;
        const proj = scene.add.image(spawnX, spawnY, this.projectileKey);
        proj.setOrigin(0.5, 0.5);
        const scale = this.projectileSize / Math.max(proj.width, proj.height);
        proj.setScale(scale);
        scene.physics.add.existing(proj);
        const body = proj.body;
        body.setAllowGravity(true);
        body.setGravityY(this.gravity);
        body.setVelocity(dirX * this.launchSpeedX, this.launchSpeedY);
        proj.damage = this.damage;
        if (gameScene.playerBullets) {
            gameScene.playerBullets.add(proj);
        }
        // Spin animation
        scene.tweens.add({
            targets: proj,
            angle: dirX * this.rotationSpeed,
            duration: 600,
            repeat: -1,
        });
        // Ground-hit detection via the existing bullet-ground collider
        // is already set up by BaseLevelScene.setupBulletCollisions().
        // We use a custom hit() method so destroyBullet() triggers the explosion.
        proj.hit = () => {
            this.onProjectileImpact(context, proj.x, proj.y);
            proj.destroy();
        };
        // Safety timeout
        scene.time.delayedCall(this.projectileLifetime, () => {
            if (proj.active) {
                this.onProjectileImpact(context, proj.x, proj.y);
                proj.destroy();
            }
        });
        ScreenEffectHelper.shake(scene, this.screenShake);
        onComplete();
    }
    onProjectileImpact(context, x, y) {
        const scene = context.scene;
        if (this.hasExplosion) {
            // Visual: expanding ring + particles
            const ring = scene.add.ellipse(x, y, 40, 20, 0xffaa44, 0.8);
            scene.tweens.add({
                targets: ring,
                scaleX: 4,
                scaleY: 2.5,
                alpha: 0,
                duration: 400,
                onComplete: () => ring.destroy(),
            });
            for (let i = 0; i < 6; i++) {
                const debris = scene.add.circle(x + Phaser.Math.Between(-20, 20), y + Phaser.Math.Between(-10, 10), Phaser.Math.Between(4, 10), 0x8b7355, 0.9);
                scene.tweens.add({
                    targets: debris,
                    y: debris.y - Phaser.Math.Between(40, 100),
                    x: debris.x + Phaser.Math.Between(-30, 30),
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => debris.destroy(),
                });
            }
        }
        // AOE damage
        if (this.explosionRadius > 0) {
            const enemies = this.getActiveEnemies(context);
            enemies.forEach((enemy) => {
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist <= this.explosionRadius) {
                    if (enemy.takeDamage)
                        enemy.takeDamage(this.damage);
                    if (enemy.body) {
                        const knockDir = enemy.x > x ? 1 : -1;
                        enemy.body.setVelocityX(knockDir * 250);
                        enemy.body.setVelocityY(-150);
                    }
                }
            });
        }
    }
}
//# sourceMappingURL=SkillBehavior.js.map