import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from './tools.js';
import type { Config } from '../config/config.js';
export interface GameTypeClassifierParams {
    /**
     * User's game description or idea
     */
    game_description: string;
}
export interface ClassifierModelConfig {
    apiKey: string;
    baseUrl: string;
    modelName: string;
    temperature?: number;
    timeout?: number;
}
/**
 * Game archetype based on physics and perspective
 */
export type GameArchetype = 'platformer' | 'top_down' | 'grid_logic' | 'tower_defense' | 'ui_heavy';
export interface ClassificationResult {
    archetype: GameArchetype;
    reasoning: string;
    physicsProfile: {
        hasGravity: boolean;
        perspective: 'side' | 'top_down' | 'none';
        movementType: 'continuous' | 'grid' | 'path' | 'ui_only';
    };
}
export declare class GameTypeClassifierTool extends BaseDeclarativeTool<GameTypeClassifierParams, ToolResult> {
    private config;
    /** Optional override; if omitted the invocation resolves at execute time. */
    private modelConfig?;
    static readonly Name: string;
    /**
     * Resolve the classifier's reasoning-model config from
     * env / ~/.qwen settings.  Throws `MissingProviderConfigError` (with an
     * actionable message) when nothing is configured. Called lazily by the
     * invocation so tool registration doesn't crash on a fresh install.
     */
    static resolveModelConfig(config?: Config): ClassifierModelConfig;
    constructor(config: Config, 
    /** Optional override; if omitted the invocation resolves at execute time. */
    modelConfig?: ClassifierModelConfig | undefined);
    protected validateToolParamValues(params: GameTypeClassifierParams): string | null;
    protected createInvocation(params: GameTypeClassifierParams): ToolInvocation<GameTypeClassifierParams, ToolResult>;
}
