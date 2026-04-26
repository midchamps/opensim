export declare class TilesetProcessor {
    private tileSize;
    private sourceTiles;
    /**
     * Expands a 3x3 source grid into a full 7x7 Blobset
     * Key feature: Generates inner corners by compositing
     */
    expand3x3To7x7(rawBuffer: Buffer, tileSize?: number, isPixelArt?: boolean): Promise<Buffer>;
    /**
     * Fill basic tiles from 9-slice mapping
     */
    private fillBasicTiles;
    /**
     * Generate inner corner tiles by compositing
     *
     * Inner corner = Center tile with one corner replaced by outer corner's inner quadrant
     *
     * Example: Inner NW corner
     * - Base: Center tile
     * - Overlay: Bottom-right quadrant of TL corner tile
     * - Position: Top-left of result
     */
    private generateInnerCorners;
    /**
     * Composite an inner corner tile
     */
    private compositeInnerCorner;
    /**
     * Get specific source tile (for external use)
     */
    getSourceTile(index: number): Buffer | undefined;
}
/**
 * Mapping reference for debugging
 */
export declare const TILESET_DEBUG: {
    sourceNames: string[];
    innerCornerPositions: {
        33: string;
        34: string;
        40: string;
        41: string;
    };
};
