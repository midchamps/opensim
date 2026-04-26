/**
 * Video Generation Service
 * Supports I2V (Image-to-Video) and T2V (Text-to-Video) for animation/audio generation
 * Inspired by PiXelDa's video generation architecture
 */
import { BaseService } from './assetBaseService.js';
import type { VideoModelConfig, VideoGenerationResponse } from '../tools/generate-assets-types.js';
export declare class TongyiVideoService extends BaseService {
    private config;
    constructor(config: VideoModelConfig);
    generateVideo(baseImageUrl: string, prompt: string, resolution?: string): Promise<VideoGenerationResponse>;
    generateVideoFromText(prompt: string, resolution?: string): Promise<VideoGenerationResponse>;
    private submitAndPoll;
}
export declare class DoubaoVideoService extends BaseService {
    private config;
    private arkBaseUrl;
    constructor(config: VideoModelConfig);
    generateVideo(baseImageUrl: string, prompt: string, resolution?: string): Promise<VideoGenerationResponse>;
    generateVideoFromText(prompt: string, resolution?: string): Promise<VideoGenerationResponse>;
    private generateVideoInternal;
    private pollDoubaoVideoTask;
}
export declare class FrameExtractionService extends BaseService {
    private ffmpegPath;
    private getFFmpegPath;
    private tryFFmpegPath;
    isFFmpegAvailable(): Promise<boolean>;
    extractFramesLocal(videoUrl: string, frameCount: number, fromTime?: number, toTime?: number, outputDir?: string, firstLastOnly?: boolean): Promise<{
        frameUrls: string[];
        framePaths: string[];
        videoPath: string;
    }>;
    extractAudio(videoUrl: string, outputDir?: string, startTime?: number, duration?: number): Promise<string>;
    private downloadVideo;
    private extractSingleFrame;
}
export interface IVideoService {
    generateVideo(baseImageUrl: string, prompt: string, resolution?: string): Promise<VideoGenerationResponse>;
    generateVideoFromText(prompt: string, resolution?: string): Promise<VideoGenerationResponse>;
}
export declare function createVideoService(config: VideoModelConfig): IVideoService;
