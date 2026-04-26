/**
 * ============================================================================
 * GAME DATA MANAGER - Global persistent state management
 * ============================================================================
 *
 * Singleton that manages all persistent game state across scenes:
 * - Numeric stats (HP, score, love points, money)
 * - Boolean flags (chapter completed, item obtained, choice made)
 * - Inventory items
 * - Chapter progress
 * - Ending determination
 *
 * Data persists across scene transitions because the singleton lives
 * in module scope (not tied to any scene lifecycle).
 * Optionally saves/loads from localStorage for cross-session persistence.
 *
 * USAGE:
 *   const gd = GameDataManager.getInstance();
 *
 *   // Set values
 *   gd.set('playerHP', 100);
 *   gd.addTo('score', 50);
 *   gd.setFlag('chapter1_complete', true);
 *
 *   // Get values
 *   const hp = gd.get('playerHP', 100);  // default 100
 *   const done = gd.getFlag('chapter1_complete');
 *
 *   // Inventory
 *   gd.addItem('health_potion');
 *   gd.hasItem('health_potion');  // true
 *
 *   // Save/Load
 *   gd.saveToStorage('my_game_save');
 *   gd.loadFromStorage('my_game_save');
 *
 *   // Ending
 *   const ending = gd.determineEnding(endingRules);
 */
export interface EndingRule {
    /** Ending scene key */
    endingKey: string;
    /** Condition function -- first matching rule wins */
    condition: (data: GameDataManager) => boolean;
    /** Priority (higher = checked first) */
    priority?: number;
}
export declare class GameDataManager {
    private static instance;
    private numericData;
    private flagData;
    private inventory;
    private choiceHistory;
    private constructor();
    static getInstance(): GameDataManager;
    /** Set a numeric value. */
    set(key: string, value: number): void;
    /** Get a numeric value with optional default. */
    get(key: string, defaultValue?: number): number;
    /** Add to a numeric value. */
    addTo(key: string, amount: number): number;
    /** Set a boolean flag. */
    setFlag(key: string, value: boolean): void;
    /** Get a boolean flag. */
    getFlag(key: string): boolean;
    /** Add an item to inventory. */
    addItem(itemId: string): void;
    /** Remove an item from inventory. */
    removeItem(itemId: string): boolean;
    /** Check if player has an item. */
    hasItem(itemId: string): boolean;
    /** Get all inventory items. */
    getInventory(): string[];
    /** Record a choice the player made. */
    recordChoice(choiceId: string, selectedOption: string): void;
    /** Get what the player chose for a given choice. */
    getChoice(choiceId: string): string | undefined;
    /**
     * Evaluate ending rules and return the matching ending key.
     * Rules are sorted by priority (highest first).
     */
    determineEnding(rules: EndingRule[]): string | undefined;
    /** Save all data to localStorage. */
    saveToStorage(slotName: string): void;
    /** Load data from localStorage. Returns true if data was loaded. */
    loadFromStorage(slotName: string): boolean;
    /** Reset all data to defaults. */
    reset(): void;
}
