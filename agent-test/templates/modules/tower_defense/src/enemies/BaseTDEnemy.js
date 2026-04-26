import Phaser from 'phaser';
import { initScale, getDirectionBetween } from '../utils';
export class BaseTDEnemy extends Phaser.Physics.Arcade.Sprite {
    config;
    _maxHealth;
    _currentHealth;
    baseSpeed;
    reward;
    exitDamage;
    waypoints = [];
    _currentWaypointIndex = 0;
    isDead = false;
    statusEffects = new Map();
    healthBar;
    healthBarBg;
    constructor(scene, x, y, config) {
        super(scene, x, y, config.textureKey);
        this.config = config;
        this._maxHealth = config.stats.maxHealth;
        this._currentHealth = this._maxHealth;
        this.baseSpeed = config.stats.speed;
        this.reward = config.stats.reward;
        this.exitDamage = config.stats.damage ?? 1;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setAllowGravity(false);
        if (config.displayHeight) {
            initScale(this, { x: 0.5, y: 0.5 }, undefined, config.displayHeight, 0.6, 0.6);
        }
        this.createHealthBar();
    }
    // ===================== PUBLIC GETTERS (for targeting) =====================
    get health() {
        return this._currentHealth;
    }
    get maxHealth() {
        return this._maxHealth;
    }
    get currentWaypointIndex() {
        return this._currentWaypointIndex;
    }
    /** Effective speed after all status effect multipliers */
    get effectiveSpeed() {
        let multiplier = 1;
        for (const effect of this.statusEffects.values()) {
            multiplier *= effect.speedMultiplier;
        }
        return this.baseSpeed * multiplier;
    }
    /** 0 = at spawn, 1 = at exit. Used by tower targeting ('first'/'last') */
    get pathProgress() {
        if (this.waypoints.length <= 1)
            return 0;
        return this._currentWaypointIndex / (this.waypoints.length - 1);
    }
    /** Gold reward when this enemy is killed */
    get killReward() {
        return this.reward;
    }
    /**
     * Initialize the path for this enemy to follow.
     * Called by BaseTDScene after spawning.
     */
    setPath(waypoints) {
        this.waypoints = waypoints;
        this._currentWaypointIndex = 0;
        if (waypoints.length > 0) {
            this.setPosition(waypoints[0].x, waypoints[0].y);
        }
        this.onSpawn();
    }
    update(time, delta) {
        if (this.isDead || this.waypoints.length === 0)
            return;
        this.updateStatusEffects(delta);
        this.moveAlongPath(delta);
        this.updateHealthBar();
        this.updateAnimation();
    }
    // ===================== PATH FOLLOWING =====================
    moveAlongPath(delta) {
        if (this._currentWaypointIndex >= this.waypoints.length) {
            this.reachEnd();
            return;
        }
        const target = this.waypoints[this._currentWaypointIndex];
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        const step = this.effectiveSpeed * (delta / 1000);
        if (distance <= step) {
            this.setPosition(target.x, target.y);
            this._currentWaypointIndex++;
            if (this._currentWaypointIndex >= this.waypoints.length) {
                this.reachEnd();
            }
        }
        else {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            this.setPosition(this.x + Math.cos(angle) * step, this.y + Math.sin(angle) * step);
        }
        // Sync physics body position with sprite after manual setPosition.
        // Required for overlap/collision detection to work correctly.
        const body = this.body;
        if (body) {
            body.reset(this.x, this.y);
        }
    }
    updateAnimation() {
        if (this._currentWaypointIndex >= this.waypoints.length)
            return;
        const target = this.waypoints[this._currentWaypointIndex];
        const direction = getDirectionBetween({ x: this.x, y: this.y }, target);
        const animKey = this.getAnimationKey(direction);
        if (animKey && this.anims?.currentAnim?.key !== animKey) {
            if (this.scene.anims.exists(animKey)) {
                this.play(animKey, true);
            }
        }
        if (direction === 'left') {
            this.setFlipX(true);
        }
        else if (direction === 'right') {
            this.setFlipX(false);
        }
    }
    // ===================== DAMAGE =====================
    takeDamage(damage) {
        if (this.isDead)
            return;
        this._currentHealth -= damage;
        this.onDamageTaken(damage);
        if (this._currentHealth <= 0) {
            this._currentHealth = 0;
            this.die();
        }
    }
    die() {
        if (this.isDead)
            return;
        this.isDead = true;
        this.onDeath();
        this.scene.events.emit('enemyKilled', this, this.reward);
        this.destroySelf();
    }
    reachEnd() {
        if (this.isDead)
            return;
        this.isDead = true;
        this.onReachEnd();
        this.scene.events.emit('enemyReachedEnd', this, this.exitDamage);
        this.destroySelf();
    }
    destroySelf() {
        this.statusEffects.clear();
        this.healthBar?.destroy();
        this.healthBarBg?.destroy();
        this.destroy();
    }
    // ===================== STATUS EFFECT SYSTEM =====================
    /**
     * Apply a status effect (e.g., slow). If the same id is already active,
     * the duration is refreshed (not stacked).
     */
    applyStatusEffect(id, speedMultiplier, duration, tint) {
        if (this.isDead)
            return;
        const existing = this.statusEffects.get(id);
        if (existing) {
            existing.speedMultiplier = speedMultiplier;
            existing.duration = duration;
            existing.elapsed = 0;
            existing.tint = tint;
        }
        else {
            this.statusEffects.set(id, {
                id,
                speedMultiplier,
                duration,
                elapsed: 0,
                tint,
            });
            this.onStatusEffectApplied(id);
        }
        this.updateTintFromEffects();
    }
    hasStatusEffect(id) {
        return this.statusEffects.has(id);
    }
    updateStatusEffects(delta) {
        const toRemove = [];
        for (const [id, effect] of this.statusEffects) {
            effect.elapsed += delta;
            if (effect.elapsed >= effect.duration) {
                toRemove.push(id);
            }
        }
        for (const id of toRemove) {
            this.statusEffects.delete(id);
            this.onStatusEffectRemoved(id);
        }
        if (toRemove.length > 0) {
            this.updateTintFromEffects();
        }
    }
    updateTintFromEffects() {
        let tint;
        for (const effect of this.statusEffects.values()) {
            if (effect.tint !== undefined) {
                tint = effect.tint;
            }
        }
        if (tint !== undefined) {
            this.setTint(tint);
        }
        else {
            this.clearTint();
        }
    }
    // ===================== HEALTH BAR =====================
    createHealthBar() {
        this.healthBarBg = this.scene.add.graphics();
        this.healthBar = this.scene.add.graphics();
    }
    updateHealthBar() {
        if (!this.healthBar || !this.healthBarBg)
            return;
        const barWidth = 30;
        const barHeight = 4;
        const offsetY = -this.displayHeight / 2 - 8;
        this.healthBarBg.clear();
        this.healthBarBg.fillStyle(0x000000, 0.6);
        this.healthBarBg.fillRect(this.x - barWidth / 2, this.y + offsetY, barWidth, barHeight);
        this.healthBarBg.setDepth(100);
        const healthPercent = this._currentHealth / this._maxHealth;
        const color = healthPercent > 0.5
            ? 0x00ff00
            : healthPercent > 0.25
                ? 0xffff00
                : 0xff0000;
        this.healthBar.clear();
        this.healthBar.fillStyle(color, 0.9);
        this.healthBar.fillRect(this.x - barWidth / 2, this.y + offsetY, barWidth * healthPercent, barHeight);
        this.healthBar.setDepth(101);
    }
    // ===================== HOOKS (override in subclass) =====================
    /** Called when the enemy is spawned and path is set */
    onSpawn() { }
    /** Called when the enemy takes damage */
    onDamageTaken(_damage) { }
    /** Called when the enemy health reaches 0 */
    onDeath() { }
    /** Called when the enemy reaches the last waypoint */
    onReachEnd() { }
    /** Called when a status effect is applied */
    onStatusEffectApplied(_effectId) { }
    /** Called when a status effect expires */
    onStatusEffectRemoved(_effectId) { }
    /**
     * Return an animation key based on facing direction.
     * Override to provide directional walking animations.
     */
    getAnimationKey(_direction) {
        return null;
    }
}
//# sourceMappingURL=BaseTDEnemy.js.map