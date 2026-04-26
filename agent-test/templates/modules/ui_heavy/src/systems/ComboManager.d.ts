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
export interface ComboTier {
    /** Minimum streak to reach this tier */
    minStreak: number;
    /** Damage/score multiplier at this tier */
    multiplier: number;
    /** Display label (e.g., "GREAT!", "PERFECT!") */
    label: string;
}
export interface ComboManagerConfig {
    /** Multiplier tiers (sorted by minStreak ascending) */
    tiers: ComboTier[];
}
export declare class ComboManager {
    private config;
    private currentStreak;
    private bestStreak;
    constructor(config: ComboManagerConfig);
    /** Register a successful action (correct answer, hit, etc.) */
    hit(): void;
    /** Register a failure (wrong answer, miss). Resets streak. */
    miss(): void;
    /** Reset all tracking. */
    reset(): void;
    /** Get current streak count. */
    getStreak(): number;
    /** Get best streak count. */
    getBestStreak(): number;
    /** Get current multiplier based on streak. */
    getMultiplier(): number;
    /** Get current tier label (e.g., "GREAT!"). */
    getLabel(): string;
    /** Get current tier object. Returns a default tier if tiers array is empty. */
    getCurrentTier(): ComboTier;
    /** Apply multiplier to a value. */
    applyMultiplier(baseValue: number): number;
}
