import Phaser from 'phaser';
import { initScale, createProjectile, launchProjectileAt, createBulletTextures, createRangeIndicator, PROJECTILE_SIZES, } from '../utils';
export class BaseTower extends Phaser.GameObjects.Image {
    towerConfig;
    currentLevel = 1;
    currentDamage;
    currentRange;
    currentFireRate;
    projectileKey;
    projectileSpeed;
    targetingMode;
    fireTimer = 0;
    totalInvested;
    /** Grid coordinates where this tower is placed */
    gridX;
    gridY;
    projectilesGroup;
    enemiesGroup;
    rangeCircle = null;
    constructor(scene, worldX, worldY, gridX, gridY, config, projectilesGroup, enemiesGroup) {
        super(scene, worldX, worldY, config.textureKey);
        this.towerConfig = config;
        this.gridX = gridX;
        this.gridY = gridY;
        this.currentDamage = config.damage;
        this.currentRange = config.range;
        this.currentFireRate = config.fireRate;
        this.projectileKey = config.projectileKey ?? 'tower_bullet';
        this.projectileSpeed = config.projectileSpeed ?? 300;
        this.targetingMode = config.targetingMode ?? 'first';
        this.totalInvested = config.cost;
        this.projectilesGroup = projectilesGroup;
        this.enemiesGroup = enemiesGroup;
        scene.add.existing(this);
        initScale(this, { x: 0.5, y: 0.5 }, undefined, 72, 0.8, 0.8);
        createBulletTextures(scene);
        this.setInteractive();
        this.on('pointerover', this.showRangeCircle, this);
        this.on('pointerout', this.hideRangeCircle, this);
    }
    get level() {
        return this.currentLevel;
    }
    get invested() {
        return this.totalInvested;
    }
    get range() {
        return this.currentRange;
    }
    get typeId() {
        return this.towerConfig.id;
    }
    get typeName() {
        return this.towerConfig.name;
    }
    // ===================== UPDATE LOOP =====================
    update(time, delta) {
        this.fireTimer += delta;
        const fireInterval = 1000 / this.currentFireRate;
        if (this.fireTimer >= fireInterval) {
            const target = this.findTarget();
            if (target) {
                this.fire(target);
                this.fireTimer = 0;
            }
        }
    }
    // ===================== TARGETING =====================
    findTarget() {
        const enemies = this.enemiesGroup.getChildren();
        const inRange = [];
        for (const enemy of enemies) {
            if (!enemy.active)
                continue;
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist <= this.currentRange) {
                inRange.push(enemy);
            }
        }
        if (inRange.length === 0)
            return null;
        switch (this.targetingMode) {
            case 'first':
                return this.getFirstEnemy(inRange);
            case 'last':
                return this.getLastEnemy(inRange);
            case 'closest':
                return this.getClosestEnemy(inRange);
            case 'strongest':
                return this.getStrongestEnemy(inRange);
            default:
                return inRange[0];
        }
    }
    /** "First" = furthest along the path (highest pathProgress) */
    getFirstEnemy(enemies) {
        return enemies.reduce((best, e) => e.pathProgress > best.pathProgress ? e : best);
    }
    getLastEnemy(enemies) {
        return enemies.reduce((best, e) => e.pathProgress < best.pathProgress ? e : best);
    }
    getClosestEnemy(enemies) {
        return enemies.reduce((best, e) => {
            const distE = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
            const distBest = Phaser.Math.Distance.Between(this.x, this.y, best.x, best.y);
            return distE < distBest ? e : best;
        });
    }
    getStrongestEnemy(enemies) {
        return enemies.reduce((best, e) => (e.health > best.health ? e : best));
    }
    // ===================== FIRING =====================
    fire(target) {
        const projectile = this.createProjectile(target);
        if (projectile) {
            this.projectilesGroup.add(projectile);
            if (this.towerConfig.homing) {
                projectile.homingTarget = target;
                projectile.homingSpeed = this.projectileSpeed;
            }
            const body = target.body;
            let aimX = target.x;
            let aimY = target.y;
            if (body && this.projectileSpeed > 0 && !this.towerConfig.homing) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
                const flightTime = dist / this.projectileSpeed;
                aimX += body.velocity.x * flightTime * 0.5;
                aimY += body.velocity.y * flightTime * 0.5;
            }
            launchProjectileAt(projectile, aimX, aimY, this.projectileSpeed);
        }
        this.playFireAnimation();
        this.onFire(target);
    }
    // ===================== FIRE ANIMATION =====================
    /**
     * Subtle scale pulse when the tower fires.
     * Override to customize the animation per tower type.
     */
    playFireAnimation() {
        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1.15,
            scaleY: this.scaleY * 1.15,
            duration: 80,
            yoyo: true,
            ease: 'Quad.easeOut',
        });
    }
    // ===================== RANGE INDICATOR =====================
    /**
     * Return the color used for this tower's range circle.
     * Override to provide type-specific colors (e.g., blue for ice, red for cannon).
     */
    getRangeCircleColor() {
        return 0xffffff;
    }
    showRangeCircle() {
        this.hideRangeCircle();
        this.rangeCircle = createRangeIndicator(this.scene, this.x, this.y, this.currentRange, this.getRangeCircleColor(), 0.2);
    }
    hideRangeCircle() {
        this.rangeCircle?.destroy();
        this.rangeCircle = null;
    }
    // ===================== UPGRADE =====================
    canUpgrade() {
        const stats = this.getUpgradeStats();
        return stats !== null;
    }
    getUpgradeCost() {
        const stats = this.getUpgradeStats();
        return stats?.cost ?? null;
    }
    upgrade() {
        const stats = this.getUpgradeStats();
        if (!stats)
            return false;
        this.currentLevel = stats.level;
        this.currentDamage = stats.damage;
        this.currentRange = stats.range;
        this.currentFireRate = stats.fireRate;
        this.totalInvested += stats.cost;
        this.onUpgrade(this.currentLevel);
        return true;
    }
    // ===================== HOOKS (override in subclass) =====================
    /** Called when the tower fires at a target. Override for fire sound/animation. */
    onFire(_target) { }
    /** Called after upgrade. Override for visual upgrade effect. */
    onUpgrade(_newLevel) { }
    /**
     * Create and return the projectile sprite.
     * Override to create splash projectiles, slow projectiles, etc.
     * The returned projectile will be added to projectilesGroup and launched.
     */
    createProjectile(_target) {
        const size = this.projectileKey === 'tower_bullet'
            ? PROJECTILE_SIZES.BULLET_SMALL
            : PROJECTILE_SIZES.ARROW;
        return createProjectile(this.scene, this.x, this.y, this.projectileKey, size, this.currentDamage);
    }
    /**
     * Return stats for the next upgrade level.
     * Return null if tower is at max level.
     * Override to provide custom upgrade paths.
     */
    getUpgradeStats() {
        if (!this.towerConfig.upgrades || this.towerConfig.upgrades.length === 0)
            return null;
        const next = this.towerConfig.upgrades.find((u) => u.level === this.currentLevel + 1);
        return next ?? null;
    }
    // ===================== CLEANUP =====================
    destroy(fromScene) {
        this.hideRangeCircle();
        super.destroy(fromScene);
    }
}
//# sourceMappingURL=BaseTower.js.map