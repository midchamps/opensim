import Phaser from 'phaser';
import type { GridPoint } from '../utils';
export interface BoardConfig {
    cols: number;
    rows: number;
    cellSize: number;
    cells: number[][];
    offsetX?: number;
    offsetY?: number;
}
export interface BoardEntity {
    id: string;
    entityType: string;
    gridX: number;
    gridY: number;
}
export declare class BoardManager extends Phaser.Events.EventEmitter {
    private _cells;
    private _width;
    private _height;
    private _cellSize;
    private _offsetX;
    private _offsetY;
    private _entities;
    private _entityGrid;
    private _undoStack;
    private _maxUndoSteps;
    constructor(config: BoardConfig, maxUndoSteps?: number);
    get width(): number;
    get height(): number;
    get cellSize(): number;
    get offsetX(): number;
    get offsetY(): number;
    get cells(): number[][];
    getCell(x: number, y: number): number;
    setCell(x: number, y: number, value: number): void;
    isInBounds(x: number, y: number): boolean;
    /**
     * Fill the entire board with a single value.
     */
    fill(value: number): void;
    private entityGridKey;
    placeEntity(entity: BoardEntity): void;
    removeEntity(entityId: string): void;
    moveEntity(entityId: string, toX: number, toY: number): void;
    getEntityAt(x: number, y: number): BoardEntity | null;
    getAllEntitiesAt(x: number, y: number): BoardEntity[];
    getEntitiesOfType(entityType: string): BoardEntity[];
    getEntityById(id: string): BoardEntity | null;
    getAllEntities(): BoardEntity[];
    /**
     * Save the current board state to the undo stack.
     * Call BEFORE making changes that should be undoable.
     */
    pushState(): void;
    /**
     * Restore the previous board state from the undo stack.
     * Returns true if an undo was performed, false if the stack was empty.
     */
    popState(): boolean;
    get canUndo(): boolean;
    get undoStackSize(): number;
    clearHistory(): void;
    serialize(): string;
    deserialize(data: string): void;
    gridToWorld(gridX: number, gridY: number): {
        x: number;
        y: number;
    };
    worldToGrid(worldX: number, worldY: number): GridPoint;
    destroy(): void;
}
