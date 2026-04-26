import Phaser from 'phaser';
export declare class EconomyManager {
    private scene;
    private _gold;
    private sellRefundRate;
    constructor(scene: Phaser.Scene, startingGold: number, sellRefundRate?: number);
    get gold(): number;
    canAfford(cost: number): boolean;
    /**
     * Spend gold. Returns true if successful, false if insufficient funds.
     */
    spend(amount: number): boolean;
    /**
     * Add gold (enemy kill reward, wave bonus, etc.)
     */
    earn(amount: number): void;
    /**
     * Calculate sell refund for a tower.
     * Accounts for base cost + upgrade costs invested.
     */
    getSellValue(totalInvested: number): number;
    /**
     * Process a tower sell: add refund gold.
     */
    sellTower(totalInvested: number): number;
    destroy(): void;
}
