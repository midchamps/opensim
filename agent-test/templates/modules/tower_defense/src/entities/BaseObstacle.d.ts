import Phaser from 'phaser';
export interface ObstacleConfig {
    textureKey: string;
    displayHeight?: number;
    maxHealth: number;
    /** Gold reward when destroyed */
    reward?: number;
}
export declare class BaseObstacle extends Phaser.GameObjects.Image {
    protected config: ObstacleConfig;
    protected _maxHealth: number;
    protected _currentHealth: number;
    protected reward: number;
    protected isDestroyed: boolean;
    private healthBar?;
    private healthBarBg?;
    constructor(scene: Phaser.Scene, x: number, y: number, config: ObstacleConfig);
    get health(): number;
    get maxHealth(): number;
    private handleClick;
    private destroyObstacle;
    private playDamageEffect;
    private createHealthBar;
    private updateHealthBar;
    /** Called when the obstacle is clicked. Override for click sound/visual. */
    protected onClicked(): void;
    /** Called after damage is applied. Override for damage feedback. */
    protected onDamaged(_remainingHealth: number): void;
    /** Called when the obstacle is destroyed. Override for destruction effects. */
    protected onDestroyed(): void;
    /**
     * Return how much damage each click deals.
     * Override to change click damage (e.g., based on player upgrades).
     */
    protected getClickDamage(): number;
}
