import Phaser from 'phaser';
export interface WaveGroup {
    enemyType: string;
    count: number;
    /** ms between spawns within this group */
    interval: number;
}
export interface WaveDefinition {
    groups: WaveGroup[];
    /** bonus gold for clearing wave */
    reward?: number;
    /** ms before this wave starts (after previous completes or game start) */
    preDelay?: number;
}
export declare class WaveManager {
    private scene;
    private waves;
    private currentWaveIndex;
    private spawnQueue;
    private spawnTimer;
    private activeEnemyCount;
    private waveActive;
    private allWavesStarted;
    private betweenWaveTimer;
    private waitingForNextWave;
    private timeBetweenWaves;
    private minSpawnInterval;
    /**
     * @param minSpawnInterval - Minimum ms between spawns to prevent visual overlap.
     *   Formula: (enemyDisplayHeight / enemySpeed) * 1000 * safetyFactor
     *   Default 700ms works for most enemy sizes ~60-100px at speed 80-120px/s.
     */
    constructor(scene: Phaser.Scene, waves: WaveDefinition[], timeBetweenWaves?: number, minSpawnInterval?: number);
    get currentWave(): number;
    get totalWaves(): number;
    get isWaveActive(): boolean;
    get isAllWavesComplete(): boolean;
    get isWaitingForNextWave(): boolean;
    get timeBetweenWavesMs(): number;
    /** Call when an enemy dies or reaches the exit */
    notifyEnemyRemoved(): void;
    startFirstWave(): void;
    private startNextWave;
    private buildSpawnQueue;
    /** Skip the between-wave timer and start the next wave immediately */
    skipToNextWave(): void;
    update(delta: number): void;
    private onWaveCleared;
    destroy(): void;
}
