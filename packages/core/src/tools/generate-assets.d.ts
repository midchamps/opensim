/**
 * Generate Assets Tool
 * A complete rewrite inspired by PiXelDa architecture
 *
 * Features:
 * - Multi-model support (Tongyi / Doubao)
 * - Image generation with auto background removal
 * - Animation generation via I2V (Image-to-Video) or I2I fallback
 * - Audio generation via ABC Notation
 * - Background images (no bg removal)
 */
import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from './tools.js';
import type { Config } from '../config/config.js';
import type { GenerateAssetsParams } from './generate-assets-types.js';
export declare class GenerateAssetsTool extends BaseDeclarativeTool<GenerateAssetsParams, ToolResult> {
    private config;
    static readonly Name: string;
    constructor(config: Config);
    protected createInvocation(params: GenerateAssetsParams): ToolInvocation<GenerateAssetsParams, ToolResult>;
}
