import Phaser from 'phaser';
import { initScale } from '../utils';
export class BaseObstacle extends Phaser.GameObjects.Image {
    config;
    _maxHealth;
    _currentHealth;
    reward;
    isDestroyed = false;
    healthBar;
    healthBarBg;
    constructor(scene, x, y, config) {
        super(scene, x, y, config.textureKey);
        this.config = config;
        this._maxHealth = config.maxHealth;
        this._currentHealth = this._maxHealth;
        this.reward = config.reward ?? 0;
        scene.add.existing(this);
        if (config.displayHeight) {
            initScale(this, { x: 0.5, y: 0.5 }, undefined, config.displayHeight);
        }
        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', this.handleClick, this);
        this.createHealthBar();
    }
    get health() {
        return this._currentHealth;
    }
    get maxHealth() {
        return this._maxHealth;
    }
    // ===================== CLICK HANDLING =====================
    handleClick() {
        if (this.isDestroyed)
            return;
        const damage = this.getClickDamage();
        this._currentHealth -= damage;
        this.updateHealthBar();
        this.playDamageEffect();
        this.onClicked();
        this.onDamaged(this._currentHealth);
        if (this._currentHealth <= 0) {
            this._currentHealth = 0;
            this.destroyObstacle();
        }
    }
    destroyObstacle() {
        if (this.isDestroyed)
            return;
        this.isDestroyed = true;
        this.onDestroyed();
        this.scene.events.emit('obstacleDestroyed', this, this.reward);
        this.healthBar?.destroy();
        this.healthBarBg?.destroy();
        this.destroy();
    }
    // ===================== VISUAL FEEDBACK =====================
    playDamageEffect() {
        this.setTint(0xff6666);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDestroyed)
                this.clearTint();
        });
        this.scene.tweens.add({
            targets: this,
            x: this.x + Phaser.Math.Between(-3, 3),
            y: this.y + Phaser.Math.Between(-2, 2),
            duration: 50,
            yoyo: true,
            ease: 'Sine.easeInOut',
        });
    }
    // ===================== HEALTH BAR =====================
    createHealthBar() {
        this.healthBarBg = this.scene.add.graphics();
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
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
            ? 0x88cc44
            : healthPercent > 0.25
                ? 0xffaa00
                : 0xff4444;
        this.healthBar.clear();
        this.healthBar.fillStyle(color, 0.9);
        this.healthBar.fillRect(this.x - barWidth / 2, this.y + offsetY, barWidth * healthPercent, barHeight);
        this.healthBar.setDepth(101);
    }
    // ===================== HOOKS (override in subclass) =====================
    /** Called when the obstacle is clicked. Override for click sound/visual. */
    onClicked() { }
    /** Called after damage is applied. Override for damage feedback. */
    onDamaged(_remainingHealth) { }
    /** Called when the obstacle is destroyed. Override for destruction effects. */
    onDestroyed() { }
    /**
     * Return how much damage each click deals.
     * Override to change click damage (e.g., based on player upgrades).
     */
    getClickDamage() {
        return 1;
    }
}
//# sourceMappingURL=BaseObstacle.js.map