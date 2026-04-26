import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from './tools.js';
import type { Config } from '../config/config.js';
/**
 * Single map definition for multi-map support
 */
export interface MapDefinition {
    map_key: string;
    layout_ascii: string[];
    legend: Record<string, number>;
    object_markers?: Record<string, string>;
}
export interface GenerateTilemapParams {
    tileset_key: string;
    tile_size?: number;
    tileset_grid_size?: number;
    auto_tiling?: boolean;
    auto_tile_chars?: string[];
    /** Dual-tileset mode for top-down games. 'floor' treats walkable chars as solid, 'walls' treats # as solid. Auto-computes legend and auto_tile_chars. */
    mode?: 'floor' | 'walls';
    maps?: MapDefinition[];
    map_key?: string;
    layout_ascii?: string[];
    legend?: Record<string, number>;
    object_markers?: Record<string, string>;
    output_dir_name?: string;
}
export declare class GenerateTilemapTool extends BaseDeclarativeTool<GenerateTilemapParams, ToolResult> {
    private config;
    static readonly Name: "generate_tilemap";
    constructor(config: Config);
    protected createInvocation(params: GenerateTilemapParams): ToolInvocation<GenerateTilemapParams, ToolResult>;
}
