/**
 * AutoTiler - 47-Tile Blob Autotiling with Bitmasking
 *
 * Optimized to work with TilesetProcessor's 9-slice expansion.
 *
 * ## Bitmask Neighbor Positions (8-bit):
 * ```
 *   NW(1)  N(2)   NE(4)
 *   W(8)   [X]    E(16)
 *   SW(32) S(64)  SE(128)
 * ```
 *
 * ## 7x7 Tileset Layout (generated from 3x3):
 * ```
 *  0   1   2   3   4   5   6     <- TL, Top edges, TR
 *  7   8   9  10  11  12  13     <- Left, Centers, Right
 * 14  15  16  17  18  19  20     <- Left, Centers, Right
 * 21  22  23  24  25  26  27     <- Left, Centers, Right
 * 28  29  30  31  32  33  34     <- Left, Centers+InnerNW, Right+InnerNE
 * 35  36  37  38  39  40  41     <- Left, Centers, InnerSW, InnerSE
 * 42  43  44  45  46  47  48     <- BL, Bottom edges, BR
 * ```
 *
 * Key positions (must match TilesetProcessor):
 * - Outer corners: 0 (TL), 6 (TR), 42 (BL), 48 (BR)
 * - Inner corners: 33 (NW), 34 (NE), 40 (SW), 41 (SE)
 * - Center: 17
 * - Edges: 3 (Top), 21 (Left), 27 (Right), 45 (Bottom)
 */
export declare class AutoTiler {
    private width;
    private height;
    private solidGrid;
    constructor(width: number, height: number, solidGrid: boolean[][]);
    /**
     * Check if position is solid (out of bounds = not solid)
     */
    private isSolid;
    /**
     * Get tile ID for a position (1-indexed for Tiled format).
     * Returns 0 for non-solid tiles (air/empty).
     */
    getTileId(x: number, y: number): number;
    /**
     * Compute tile index based on neighbors
     * Optimized for 9-slice expanded tileset
     */
    private computeTileIndex;
    /**
     * Process entire grid and return tile data array
     */
    processGrid(): number[];
    /**
     * Create solid grid from ASCII layout and legend
     */
    static createSolidGrid(layout: string[], legend: Record<string, number>, autoTileChars: string[]): boolean[][];
    /**
     * Get dimensions
     */
    getDimensions(): {
        width: number;
        height: number;
    };
}
/**
 * Tile position reference
 * Matches TilesetProcessor output
 */
export declare const TILE_POSITIONS: {
    readonly CORNER_TL: 0;
    readonly CORNER_TR: 6;
    readonly CORNER_BL: 42;
    readonly CORNER_BR: 48;
    readonly EDGE_TOP: 3;
    readonly EDGE_BOTTOM: 45;
    readonly EDGE_LEFT: 21;
    readonly EDGE_RIGHT: 27;
    readonly CENTER: 17;
    readonly INNER_NW: 33;
    readonly INNER_NE: 34;
    readonly INNER_SW: 40;
    readonly INNER_SE: 41;
};
