import Phaser from 'phaser';
// ============================================================================
// ECONOMY MANAGER — Manages gold/currency for tower defense
// ============================================================================
// Owned by BaseTDScene. Tracks gold balance, validates purchases.
// Communicates via Phaser.Events.EventEmitter (the scene's event bus).
// ============================================================================
export class EconomyManager {
    scene;
    _gold;
    sellRefundRate;
    constructor(scene, startingGold, sellRefundRate = 0.7) {
        this.scene = scene;
        this._gold = startingGold;
        this.sellRefundRate = sellRefundRate;
    }
    get gold() {
        return this._gold;
    }
    canAfford(cost) {
        return this._gold >= cost;
    }
    /**
     * Spend gold. Returns true if successful, false if insufficient funds.
     */
    spend(amount) {
        if (amount <= 0)
            return true;
        if (this._gold < amount)
            return false;
        const oldGold = this._gold;
        this._gold -= amount;
        this.scene.events.emit('goldChanged', oldGold, this._gold);
        return true;
    }
    /**
     * Add gold (enemy kill reward, wave bonus, etc.)
     */
    earn(amount) {
        if (amount <= 0)
            return;
        const oldGold = this._gold;
        this._gold += amount;
        this.scene.events.emit('goldChanged', oldGold, this._gold);
    }
    /**
     * Calculate sell refund for a tower.
     * Accounts for base cost + upgrade costs invested.
     */
    getSellValue(totalInvested) {
        return Math.floor(totalInvested * this.sellRefundRate);
    }
    /**
     * Process a tower sell: add refund gold.
     */
    sellTower(totalInvested) {
        const refund = this.getSellValue(totalInvested);
        this.earn(refund);
        return refund;
    }
    destroy() {
        // no-op — cleanup hook
    }
}
//# sourceMappingURL=EconomyManager.js.map