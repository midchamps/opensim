/**
 * CLI path auto-detection and subprocess spawning utilities
 *
 * Supports multiple execution modes:
 * 1. Bundled CLI: Node.js bundle included in the SDK package (default)
 * 2. Node.js bundle: 'node /path/to/cli.js' (custom path)
 * 3. Bun bundle: 'bun /path/to/cli.js' (alternative runtime)
 * 4. TypeScript source: 'tsx /path/to/index.ts' (development)
 */
/**
 * Executable types supported by the SDK
 */
export type ExecutableType = 'native' | 'node' | 'bun' | 'tsx' | 'deno';
/**
 * Spawn information for CLI process
 */
export type SpawnInfo = {
    /** Command to execute (e.g., 'opengame', 'node', 'bun', 'tsx') */
    command: string;
    /** Arguments to pass to command */
    args: string[];
    /** Type of executable detected */
    type: ExecutableType;
    /** Original input that was resolved */
    originalInput: string;
};
export declare function findNativeCliPath(): string;
/**
 * Parse executable specification into components with comprehensive validation
 *
 * Supports multiple formats:
 * - 'opengame' -> native binary (auto-detected)
 * - '/path/to/opengame' -> native binary (explicit path)
 * - '/path/to/cli.js' -> Node.js bundle (default for .js files)
 * - '/path/to/index.ts' -> TypeScript source (requires tsx)
 *
 * Advanced runtime specification (for overriding defaults):
 * - 'bun:/path/to/cli.js' -> Force Bun runtime
 * - 'node:/path/to/cli.js' -> Force Node.js runtime
 * - 'tsx:/path/to/index.ts' -> Force tsx runtime
 * - 'deno:/path/to/cli.ts' -> Force Deno runtime
 *
 * @param executableSpec - Executable specification
 * @returns Parsed executable information
 * @throws Error if specification is invalid or files don't exist
 */
export declare function parseExecutableSpec(executableSpec?: string): {
    runtime?: string;
    executablePath: string;
    isExplicitRuntime: boolean;
};
export declare function prepareSpawnInfo(executableSpec?: string): SpawnInfo;
