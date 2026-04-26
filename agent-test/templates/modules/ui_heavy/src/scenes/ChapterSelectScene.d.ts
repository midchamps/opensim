/**
 * ============================================================================
 * CHAPTER SELECT SCENE - Stage/level/chapter selector
 * ============================================================================
 *
 * Displays a grid or list of selectable chapters/stages/duels.
 * Manages locked/unlocked/completed states using GameDataManager.
 *
 * HOOK METHODS:
 *   - getChapterList(): Return array of chapter configs (REQUIRED)
 *   - createBackground(): Custom background
 *   - createChapterButtons(): Custom button layout
 *   - onChapterSelected(chapterId): Handle chapter selection
 *   - isChapterUnlocked(chapterId): Check if chapter is accessible
 *
 * INTEGRATION:
 *   - Reads progress from GameDataManager
 *   - Launches the selected chapter scene
 */
import Phaser from 'phaser';
export interface ChapterInfo {
    /** Unique chapter ID */
    id: string;
    /** Display title */
    title: string;
    /** Scene key to launch */
    sceneKey: string;
    /** Short description */
    description?: string;
    /** Thumbnail image key */
    thumbnailKey?: string;
    /** Whether chapter is locked by default */
    lockedByDefault?: boolean;
}
export declare class ChapterSelectScene extends Phaser.Scene {
    protected chapters: ChapterInfo[];
    constructor();
    create(): void;
    /**
     * HOOK (REQUIRED): Return the list of chapters available for selection.
     * Override in subclass or configure via gameConfig.json.
     */
    protected getChapterList(): ChapterInfo[];
    /** HOOK: Create the background. */
    protected createBackground(): void;
    /**
     * HOOK: Create the chapter selection buttons.
     * Default implementation creates a DOM-based button grid.
     */
    protected createChapterButtons(): void;
    /**
     * HOOK: Called when a chapter is selected.
     * Default: start the chapter scene.
     */
    protected onChapterSelected(chapter: ChapterInfo): void;
    /**
     * HOOK: Check if a chapter is unlocked.
     * Override for custom unlock logic.
     */
    protected isChapterUnlocked(chapterId: string): boolean;
    /** HOOK: Set up custom inputs. */
    protected setupInputs(): void;
}
