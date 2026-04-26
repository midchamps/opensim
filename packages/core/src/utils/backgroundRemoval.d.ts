/**
 * Background Removal Utility
 * Supports two backends:
 * 1. @imgly/background-removal-node (Node.js, default)
 * 2. rembg + u2net (Python, like PiXelDa) - higher quality
 */
export type BackgroundRemovalBackend = 'imgly' | 'rembg';
export interface BackgroundRemovalOptions {
    projectRoot: string;
    debug?: boolean;
    backend?: BackgroundRemovalBackend;
    pythonPath?: string;
}
export declare class BackgroundRemovalService {
    private options;
    private backend;
    private rembgAvailable;
    constructor(options: BackgroundRemovalOptions);
    /**
     * Check if rembg (Python) is available
     */
    isRembgAvailable(): Promise<boolean>;
    /**
     * Remove background from image URL
     * Returns a Buffer with transparent background
     */
    removeBackground(imageUrl: string): Promise<Buffer>;
    /**
     * Remove background with fallback to original image on failure
     * Downloads the image ONCE and reuses the buffer for fallback
     */
    removeBackgroundSafe(imageUrl: string): Promise<Buffer>;
    /**
     * Remove background from a Buffer (for local files)
     * Returns a Buffer with transparent background
     */
    removeBackgroundFromBuffer(imageBuffer: Buffer): Promise<Buffer>;
    /**
     * Remove background using @imgly/background-removal-node (Node.js)
     */
    private removeBackgroundWithImgly;
    /**
     * Remove background using rembg + u2net (Python, like PiXelDa)
     * Higher quality but requires Python environment
     */
    private removeBackgroundWithRembg;
}
/**
 * Simple function wrapper for one-off usage
 */
export declare function removeBackgroundFromUrl(imageUrl: string, projectRoot: string, fallbackOnError?: boolean): Promise<Buffer>;
