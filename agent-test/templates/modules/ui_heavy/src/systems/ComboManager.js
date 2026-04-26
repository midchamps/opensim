/**
 * ============================================================================
 * COMBO MANAGER - Streak tracking & multiplier calculation
 * ============================================================================
 *
 * Tracks consecutive correct actions (answers, hits, etc.) and calculates
 * a damage/score multiplier based on configurable tier thresholds.
 *
 * USAGE:
 *   const cm = new ComboManager({
 *     tiers: [
 *       { minStreak: 0, multiplier: 1.0, label: '' },
 *       { minStreak: 2, multiplier: 1.2, label: 'GOOD' },
 *       { minStreak: 4, multiplier: 1.5, label: 'GREAT' },
 *       { minStreak: 6, multiplier: 2.0, label: 'PERFECT' },
 *     ],
 *   });
 *
 *   cm.hit();    // streak +1
 *   cm.hit();    // streak +2
 *   cm.getMultiplier();  // 1.2
 *   cm.miss();   // streak reset to 0
 */
export class ComboManager {
    config;
    currentStreak = 0;
    bestStreak = 0;
    constructor(config) {
        this.config = config;
    }
    // -- Actions --
    /** Register a successful action (correct answer, hit, etc.) */
    hit() {
        this.currentStreak++;
        this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
    }
    /** Register a failure (wrong answer, miss). Resets streak. */
    miss() {
        this.currentStreak = 0;
    }
    /** Reset all tracking. */
    reset() {
        this.currentStreak = 0;
        this.bestStreak = 0;
    }
    // -- Query --
    /** Get current streak count. */
    getStreak() {
        return this.currentStreak;
    }
    /** Get best streak count. */
    getBestStreak() {
        return this.bestStreak;
    }
    /** Get current multiplier based on streak. */
    getMultiplier() {
        return this.getCurrentTier().multiplier;
    }
    /** Get current tier label (e.g., "GREAT!"). */
    getLabel() {
        return this.getCurrentTier().label;
    }
    /** Get current tier object. Returns a default tier if tiers array is empty. */
    getCurrentTier() {
        const tiers = this.config.tiers;
        if (tiers.length === 0) {
            return { minStreak: 0, multiplier: 1.0, label: '' };
        }
        let current = tiers[0];
        for (const tier of tiers) {
            if (this.currentStreak >= tier.minStreak) {
                current = tier;
            }
        }
        return current;
    }
    /** Apply multiplier to a value. */
    applyMultiplier(baseValue) {
        return Math.floor(baseValue * this.getMultiplier());
    }
}
//# sourceMappingURL=ComboManager.js.map