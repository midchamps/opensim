/**
 * Level Manager - Manages game level order and navigation
 *
 * USAGE:
 *   1. Add your level scene keys to LEVEL_ORDER array
 *   2. Use getNextLevelScene() to get the next level
 *   3. Use isLastLevel() to check if current is the final level
 *
 * The LEVEL_ORDER array defines the sequence of levels in your game.
 * VictoryUIScene and GameCompleteUIScene use this to determine navigation.
 */
export declare class LevelManager {
    /**
     * TODO-LEVELS: Replace with YOUR scene keys from GDD Section 0 (Architecture).
     * Order matters: first entry = first scene after TitleScreen, last = final scene.
     * Every key here MUST also be registered in main.ts via game.scene.add().
     *
     * @example
     *   // For a ui_heavy game with character select → battle → endings:
     *   static readonly LEVEL_ORDER: string[] = [
     *     "CharacterSelectScene",
     *     "BattleScene",
     *     "VictoryScene",
     *     "DefeatScene",
     *   ];
     */
    static readonly LEVEL_ORDER: string[];
    /**
     * Get the key of the next level scene
     *
     * @param currentSceneKey - The current level scene key
     * @returns Next level scene key, or null if at last level
     */
    static getNextLevelScene(currentSceneKey: string): string | null;
    /**
     * Check if the current level is the last level
     *
     * @param currentSceneKey - The current level scene key
     * @returns True if this is the final level
     */
    static isLastLevel(currentSceneKey: string): boolean;
    /**
     * Get the key of the first level scene
     *
     * @returns First level scene key, or null if no levels defined
     */
    static getFirstLevelScene(): string | null;
    /**
     * Get the current level index (1-based for display)
     *
     * @param currentSceneKey - The current level scene key
     * @returns Level number (1-based), or 0 if not found
     */
    static getLevelNumber(currentSceneKey: string): number;
    /**
     * Get total number of levels
     *
     * @returns Total level count
     */
    static getTotalLevels(): number;
    /**
     * Check if a scene key is a valid level scene
     *
     * @param sceneKey - Scene key to check
     * @returns True if this is a registered level scene
     */
    static isLevelScene(sceneKey: string): boolean;
}
