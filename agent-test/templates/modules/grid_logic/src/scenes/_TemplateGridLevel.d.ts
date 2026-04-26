import { BaseGridScene } from './BaseGridScene';
import { type BoardConfig } from '../systems/BoardManager';
import { type TurnManagerConfig } from '../systems/TurnManager';
import { BaseGridEntity } from '../entities/BaseGridEntity';
import type { Direction } from '../utils';
export default class TemplateGridLevel extends BaseGridScene {
    constructor();
    /**
     * Define the board layout. Use CellType enum values.
     * Translate GDD Section 4 ASCII map to a 2D number array.
     */
    protected getBoardConfig(): BoardConfig;
    /**
     * Configure the turn/step timing mode.
     * - 'step':     Each input = one game step (Sokoban, sliding puzzle)
     * - 'turn':     Multiple actions per turn (tactics, chess)
     * - 'realtime': Timer-driven steps (Snake, Tetris)
     * - 'freeform': No turn structure (Match-3)
     */
    protected getTurnConfig(): TurnManagerConfig;
    /**
     * Set up the visual environment.
     */
    protected createEnvironment(): void;
    /**
     * Create and place all game entities on the board.
     */
    protected createEntities(): void;
    protected checkWinCondition(): boolean;
    protected checkLoseCondition(): boolean;
    /**
     * Handle directional input (arrow keys / WASD).
     * Main input handler for step-based movement games.
     */
    protected onDirectionInput(direction: Direction): void;
    /**
     * Handle action key (Spacebar).
     * For special abilities, attacks, or interactions.
     */
    protected onActionInput(): void;
    /**
     * Handle cell clicks.
     * For click-based games (Match-3, chess piece selection, etc).
     */
    protected onCellClicked(gridX: number, gridY: number): void;
    /**
     * Player Phase: enqueue animations for the player's action.
     */
    protected onProcessComplete(): void;
    /**
     * World Phase: resolve tile interactions after player moves.
     * Traps activate, doors open, items get collected, etc.
     */
    protected onWorldPhase(): void;
    /**
     * Enemy Phase: all enemies take their step (AI, patrol, emit effects).
     * This runs AFTER the world phase and its animations.
     */
    protected onEnemyPhase(): void;
    /**
     * Called when an entity enters a cell. Automatic tile interaction.
     */
    protected onEntityEnteredCell(entity: BaseGridEntity, gridX: number, gridY: number, cellType: number): void;
    /**
     * Called when an entity's health reaches 0.
     */
    protected onEntityDeath(entity: BaseGridEntity): void;
    /**
     * Chain reaction check. Return true to re-run the pipeline.
     */
    protected onMoveProcessed(): boolean;
}
