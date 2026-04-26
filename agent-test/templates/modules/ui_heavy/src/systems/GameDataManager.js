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
export class GameDataManager {
    // Singleton pattern
    static instance;
    numericData = new Map();
    flagData = new Map();
    inventory = new Set();
    choiceHistory = new Map();
    constructor() { }
    static getInstance() {
        if (!GameDataManager.instance) {
            GameDataManager.instance = new GameDataManager();
        }
        return GameDataManager.instance;
    }
    // -- Numeric Data --
    /** Set a numeric value. */
    set(key, value) {
        this.numericData.set(key, value);
    }
    /** Get a numeric value with optional default. */
    get(key, defaultValue = 0) {
        return this.numericData.get(key) ?? defaultValue;
    }
    /** Add to a numeric value. */
    addTo(key, amount) {
        const current = this.get(key);
        const newValue = current + amount;
        this.set(key, newValue);
        return newValue;
    }
    // -- Flags --
    /** Set a boolean flag. */
    setFlag(key, value) {
        this.flagData.set(key, value);
    }
    /** Get a boolean flag. */
    getFlag(key) {
        return this.flagData.get(key) ?? false;
    }
    // -- Inventory --
    /** Add an item to inventory. */
    addItem(itemId) {
        this.inventory.add(itemId);
    }
    /** Remove an item from inventory. */
    removeItem(itemId) {
        return this.inventory.delete(itemId);
    }
    /** Check if player has an item. */
    hasItem(itemId) {
        return this.inventory.has(itemId);
    }
    /** Get all inventory items. */
    getInventory() {
        return [...this.inventory];
    }
    // -- Choice History --
    /** Record a choice the player made. */
    recordChoice(choiceId, selectedOption) {
        this.choiceHistory.set(choiceId, selectedOption);
    }
    /** Get what the player chose for a given choice. */
    getChoice(choiceId) {
        return this.choiceHistory.get(choiceId);
    }
    // -- Ending Determination --
    /**
     * Evaluate ending rules and return the matching ending key.
     * Rules are sorted by priority (highest first).
     */
    determineEnding(rules) {
        const sorted = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
        for (const rule of sorted) {
            if (rule.condition(this)) {
                return rule.endingKey;
            }
        }
        return undefined;
    }
    // -- Persistence --
    /** Save all data to localStorage. */
    saveToStorage(slotName) {
        try {
            const data = {
                numeric: Object.fromEntries(this.numericData),
                flags: Object.fromEntries(this.flagData),
                inventory: [...this.inventory],
                choices: Object.fromEntries(this.choiceHistory),
            };
            localStorage.setItem(slotName, JSON.stringify(data));
        }
        catch (e) {
            console.warn('[GameDataManager] Failed to save:', e);
        }
    }
    /** Load data from localStorage. Returns true if data was loaded. */
    loadFromStorage(slotName) {
        try {
            const raw = localStorage.getItem(slotName);
            if (!raw)
                return false;
            const data = JSON.parse(raw);
            if (data.numeric) {
                this.numericData = new Map(Object.entries(data.numeric));
            }
            if (data.flags) {
                this.flagData = new Map(Object.entries(data.flags));
            }
            if (data.inventory) {
                this.inventory = new Set(data.inventory);
            }
            if (data.choices) {
                this.choiceHistory = new Map(Object.entries(data.choices));
            }
            return true;
        }
        catch (e) {
            console.warn('[GameDataManager] Failed to load:', e);
            return false;
        }
    }
    /** Reset all data to defaults. */
    reset() {
        this.numericData.clear();
        this.flagData.clear();
        this.inventory.clear();
        this.choiceHistory.clear();
    }
}
//# sourceMappingURL=GameDataManager.js.map