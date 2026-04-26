import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from './tools.js';
import type { Config } from '../config/config.js';
/**
 * Game archetype based on physics classification
 */
export type GameArchetype = 'platformer' | 'top_down' | 'grid_logic' | 'tower_defense' | 'ui_heavy';
export interface GenerateGDDParams {
    /**
     * Raw user's game idea or description
     */
    raw_user_requirement: string;
    /**
     * Game archetype (REQUIRED) - determined by classify-game-type tool in Phase 1
     */
    archetype: GameArchetype;
    /**
     * Optional: Config summary if agent already read gameConfig.json
     * Tool will auto-load archetype-specific rules if not provided
     */
    config_summary?: string;
}
export interface GDDModelConfig {
    apiKey: string;
    baseUrl: string;
    modelName: string;
    temperature?: number;
    timeout?: number;
}
export declare class GenerateGDDTool extends BaseDeclarativeTool<GenerateGDDParams, ToolResult> {
    private config;
    private modelConfig?;
    static readonly Name: string;
    /**
     * Resolve the GDD reasoning-model config from env / settings. Throws
     * `MissingProviderConfigError` (with an actionable message) when no
     * key is configured. Called lazily by the invocation to avoid crashing
     * tool registration.
     */
    static resolveModelConfig(config?: Config): GDDModelConfig;
    constructor(config: Config, modelConfig?: GDDModelConfig | undefined);
    protected validateToolParamValues(params: GenerateGDDParams): string | null;
    protected createInvocation(params: GenerateGDDParams): ToolInvocation<GenerateGDDParams, ToolResult>;
}
