/**
 * Audio Generation Service
 * Generates game audio using ABC Notation + LLM
 * Inspired by PiXelDa's music generation architecture
 */
import { BaseService } from './assetBaseService.js';
import type { AudioModelConfig, AudioRequest } from '../tools/generate-assets-types.js';
export declare class TongyiAudioService extends BaseService {
    private config;
    constructor(config: AudioModelConfig);
    generateABC(request: AudioRequest): Promise<string>;
}
export declare class DoubaoAudioService extends BaseService {
    private config;
    private arkBaseUrl;
    constructor(config: AudioModelConfig);
    generateABC(request: AudioRequest): Promise<string>;
}
export declare class AudioRenderService extends BaseService {
    private pythonPath;
    private symusicAvailable;
    constructor(pythonPath?: string);
    isSymusicAvailable(): Promise<boolean>;
    abcToWav(abcNotation: string, chiptune?: boolean): Promise<Buffer>;
    generateFromABC(abcNotation: string, type?: 'sfx' | 'bgm', durationSeconds?: number): Promise<Buffer>;
    generateGameAudio(durationSeconds?: number, type?: 'sfx' | 'bgm'): Promise<Buffer>;
    private generateSfxWav;
    private generateBgmWav;
}
export declare class OpenAICompatAudioService extends BaseService {
    private config;
    constructor(config: AudioModelConfig);
    generateABC(request: AudioRequest): Promise<string>;
}
export interface IAudioService {
    generateABC(request: AudioRequest): Promise<string>;
}
export declare function createAudioService(config: AudioModelConfig): IAudioService;
