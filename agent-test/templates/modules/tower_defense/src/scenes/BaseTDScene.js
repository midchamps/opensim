import Phaser from 'phaser';
import { CellType, gridToWorld as gridToWorldUtil, worldToGrid, isValidPlacement, createRangeIndicator, addOverlap, drawGridOverlay, } from '../utils';
import { BaseTower } from '../towers/BaseTower';
import { BaseTDEnemy } from '../enemies/BaseTDEnemy';
import { WaveManager } from '../systems/WaveManager';
import { EconomyManager } from '../systems/EconomyManager';
import { LevelManager } from '../LevelManager';
import * as CONFIG from '../gameConfig.json';
export class BaseTDScene extends Phaser.Scene {
    // --- Grid ---
    gridConfig;
    cells;
    gridOffsetX = 0;
    gridOffsetY = 0;
    cellSize = 64;
    // --- Groups ---
    towersGroup;
    enemiesGroup;
    projectilesGroup;
    obstaclesGroup;
    towerSlotGroup;
    // --- Path ---
    pathWaypoints = [];
    // --- Systems ---
    waveManager;
    economyManager;
    // --- Tower types ---
    towerTypes = [];
    selectedTowerTypeId = null;
    // --- Game state ---
    lives = 20;
    maxLives = 20;
    isGameOver = false;
    isVictory = false;
    // --- Placement preview ---
    placementPreview = null;
    rangePreview = null;
    gridOverlay = null;
    // --- Towers placed on grid (for occupancy tracking) ---
    towerGrid = new Map();
    // --- Combo kill tracking ---
    comboCount = 0;
    comboTimer = 0;
    comboWindowMs = 2000;
    // ===================== PHASER LIFECYCLE =====================
    create() {
        this.createBaseElements();
    }
    update(time, delta) {
        if (this.isGameOver || this.isVictory)
            return;
        this.baseUpdate(time, delta);
    }
    // ===================== CREATE FLOW =====================
    createBaseElements() {
        this.onPreCreate();
        this.initializeGrid();
        this.initializeGroups();
        this.extractPath();
        this.createEnvironment();
        this.setupCamera();
        this.setupInputs();
        this.setupCollisions();
        this.initializeSystems();
        this.launchUI();
        this.onPostCreate();
        this.waveManager.startFirstWave();
    }
    initializeGrid() {
        this.gridConfig = this.getGridConfig();
        this.cells = this.gridConfig.cells;
        this.cellSize = this.gridConfig.cellSize;
        this.gridOffsetX = this.gridConfig.offsetX ?? 0;
        this.gridOffsetY = this.gridConfig.offsetY ?? 0;
        const debugEnabled = CONFIG.debugConfig.debug.value;
        if (debugEnabled) {
            this.gridOverlay = drawGridOverlay(this, this.cells, this.cellSize, this.gridOffsetX, this.gridOffsetY);
        }
    }
    initializeGroups() {
        this.towersGroup = this.add.group();
        this.enemiesGroup = this.physics.add.group({ runChildUpdate: true });
        this.projectilesGroup = this.physics.add.group();
        this.obstaclesGroup = this.add.group();
    }
    extractPath() {
        const pathPoints = this.getPathWaypoints();
        this.pathWaypoints = pathPoints.map((p) => this.gridToWorld(p.gridX, p.gridY));
    }
    /**
     * Convert grid coordinates to world (pixel) coordinates.
     * Convenience for subclasses -- uses current grid config.
     */
    gridToWorld(gridX, gridY) {
        return gridToWorldUtil(gridX, gridY, this.cellSize, this.gridOffsetX, this.gridOffsetY);
    }
    setupCamera() {
        const width = CONFIG.screenSize.width.value;
        const height = CONFIG.screenSize.height.value;
        this.cameras.main.setBounds(0, 0, width, height);
    }
    setupInputs() {
        this.input.on('pointermove', (pointer) => {
            this.updatePlacementPreview(pointer);
        });
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleLeftClick(pointer);
            }
            else if (pointer.rightButtonDown()) {
                this.cancelTowerSelection();
            }
        });
        this.input.keyboard?.on('keydown-ESC', () => {
            if (this.selectedTowerTypeId) {
                this.cancelTowerSelection();
            }
            else {
                this.scene.launch('PauseUIScene', { currentLevelKey: this.scene.key });
                this.scene.pause();
            }
        });
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.waveManager?.skipToNextWave();
        });
        this.events.on('towerTypeSelected', (typeId) => {
            this.selectedTowerTypeId = typeId;
            this.setTowerSlotsVisible(true);
        });
        this.events.on('towerTypeDeselected', () => {
            this.clearTowerSelectionState();
            this.setTowerSlotsVisible(false);
        });
    }
    setupCollisions() {
        addOverlap(this, this.projectilesGroup, this.enemiesGroup, (projectile, enemy) => {
            this.onProjectileHitEnemy(projectile, enemy);
        });
    }
    launchUI() {
        this.scene.launch('UIScene', {
            callingScene: this.scene.key,
            gold: this.economyManager.gold,
            lives: this.lives,
            towerTypes: this.towerTypes,
        });
    }
    initializeSystems() {
        const startingGold = CONFIG.towerDefenseConfig.startingGold.value;
        const sellRefundRate = CONFIG.towerDefenseConfig.sellRefundRate.value;
        const timeBetweenWaves = CONFIG.towerDefenseConfig.timeBetweenWaves.value;
        this.lives = CONFIG.towerDefenseConfig.startingLives.value;
        this.maxLives = this.lives;
        this.towerTypes = this.getTowerTypes();
        this.economyManager = new EconomyManager(this, startingGold, sellRefundRate);
        const waveDefs = this.getWaveDefinitions();
        const minSpawnInterval = this.getMinSpawnInterval();
        this.waveManager = new WaveManager(this, waveDefs, timeBetweenWaves, minSpawnInterval);
        this.events.on('spawnEnemy', (enemyType) => {
            this.spawnEnemy(enemyType);
        });
        this.events.on('enemyKilled', (enemy, reward) => {
            this.economyManager.earn(reward);
            this.waveManager.notifyEnemyRemoved();
            this.trackComboKill(enemy);
            this.onEnemyKilled(enemy);
        });
        this.events.on('enemyReachedEnd', (enemy, damage) => {
            this.waveManager.notifyEnemyRemoved();
            this.loseLives(damage);
            this.onEnemyReachedEnd(enemy);
        });
        this.events.on('waveStart', (waveNum, totalWaves) => {
            this.events.emit('waveChanged', waveNum, totalWaves);
            this.onWaveStart(waveNum);
        });
        this.events.on('waveComplete', (waveNum, totalWaves) => {
            this.onWaveComplete(waveNum);
        });
        this.events.on('waveReward', (amount) => {
            this.economyManager.earn(amount);
        });
        this.events.on('obstacleDestroyed', (obstacle, reward) => {
            if (reward > 0) {
                this.economyManager.earn(reward);
            }
            this.onObstacleDestroyed(obstacle);
        });
        this.events.on('goldChanged', (oldGold, newGold) => {
            this.onGoldChanged(oldGold, newGold);
        });
    }
    // ===================== UPDATE FLOW =====================
    baseUpdate(time, delta) {
        this.onPreUpdate();
        this.updateTowers(time, delta);
        this.updateProjectiles();
        this.updateComboTimer(delta);
        this.waveManager.update(delta);
        this.checkEndConditions();
        this.onPostUpdate();
    }
    updateTowers(time, delta) {
        const towers = this.towersGroup.getChildren();
        for (const tower of towers) {
            if (tower.active) {
                tower.update(time, delta);
            }
        }
    }
    updateProjectiles() {
        const projectiles = this.projectilesGroup.getChildren();
        const bounds = this.cameras.main.getBounds();
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            if (!proj.active)
                continue;
            const target = proj.homingTarget;
            const speed = proj.homingSpeed;
            if (target && speed !== undefined) {
                if (!target.active) {
                    proj.destroy();
                    continue;
                }
                const angle = Phaser.Math.Angle.Between(proj.x, proj.y, target.x, target.y);
                proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                proj.setRotation(angle);
            }
            if (proj.x < bounds.x - 50 ||
                proj.x > bounds.x + bounds.width + 50 ||
                proj.y < bounds.y - 50 ||
                proj.y > bounds.y + bounds.height + 50) {
                proj.destroy();
            }
        }
    }
    checkEndConditions() {
        if (this.lives <= 0 && !this.isGameOver) {
            this.isGameOver = true;
            this.onGameOver();
        }
        if (this.waveManager.isAllWavesComplete &&
            !this.isVictory &&
            !this.isGameOver) {
            this.isVictory = true;
            this.onAllWavesComplete();
        }
    }
    // ===================== TOWER PLACEMENT =====================
    handleLeftClick(pointer) {
        const grid = worldToGrid(pointer.worldX, pointer.worldY, this.cellSize, this.gridOffsetX, this.gridOffsetY);
        const gridKey = `${grid.gridX},${grid.gridY}`;
        const existingTower = this.towerGrid.get(gridKey);
        if (existingTower) {
            this.onTowerClicked(existingTower);
            return;
        }
        if (!this.selectedTowerTypeId)
            return;
        if (!isValidPlacement(this.cells, grid.gridX, grid.gridY))
            return;
        const towerConfig = this.towerTypes.find((t) => t.id === this.selectedTowerTypeId);
        if (!towerConfig)
            return;
        if (!this.economyManager.canAfford(towerConfig.cost))
            return;
        this.economyManager.spend(towerConfig.cost);
        const world = this.gridToWorld(grid.gridX, grid.gridY);
        const tower = this.createTower(world.x, world.y, grid.gridX, grid.gridY, towerConfig);
        this.towersGroup.add(tower);
        this.towerGrid.set(gridKey, tower);
        this.onTowerPlaced(tower, grid.gridX, grid.gridY);
    }
    /**
     * Instantiate a tower. Override to use custom tower subclasses.
     * Default creates a BaseTower with the given config.
     */
    createTower(worldX, worldY, gridX, gridY, config) {
        return new BaseTower(this, worldX, worldY, gridX, gridY, config, this.projectilesGroup, this.enemiesGroup);
    }
    /**
     * Sell an existing tower: refund gold, remove from grid.
     */
    sellTower(tower) {
        const gridKey = `${tower.gridX},${tower.gridY}`;
        const refund = this.economyManager.sellTower(tower.invested);
        this.towerGrid.delete(gridKey);
        this.towersGroup.remove(tower, true, true);
        this.onTowerSold(tower);
    }
    /**
     * Upgrade a tower if it can be upgraded and player can afford it.
     */
    upgradeTower(tower) {
        const cost = tower.getUpgradeCost();
        if (cost === null)
            return false;
        if (!this.economyManager.canAfford(cost))
            return false;
        this.economyManager.spend(cost);
        tower.upgrade();
        this.onTowerUpgraded(tower, tower.level);
        return true;
    }
    /**
     * Only clear internal selection state -- no event emitted.
     * Safe to call from event listeners without causing recursion.
     */
    clearTowerSelectionState() {
        this.selectedTowerTypeId = null;
        this.clearPlacementPreview();
    }
    /**
     * Cancel tower selection AND notify listeners.
     * Call from user-initiated actions (click, ESC). Never from event listeners.
     */
    cancelTowerSelection() {
        this.clearTowerSelectionState();
        this.events.emit('towerTypeDeselected');
    }
    // ===================== TOWER SLOT VISIBILITY =====================
    /**
     * Show or hide tower slot indicators.
     * Called automatically when tower selection changes.
     * Tower slots are hidden by default and only shown during placement mode.
     */
    setTowerSlotsVisible(visible) {
        if (!this.towerSlotGroup)
            return;
        const children = this.towerSlotGroup.getChildren();
        for (const child of children) {
            child.setVisible(visible);
        }
    }
    // ===================== PLACEMENT PREVIEW =====================
    updatePlacementPreview(pointer) {
        if (!this.selectedTowerTypeId) {
            this.clearPlacementPreview();
            return;
        }
        const grid = worldToGrid(pointer.worldX, pointer.worldY, this.cellSize, this.gridOffsetX, this.gridOffsetY);
        const world = this.gridToWorld(grid.gridX, grid.gridY);
        const towerConfig = this.towerTypes.find((t) => t.id === this.selectedTowerTypeId);
        if (!towerConfig)
            return;
        const canPlace = isValidPlacement(this.cells, grid.gridX, grid.gridY) &&
            !this.towerGrid.has(`${grid.gridX},${grid.gridY}`);
        if (!this.placementPreview) {
            this.placementPreview = this.add.image(world.x, world.y, towerConfig.textureKey);
            this.placementPreview.setOrigin(0.5, 0.5);
            const tex = this.textures.get(towerConfig.textureKey);
            if (tex?.getSourceImage()) {
                const srcH = tex.getSourceImage().height;
                if (srcH > 0)
                    this.placementPreview.setScale(this.cellSize / srcH);
            }
            this.placementPreview.setDepth(200);
        }
        else {
            this.placementPreview.setPosition(world.x, world.y);
            this.placementPreview.setTexture(towerConfig.textureKey);
        }
        this.placementPreview.setAlpha(canPlace ? 0.7 : 0.3);
        this.placementPreview.setTint(canPlace ? 0x00ff00 : 0xff0000);
        this.rangePreview?.destroy();
        this.rangePreview = createRangeIndicator(this, world.x, world.y, towerConfig.range, canPlace ? 0x00ff00 : 0xff0000);
    }
    clearPlacementPreview() {
        this.placementPreview?.destroy();
        this.placementPreview = null;
        this.rangePreview?.destroy();
        this.rangePreview = null;
    }
    // ===================== ENEMY SPAWNING =====================
    /**
     * Spawn an enemy of the given type at the start of the path.
     * Override to map enemyType strings to actual enemy subclasses.
     */
    spawnEnemy(enemyType) {
        const enemy = this.createEnemy(enemyType);
        if (enemy) {
            this.enemiesGroup.add(enemy);
            enemy.setPath(this.pathWaypoints);
        }
    }
    // ===================== PROJECTILE HIT =====================
    /**
     * Called when a projectile overlaps an enemy.
     * Default: deal damage, handle splash with distance falloff if present,
     * play hit effect, then destroy projectile.
     * Override to add custom on-hit effects (slow, poison, etc.).
     */
    onProjectileHitEnemy(projectile, enemy) {
        if (!projectile.active)
            return;
        const damage = projectile.damage ?? 10;
        const splashRadius = projectile.splashRadius;
        if (splashRadius && splashRadius > 0) {
            const enemies = this.enemiesGroup.getChildren();
            for (const e of enemies) {
                if (!e.active)
                    continue;
                const dist = Phaser.Math.Distance.Between(projectile.x, projectile.y, e.x, e.y);
                if (dist <= splashRadius) {
                    const falloff = 1 - (dist / splashRadius) * 0.5;
                    e.takeDamage(Math.round(damage * falloff));
                }
            }
        }
        else {
            enemy.takeDamage(damage);
        }
        this.playProjectileHitEffect(projectile);
        projectile.destroy();
    }
    /**
     * Play a visual hit effect at the projectile impact point.
     * Default: brief scale-up and fade-out tween on a temporary sprite.
     * Override to customize per-projectile-type effects.
     */
    playProjectileHitEffect(projectile) {
        const hitSprite = this.add.sprite(projectile.x, projectile.y, projectile.texture.key);
        hitSprite.setScale(projectile.scaleX);
        hitSprite.setDepth(150);
        hitSprite.setAlpha(0.8);
        this.tweens.add({
            targets: hitSprite,
            scaleX: hitSprite.scaleX * 2.5,
            scaleY: hitSprite.scaleY * 2.5,
            alpha: 0,
            duration: 200,
            ease: 'Quad.easeOut',
            onComplete: () => hitSprite.destroy(),
        });
    }
    // ===================== COMBO KILL SYSTEM =====================
    trackComboKill(_enemy) {
        this.comboCount++;
        this.comboTimer = this.comboWindowMs;
        if (this.comboCount >= 2) {
            this.onComboKill(this.comboCount);
        }
    }
    updateComboTimer(delta) {
        if (this.comboTimer <= 0)
            return;
        this.comboTimer -= delta;
        if (this.comboTimer <= 0) {
            this.comboCount = 0;
            this.comboTimer = 0;
        }
    }
    // ===================== LIVES SYSTEM =====================
    loseLives(amount) {
        const oldLives = this.lives;
        this.lives = Math.max(0, this.lives - amount);
        this.events.emit('livesChanged', oldLives, this.lives);
        this.onLivesChanged(oldLives, this.lives);
    }
    /**
     * Return the minimum spawn interval (ms) between enemies in a wave.
     * Prevents visual overlap when enemy display sizes are large.
     * Default: 700ms. Override to tune per-level based on enemy sizes and speeds.
     * Formula: (largestEnemyDisplayHeight / slowestEnemySpeed) * 1000 * 1.2
     */
    getMinSpawnInterval() {
        return 700;
    }
    // ===================== HOOKS (CAN override) =====================
    /** Called before scene creation begins */
    onPreCreate() { }
    /** Called after all scene creation is complete */
    onPostCreate() { }
    /** Called before each frame update */
    onPreUpdate() { }
    /** Called after each frame update */
    onPostUpdate() { }
    /** Called when a new wave starts */
    onWaveStart(_waveNumber) { }
    /** Called when a wave is cleared */
    onWaveComplete(_waveNumber) { }
    /**
     * Called when all waves are cleared.
     * Default: routes to VictoryUIScene (has next level) or GameCompleteUIScene (final level).
     * Override to customize the end-of-level flow.
     */
    onAllWavesComplete() {
        const currentKey = this.scene.key;
        if (LevelManager.isLastLevel(currentKey)) {
            this.scene.launch('GameCompleteUIScene', { currentLevelKey: currentKey });
        }
        else {
            this.scene.launch('VictoryUIScene', { currentLevelKey: currentKey });
        }
        this.scene.pause();
    }
    /** Called when an enemy is killed */
    onEnemyKilled(_enemy) { }
    /** Called when an enemy reaches the exit */
    onEnemyReachedEnd(_enemy) { }
    /** Called when a tower is successfully placed */
    onTowerPlaced(_tower, _gridX, _gridY) { }
    /**
     * Called when player clicks on an existing tower.
     * Override to show upgrade/sell UI or cycle tower types.
     * Use this.upgradeTower(tower) and this.sellTower(tower) for actions.
     */
    onTowerClicked(_tower) { }
    /** Called when a tower is sold */
    onTowerSold(_tower) { }
    /** Called when a tower is upgraded */
    onTowerUpgraded(_tower, _level) { }
    /** Called when lives change */
    onLivesChanged(_oldLives, _newLives) { }
    /** Called when gold changes */
    onGoldChanged(_oldGold, _newGold) { }
    /**
     * Called when multiple enemies are killed in quick succession.
     * Override to award bonus gold, show combo UI, play sounds, etc.
     * @param comboCount - number of kills in the current combo chain (>= 2)
     */
    onComboKill(_comboCount) { }
    /**
     * Called when a destructible obstacle is destroyed.
     * Override to convert the cell to BUILDABLE, create a tower slot, etc.
     */
    onObstacleDestroyed(_obstacle) { }
    /** Called when lives reach 0. Default: launch GameOverUIScene */
    onGameOver() {
        this.scene.launch('GameOverUIScene', { currentLevelKey: this.scene.key });
        this.scene.pause();
    }
    // ===================== CLEANUP =====================
    shutdown() {
        this.waveManager?.destroy();
        this.economyManager?.destroy();
        this.clearPlacementPreview();
        this.gridOverlay?.destroy();
        this.towerSlotGroup?.clear(true, true);
        this.towerGrid.clear();
    }
}
//# sourceMappingURL=BaseTDScene.js.map