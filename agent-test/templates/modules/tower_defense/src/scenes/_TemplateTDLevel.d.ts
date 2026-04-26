import { BaseTDScene } from './BaseTDScene';
import type { GridConfig, PathPoint } from './BaseTDScene';
import type { TowerTypeConfig } from '../towers/BaseTower';
import type { WaveDefinition } from '../systems/WaveManager';
import { BaseTDEnemy } from '../enemies/BaseTDEnemy';
export declare class _TemplateTDLevel extends BaseTDScene {
    constructor();
    preload(): void;
    /**
     * Define the grid layout for this level.
     * CellType values: BUILDABLE(0), PATH(1), BLOCKED(2), SPAWN(3), EXIT(4)
     */
    protected getGridConfig(): GridConfig;
    /**
     * Define the enemy path waypoints in grid coordinates.
     * Enemies follow these in order from spawn to exit.
     */
    protected getPathWaypoints(): PathPoint[];
    /**
     * Create the visual environment for this level.
     * Called after grid is initialized.
     */
    protected createEnvironment(): void;
    /**
     * Define all wave configurations for this level.
     */
    protected getWaveDefinitions(): WaveDefinition[];
    /**
     * Define all tower types available in this level.
     */
    protected getTowerTypes(): TowerTypeConfig[];
    /**
     * Create an enemy instance by type string.
     * Called by WaveManager via spawnEnemy event.
     */
    protected createEnemy(enemyType: string): BaseTDEnemy | null;
}
