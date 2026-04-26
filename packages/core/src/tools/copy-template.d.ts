import { BaseDeclarativeTool, type ToolInvocation, type ToolResult } from './tools.js';
import type { Config } from '../config/config.js';
export interface CopyTemplateParams {
    /**
     * Optional project name (used for package.json name if provided)
     */
    project_name?: string;
}
export declare class CopyTemplateTool extends BaseDeclarativeTool<CopyTemplateParams, ToolResult> {
    private config;
    static readonly Name = "CopyTemplate";
    constructor(config: Config);
    protected createInvocation(params: CopyTemplateParams): ToolInvocation<CopyTemplateParams, ToolResult>;
}
