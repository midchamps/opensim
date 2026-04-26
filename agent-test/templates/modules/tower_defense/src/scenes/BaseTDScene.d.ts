import Phaser from 'phaser';
import { CellType, type WorldPoint } from '../utils';
import { BaseTower } from '../towers/BaseTower';
import type { TowerTypeConfig } from '../towers/BaseTower';
import { BaseTDEnemy } from '../enemies/BaseTDEnemy';
import type { BaseObstacle } from '../entities/BaseObstacle';
import { WaveManager } from '../systems/WaveManager';
import type { WaveDefinition } from '../systems/WaveManager';
import { EconomyManager } from '../systems/EconomyManager';
export interface GridConfig {
    cols: number;
    rows: number;
    cellSize: number;
    cells: CellType[][];
    offsetX?: number;
    offsetY?: number;
}
export interface PathPoint {
    gridX: number;
    gridY: number;
}
export declare abstract class BaseTDScene extends Phaser.Scene {
    protected gridConfig: GridConfig;
    protected cells: CellType[][];
    protected gridOffsetX: number;
    protected gridOffsetY: number;
    protected cellSize: number;
    protected towersGroup: Phaser.GameObjects.Group;
    protected enemiesGroup: Phaser.Physics.Arcade.Group;
    protected projectilesGroup: Phaser.Physics.Arcade.Group;
    protected obstaclesGroup: Phaser.GameObjects.Group;
    protected towerSlotGroup?: Phaser.GameObjects.Group;
    protected pathWaypoints: WorldPoint[];
    protected waveManager: WaveManager;
    protected economyManager: EconomyManager;
    protected towerTypes: TowerTypeConfig[];
    protected selectedTowerTypeId: string | null;
    protected lives: number;
    protected maxLives: number;
    protected isGameOver: boolean;
    protected isVictory: boolean;
    private placementPreview;
    private rangePreview;
    private gridOverlay;
    protected towerGrid: Map<string, BaseTower>;
    private comboCount;
    private comboTimer;
    private comboWindowMs;
    create(): void;
    update(time: number, delta: number): void;
    private createBaseElements;
    private initializeGrid;
    private initializeGroups;
    private extractPath;
    /**
     * Convert grid coordinates to world (pixel) coordinates.
     * Convenience for subclasses -- uses current grid config.
     */
    protected gridToWorld(gridX: number, gridY: number): {
        x: number;
        y: number;
    };
    private setupCamera;
    private setupInputs;
    private setupCollisions;
    private launchUI;
    private initializeSystems;
    private baseUpdate;
    private updateTowers;
    private updateProjectiles;
    private checkEndConditions;
    private handleLeftClick;
    /**
     * Instantiate a tower. Override to use custom tower subclasses.
     * Default creates a BaseTower with the given config.
     */
    protected createTower(worldX: number, worldY: number, gridX: number, gridY: number, config: TowerTypeConfig): BaseTower;
    /**
     * Sell an existing tower: refund gold, remove from grid.
     */
    protected sellTower(tower: BaseTower): void;
    /**
     * Upgrade a tower if it can be upgraded and player can afford it.
     */
    protected upgradeTower(tower: BaseTower): boolean;
    /**
     * Only clear internal selection state -- no event emitted.
     * Safe to call from event listeners without causing recursion.
     */
    private clearTowerSelectionState;
    /**
     * Cancel tower selection AND notify listeners.
     * Call from user-initiated actions (click, ESC). Never from event listeners.
     */
    private cancelTowerSelection;
    /**
     * Show or hide tower slot indicators.
     * Called automatically when tower selection changes.
     * Tower slots are hidden by default and only shown during placement mode.
     */
    private setTowerSlotsVisible;
    private updatePlacementPreview;
    private clearPlacementPreview;
    /**
     * Spawn an enemy of the given type at the start of the path.
     * Override to map enemyType strings to actual enemy subclasses.
     */
    protected spawnEnemy(enemyType: string): void;
    /**
     * Instantiate an enemy by type string.
     * MUST be overridden by subclasses to create the correct enemy subclass.
     */
    protected abstract createEnemy(enemyType: string): BaseTDEnemy | null;
    /**
     * Called when a projectile overlaps an enemy.
     * Default: deal damage, handle splash with distance falloff if present,
     * play hit effect, then destroy projectile.
     * Override to add custom on-hit effects (slow, poison, etc.).
     */
    protected onProjectileHitEnemy(projectile: Phaser.Physics.Arcade.Sprite, enemy: BaseTDEnemy): void;
    /**
     * Play a visual hit effect at the projectile impact point.
     * Default: brief scale-up and fade-out tween on a temporary sprite.
     * Override to customize per-projectile-type effects.
     */
    protected playProjectileHitEffect(projectile: Phaser.Physics.Arcade.Sprite): void;
    private trackComboKill;
    private updateComboTimer;
    private loseLives;
    /**
     * Return the grid configuration for this level.
     * Defines grid dimensions, cell size, and the 2D cell type array.
     */
    protected abstract getGridConfig(): GridConfig;
    /**
     * Return the ordered path waypoints in grid coordinates.
     * Enemies follow these points from spawn to exit.
     */
    protected abstract getPathWaypoints(): PathPoint[];
    /**
     * Create the visual environment: background image, decorations, grid overlay.
     * Called after grid is initialized.
     */
    protected abstract createEnvironment(): void;
    /**
     * Return all wave definitions for this level.
     * Each wave contains groups of enemies with spawn intervals.
     */
    protected abstract getWaveDefinitions(): WaveDefinition[];
    /**
     * Return all tower types available in this level.
     * These are displayed in the UI tower selection panel.
     */
    protected abstract getTowerTypes(): TowerTypeConfig[];
    /**
     * Return the minimum spawn interval (ms) between enemies in a wave.
     * Prevents visual overlap when enemy display sizes are large.
     * Default: 700ms. Override to tune per-level based on enemy sizes and speeds.
     * Formula: (largestEnemyDisplayHeight / slowestEnemySpeed) * 1000 * 1.2
     */
    protected getMinSpawnInterval(): number;
    /** Called before scene creation begins */
    protected onPreCreate(): void;
    /** Called after all scene creation is complete */
    protected onPostCreate(): void;
    /** Called before each frame update */
    protected onPreUpdate(): void;
    /** Called after each frame update */
    protected onPostUpdate(): void;
    /** Called when a new wave starts */
    protected onWaveStart(_waveNumber: number): void;
    /** Called when a wave is cleared */
    protected onWaveComplete(_waveNumber: number): void;
    /**
     * Called when all waves are cleared.
     * Default: routes to VictoryUIScene (has next level) or GameCompleteUIScene (final level).
     * Override to customize the end-of-level flow.
     */
    protected onAllWavesComplete(): void;
    /** Called when an enemy is killed */
    protected onEnemyKilled(_enemy: BaseTDEnemy): void;
    /** Called when an enemy reaches the exit */
    protected onEnemyReachedEnd(_enemy: BaseTDEnemy): void;
    /** Called when a tower is successfully placed */
    protected onTowerPlaced(_tower: BaseTower, _gridX: number, _gridY: number): void;
    /**
     * Called when player clicks on an existing tower.
     * Override to show upgrade/sell UI or cycle tower types.
     * Use this.upgradeTower(tower) and this.sellTower(tower) for actions.
     */
    protected onTowerClicked(_tower: BaseTower): void;
    /** Called when a tower is sold */
    protected onTowerSold(_tower: BaseTower): void;
    /** Called when a tower is upgraded */
    protected onTowerUpgraded(_tower: BaseTower, _level: number): void;
    /** Called when lives change */
    protected onLivesChanged(_oldLives: number, _newLives: number): void;
    /** Called when gold changes */
    protected onGoldChanged(_oldGold: number, _newGold: number): void;
    /**
     * Called when multiple enemies are killed in quick succession.
     * Override to award bonus gold, show combo UI, play sounds, etc.
     * @param comboCount - number of kills in the current combo chain (>= 2)
     */
    protected onComboKill(_comboCount: number): void;
    /**
     * Called when a destructible obstacle is destroyed.
     * Override to convert the cell to BUILDABLE, create a tower slot, etc.
     */
    protected onObstacleDestroyed(_obstacle: BaseObstacle): void;
    /** Called when lives reach 0. Default: launch GameOverUIScene */
    protected onGameOver(): void;
    shutdown(): void;
}
