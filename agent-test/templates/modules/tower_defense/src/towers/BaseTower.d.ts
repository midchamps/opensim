import Phaser from 'phaser';
import type { BaseTDEnemy } from '../enemies/BaseTDEnemy';
export type TargetingMode = 'first' | 'last' | 'closest' | 'strongest';
export interface TowerUpgrade {
    level: number;
    cost: number;
    damage: number;
    range: number;
    fireRate: number;
}
export interface TowerTypeConfig {
    id: string;
    name: string;
    textureKey: string;
    cost: number;
    damage: number;
    /** range in pixels */
    range: number;
    /** shots per second */
    fireRate: number;
    projectileKey?: string;
    projectileSpeed?: number;
    /** when true, projectile tracks target each frame (homing) */
    homing?: boolean;
    upgrades?: TowerUpgrade[];
    targetingMode?: TargetingMode;
}
export declare class BaseTower extends Phaser.GameObjects.Image {
    protected towerConfig: TowerTypeConfig;
    protected currentLevel: number;
    protected currentDamage: number;
    protected currentRange: number;
    protected currentFireRate: number;
    protected projectileKey: string;
    protected projectileSpeed: number;
    protected targetingMode: TargetingMode;
    protected fireTimer: number;
    protected totalInvested: number;
    /** Grid coordinates where this tower is placed */
    gridX: number;
    gridY: number;
    protected projectilesGroup: Phaser.Physics.Arcade.Group;
    protected enemiesGroup: Phaser.Physics.Arcade.Group;
    private rangeCircle;
    constructor(scene: Phaser.Scene, worldX: number, worldY: number, gridX: number, gridY: number, config: TowerTypeConfig, projectilesGroup: Phaser.Physics.Arcade.Group, enemiesGroup: Phaser.Physics.Arcade.Group);
    get level(): number;
    get invested(): number;
    get range(): number;
    get typeId(): string;
    get typeName(): string;
    update(time: number, delta: number): void;
    protected findTarget(): BaseTDEnemy | null;
    /** "First" = furthest along the path (highest pathProgress) */
    private getFirstEnemy;
    private getLastEnemy;
    private getClosestEnemy;
    private getStrongestEnemy;
    protected fire(target: BaseTDEnemy): void;
    /**
     * Subtle scale pulse when the tower fires.
     * Override to customize the animation per tower type.
     */
    protected playFireAnimation(): void;
    /**
     * Return the color used for this tower's range circle.
     * Override to provide type-specific colors (e.g., blue for ice, red for cannon).
     */
    protected getRangeCircleColor(): number;
    private showRangeCircle;
    private hideRangeCircle;
    canUpgrade(): boolean;
    getUpgradeCost(): number | null;
    upgrade(): boolean;
    /** Called when the tower fires at a target. Override for fire sound/animation. */
    protected onFire(_target: BaseTDEnemy): void;
    /** Called after upgrade. Override for visual upgrade effect. */
    protected onUpgrade(_newLevel: number): void;
    /**
     * Create and return the projectile sprite.
     * Override to create splash projectiles, slow projectiles, etc.
     * The returned projectile will be added to projectilesGroup and launched.
     */
    protected createProjectile(_target: BaseTDEnemy): Phaser.Physics.Arcade.Sprite | null;
    /**
     * Return stats for the next upgrade level.
     * Return null if tower is at max level.
     * Override to provide custom upgrade paths.
     */
    protected getUpgradeStats(): TowerUpgrade | null;
    destroy(fromScene?: boolean): void;
}
