import Phaser from 'phaser';
import { BoardManager, type BoardConfig } from '../systems/BoardManager';
import { TurnManager, type TurnManagerConfig } from '../systems/TurnManager';
import { AnimationQueue } from '../systems/AnimationQueue';
import { BaseGridEntity } from '../entities/BaseGridEntity';
import { type GridPoint, type Direction } from '../utils';
export declare class BaseGridScene extends Phaser.Scene {
    protected boardManager: BoardManager;
    protected turnManager: TurnManager;
    protected animationQueue: AnimationQueue;
    protected entities: BaseGridEntity[];
    protected entitiesGroup: Phaser.GameObjects.Group;
    protected selectedEntity: BaseGridEntity | null;
    protected selectedCell: GridPoint | null;
    protected highlightGraphics: Phaser.GameObjects.Graphics | null;
    protected selectionGraphics: Phaser.GameObjects.Graphics | null;
    protected gridLinesGraphics: Phaser.GameObjects.Graphics | null;
    protected cellSize: number;
    protected gridCols: number;
    protected gridRows: number;
    protected gridOffsetX: number;
    protected gridOffsetY: number;
    protected cells: number[][];
    private _inputLocked;
    protected cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    protected wasd: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    protected undoKey: Phaser.Input.Keyboard.Key;
    protected escKey: Phaser.Input.Keyboard.Key;
    protected actionKey: Phaser.Input.Keyboard.Key;
    private _keyDebounce;
    private _keyDebounceMs;
    create(): void;
    update(time: number, delta: number): void;
    shutdown(): void;
    /**
     * Return the board configuration: grid dimensions, cell size, initial cell states.
     */
    protected getBoardConfig(): BoardConfig;
    /**
     * Return the turn/step timing configuration.
     */
    protected getTurnConfig(): TurnManagerConfig;
    /**
     * Set up the visual environment: background image, grid overlay, decorations.
     */
    protected createEnvironment(): void;
    /**
     * Create and place all game entities on the board.
     */
    protected createEntities(): void;
    /**
     * Check if the win condition is met. Called after each move is processed.
     * Return true to trigger victory.
     */
    protected checkWinCondition(): boolean;
    /**
     * Check if the lose condition is met. Called after each move is processed.
     * Return true to trigger game over.
     */
    protected checkLoseCondition(): boolean;
    protected onPreCreate(): void;
    protected onPostCreate(): void;
    protected onPreUpdate(time: number, delta: number): void;
    protected onPostUpdate(time: number, delta: number): void;
    /**
     * Called when a grid cell is clicked/tapped.
     * This is the PRIMARY input handler for click-based grid games.
     */
    protected onCellClicked(gridX: number, gridY: number): void;
    /**
     * Called when the mouse hovers over a grid cell.
     */
    protected onCellHovered(gridX: number, gridY: number): void;
    /**
     * Called when an arrow key or WASD key is pressed.
     * Override for movement-based games (Sokoban, roguelike, etc).
     */
    protected onDirectionInput(direction: 'up' | 'down' | 'left' | 'right'): void;
    /**
     * Called when the action key (Spacebar) is pressed.
     * Override for special abilities (attack, interact, confirm).
     */
    protected onActionInput(): void;
    /**
     * Called when an entity on the board is clicked.
     */
    protected onEntityClicked(entity: BaseGridEntity): void;
    /**
     * Called after an entity finishes moving to a new cell.
     * Both data (BoardManager) and visual (sprite) are updated.
     */
    protected onEntityMoved(entity: BaseGridEntity, fromX: number, fromY: number, toX: number, toY: number): void;
    /**
     * Called when an entity enters a cell. Fires after moveEntity completes.
     * Use for tile interactions: traps deal damage, grass grants stealth,
     * keys get collected, holes get filled, etc.
     */
    protected onEntityEnteredCell(entity: BaseGridEntity, gridX: number, gridY: number, cellType: number): void;
    /**
     * Called when an entity's health reaches 0.
     * Use to handle death: remove entity, play animation, check lose condition.
     */
    protected onEntityDeath(entity: BaseGridEntity): void;
    /**
     * Called at the start of a new turn.
     */
    protected onTurnStart(turnNumber: number): void;
    /**
     * Called at the end of a turn.
     */
    protected onTurnEnd(turnNumber: number): void;
    /**
     * Called after player game logic is processed (before animation).
     * Use this to enqueue animations for the player's action.
     */
    protected onProcessComplete(): void;
    /**
     * Called after player animations finish.
     * The WORLD PHASE: resolve tile interactions (traps activate, doors open).
     * Enqueue any world animations here; they play before the enemy phase.
     */
    protected onWorldPhase(): void;
    /**
     * Called after world phase animations finish.
     * The ENEMY PHASE: all non-player entities take their step (AI, patrol, emit).
     * Enqueue enemy movement/attack animations here.
     */
    protected onEnemyPhase(): void;
    /**
     * Called after all queued animations finish playing.
     */
    protected onAnimationComplete(): void;
    /**
     * Called after each full cycle (player + world + enemy) is processed and animated.
     * Use for chain reactions (Match-3 cascades, gravity refill).
     * Return true if another processing cycle is needed.
     */
    protected onMoveProcessed(): boolean;
    /**
     * Called when the win condition is met.
     * Default: launch VictoryUIScene.
     */
    protected onWinConditionMet(): void;
    /**
     * Called when the lose condition is met.
     * Default: launch GameOverUIScene.
     */
    protected onLoseConditionMet(): void;
    /**
     * Called when the board state changes (cells or entities).
     */
    protected onBoardStateChanged(): void;
    /**
     * Called when an undo operation completes.
     */
    protected onUndoPerformed(): void;
    /**
     * Called for realtime mode on each tick interval.
     * Override to implement timer-driven game steps (Snake, Tetris).
     */
    protected onRealtimeTick(): void;
    /**
     * Add an entity to the board. Sets up grid params, scaling, and tracking.
     */
    protected addEntity(entity: BaseGridEntity): void;
    /**
     * Remove an entity from the board and destroy its sprite.
     */
    protected removeEntity(entity: BaseGridEntity): void;
    /**
     * Deal damage to an entity. Triggers onEntityDeath if health reaches 0.
     */
    protected damageEntity(entity: BaseGridEntity, amount: number): void;
    /**
     * Call onStep() on all active entities.
     * Typically called during the enemy phase for AI, cooldowns, periodic effects.
     */
    protected stepAllEntities(turnNumber?: number): void;
    /**
     * Call onStep() on all entities of a specific type.
     */
    protected stepEntitiesOfType(entityType: string, turnNumber?: number): void;
    /**
     * Move an entity to a new grid position.
     * Updates both data (BoardManager) and visual (sprite position).
     * Automatically triggers onEntityMoved and onEntityEnteredCell hooks.
     * @param animate If true, smoothly tweens the sprite (default: true)
     */
    protected moveEntity(entity: BaseGridEntity, toGridX: number, toGridY: number, animate?: boolean, duration?: number): Promise<void>;
    /**
     * Slide an entity continuously in a direction until `shouldStop` returns true.
     * Each step calls moveEntity(), so onEntityEnteredCell fires at every cell.
     * Generic: works for ice, conveyor belts, wind, or any "slide until condition" mechanic.
     *
     * @param entity The entity to slide
     * @param direction The direction to slide in
     * @param shouldStop Callback returning true when the entity should stop.
     *   Receives the NEXT candidate cell coordinates. Return true to prevent
     *   entering that cell (e.g., wall, non-slippery surface, blocking entity).
     * @param stepDuration Animation duration per cell in ms (default: 80)
     * @returns The final grid position after sliding stops
     */
    protected slideEntity(entity: BaseGridEntity, direction: Direction, shouldStop: (nextGridX: number, nextGridY: number) => boolean, stepDuration?: number): Promise<GridPoint>;
    /**
     * Get the entity at a grid position (first match).
     */
    protected getEntityAt(gridX: number, gridY: number): BaseGridEntity | null;
    /**
     * Get all entities at a grid position.
     */
    protected getAllEntitiesAt(gridX: number, gridY: number): BaseGridEntity[];
    /**
     * Get all active entities of a specific type.
     */
    protected getEntitiesOfType(entityType: string): BaseGridEntity[];
    protected selectEntity(entity: BaseGridEntity): void;
    protected deselectEntity(): void;
    protected setHighlightedCells(cells: GridPoint[], fillColor?: number, fillAlpha?: number, borderColor?: number, borderAlpha?: number): void;
    protected clearHighlights(): void;
    private clearSelectionHighlight;
    protected lockInput(): void;
    protected unlockInput(): void;
    get isInputLocked(): boolean;
    private _customUndoStack;
    /**
     * Save the current board state for undo.
     * Call BEFORE making changes (typically at the start of each move).
     *
     * BoardManager saves cell types and entity grid positions automatically.
     * For custom entity state (HP, cooldowns, inventory, patrol direction, etc.),
     * override `getCustomUndoData()` to return a snapshot of that state.
     * It will be passed back to `restoreCustomUndoData()` on undo.
     */
    protected saveUndoState(): void;
    /**
     * Override to save custom game state that BoardManager doesn't track.
     * Return a plain object with entity HP, cooldowns, inventory flags, etc.
     * The object will be deep-cloned via JSON serialization.
     *
     * Example:
     *   return {
     *     playerHP: this.player.health,
     *     zapCooldown: this.zapCooldown,
     *     hasKey: this.hasKey,
     *     enemies: this.getEntitiesOfType('enemy').map(e => ({
     *       id: e.entityId, hp: e.health,
     *       patrolDir: (e as any).patrolDirection
     *     })),
     *   };
     */
    protected getCustomUndoData(): Record<string, unknown>;
    /**
     * Override to restore custom game state after an undo.
     * Receives the same object that getCustomUndoData() returned.
     *
     * Example:
     *   const d = customData as any;
     *   this.player.health = d.playerHP;  // BaseGridEntity.health has a setter
     *   this.zapCooldown = d.zapCooldown;
     */
    protected restoreCustomUndoData(customData: Record<string, unknown>): void;
    /**
     * Undo the last move. Restores board state, entity positions,
     * and custom game state, then syncs entity visuals.
     */
    protected undo(): void;
    /**
     * After a board restore (undo), sync all entity sprites to match
     * the restored board state. Handles position restoration and
     * re-showing destroyed entities. Override for additional visual sync.
     */
    protected syncEntitiesToBoard(): void;
    /**
     * Complete processing pipeline after a player action:
     *
     * 1. Lock input, record action
     * 2. PLAYER PHASE:  onProcessComplete() -> play animations
     * 3. WORLD PHASE:   onWorldPhase()      -> play animations (traps, tiles)
     * 4. ENEMY PHASE:   onEnemyPhase()      -> play animations (AI, patrol)
     * 5. Check win/lose
     * 6. CHAIN:         onMoveProcessed()   -> if true, loop from step 2
     * 7. Unlock input
     */
    protected runProcessingPipeline(): Promise<void>;
    private setupInput;
    private processInput;
    private isKeyPressed;
    private setupEventListeners;
}
