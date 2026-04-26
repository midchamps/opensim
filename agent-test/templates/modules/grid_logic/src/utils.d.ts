import Phaser from 'phaser';
export declare enum CellType {
    EMPTY = 0,
    WALL = 1,
    FLOOR = 2,
    GOAL = 3,
    HAZARD = 4,
    SPAWN = 5,
    SPECIAL = 6,
    ICE = 7,
    PORTAL = 8
}
export interface GridPoint {
    gridX: number;
    gridY: number;
}
export declare const resetOriginAndOffset: (sprite: any, facingDirection: "left" | "right" | "up" | "down") => void;
export declare const safeAddSound: (scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig) => Phaser.Sound.BaseSound | undefined;
export declare const audioExists: (scene: Phaser.Scene, key: string) => boolean;
export declare const textureExists: (scene: Phaser.Scene, key: string) => boolean;
export declare const initScale: (sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, origin: {
    x: number;
    y: number;
}, maxDisplayWidth?: number, maxDisplayHeight?: number, bodyWidthFactorToDisplayWidth?: number, bodyHeightFactorToDisplayHeight?: number) => void;
export declare const addCollider: (scene: Phaser.Scene, object1: Phaser.Types.Physics.Arcade.ArcadeColliderType, object2: Phaser.Types.Physics.Arcade.ArcadeColliderType, collideCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, callbackContext?: any) => Phaser.Physics.Arcade.Collider;
export declare const addOverlap: (scene: Phaser.Scene, object1: Phaser.Types.Physics.Arcade.ArcadeColliderType, object2: Phaser.Types.Physics.Arcade.ArcadeColliderType, collideCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, callbackContext?: any) => Phaser.Physics.Arcade.Collider;
export declare const initUIDom: (scene: Phaser.Scene, html: string) => Phaser.GameObjects.DOMElement;
export declare const createDecoration: (scene: Phaser.Scene, group: Phaser.GameObjects.Group, key: string, x: number, y: number, maxDisplayHeight: number) => Phaser.GameObjects.Image;
/**
 * Convert grid coordinates to world (pixel) coordinates.
 * Returns the CENTER of the cell.
 */
export declare function gridToWorld(gridX: number, gridY: number, cellSize: number, offsetX?: number, offsetY?: number): {
    x: number;
    y: number;
};
/**
 * Convert world (pixel) coordinates to grid coordinates.
 * Returns the grid cell that contains the point.
 */
export declare function worldToGrid(worldX: number, worldY: number, cellSize: number, offsetX?: number, offsetY?: number): GridPoint;
/**
 * Check if grid coordinates are within board bounds.
 */
export declare function isInBounds(gridX: number, gridY: number, width: number, height: number): boolean;
/**
 * Get adjacent cell coordinates in 4-directional or 8-directional mode.
 * Only returns cells that are within bounds.
 */
export declare function getNeighbors(gridX: number, gridY: number, width: number, height: number, mode?: '4-dir' | '8-dir'): GridPoint[];
/**
 * Get the 4-directional movement direction from one cell to an adjacent cell.
 */
export declare function getDirection(fromX: number, fromY: number, toX: number, toY: number): 'up' | 'down' | 'left' | 'right' | null;
export type Direction = 'up' | 'down' | 'left' | 'right';
/**
 * Get the delta (dx, dy) for a cardinal direction.
 */
export declare function getDirectionDelta(direction: Direction): GridPoint;
/**
 * Get all cells in a straight line from (startX, startY) in the given direction,
 * up to `range` cells. Only returns cells that are within bounds.
 * Useful for ranged attacks (Thunderbolt: 2 tiles in front).
 */
export declare function getCellsInDirection(startX: number, startY: number, direction: Direction, range: number, width: number, height: number): GridPoint[];
/**
 * Get all cells within Manhattan distance `radius` of the center.
 * Useful for area effects (Koffing's Smog: adjacent tiles).
 * Excludes the center cell itself.
 */
export declare function getCellsInRadius(centerX: number, centerY: number, radius: number, width: number, height: number): GridPoint[];
export declare function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number;
export declare function chebyshevDistance(x1: number, y1: number, x2: number, y2: number): number;
/**
 * BFS to find all reachable cells from a start position within a maximum range.
 * Uses Manhattan distance as the range metric.
 * @param isWalkable Predicate: return true if the cell at (x, y) can be traversed
 */
export declare function getReachableCells(startX: number, startY: number, maxRange: number, width: number, height: number, isWalkable: (x: number, y: number) => boolean, mode?: '4-dir' | '8-dir'): GridPoint[];
/**
 * A* pathfinding from start to end.
 * Returns the path as an array of GridPoints (including start and end), or empty array if no path.
 */
export declare function findPath(startX: number, startY: number, endX: number, endY: number, width: number, height: number, isWalkable: (x: number, y: number) => boolean, mode?: '4-dir' | '8-dir'): GridPoint[];
/**
 * Flood fill from a starting cell. Returns all connected cells matching the predicate.
 */
export declare function floodFill(startX: number, startY: number, width: number, height: number, predicate: (x: number, y: number) => boolean, mode?: '4-dir' | '8-dir'): GridPoint[];
/**
 * Bresenham's line algorithm. Returns all cells on the line from (x1,y1) to (x2,y2).
 */
export declare function getLine(x1: number, y1: number, x2: number, y2: number): GridPoint[];
/**
 * Check line of sight between two cells. Returns true if no cell on the line
 * (excluding start and end) fails the predicate.
 */
export declare function hasLineOfSight(x1: number, y1: number, x2: number, y2: number, isTransparent: (x: number, y: number) => boolean): boolean;
/**
 * Find all horizontal and vertical matches of 3+ consecutive same-value cells.
 * Returns groups of matched cell coordinates.
 */
export declare function findMatches(cells: number[][], width: number, height: number, minMatchLength?: number): GridPoint[][];
/**
 * Draw a visual grid overlay with cell borders.
 */
export declare function drawGridLines(scene: Phaser.Scene, cols: number, rows: number, cellSize: number, offsetX?: number, offsetY?: number, color?: number, alpha?: number, lineWidth?: number, depth?: number): Phaser.GameObjects.Graphics;
/**
 * Draw a debug/gameplay grid overlay showing cell types with color coding.
 */
export declare function drawCellTypeOverlay(scene: Phaser.Scene, cells: number[][], cols: number, rows: number, cellSize: number, offsetX?: number, offsetY?: number, colorMap?: Record<number, number>, alpha?: number, depth?: number): Phaser.GameObjects.Graphics;
/**
 * Draw highlighted cells (e.g. movement range, selection, attack range).
 * Returns a Graphics object that can be destroyed and recreated.
 */
export declare function highlightCells(scene: Phaser.Scene, cells: GridPoint[], cellSize: number, offsetX?: number, offsetY?: number, fillColor?: number, fillAlpha?: number, borderColor?: number, borderAlpha?: number, depth?: number): Phaser.GameObjects.Graphics;
/**
 * Highlight a single cell with a pulsing selection indicator.
 */
export declare function highlightSelectedCell(scene: Phaser.Scene, gridX: number, gridY: number, cellSize: number, offsetX?: number, offsetY?: number, color?: number, depth?: number): Phaser.GameObjects.Graphics;
export declare function showFloatingText(scene: Phaser.Scene, x: number, y: number, text: string, color?: string, fontSize?: number, duration?: number, riseDistance?: number): void;
/**
 * Scale a sprite to fit within a grid cell, maintaining aspect ratio.
 * Centers the sprite in the cell.
 */
export declare function scaleToCell(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, cellSize: number, padding?: number): void;
