import Phaser from 'phaser';
export class WaveManager {
    scene;
    waves;
    currentWaveIndex = -1;
    spawnQueue = [];
    spawnTimer = 0;
    activeEnemyCount = 0;
    waveActive = false;
    allWavesStarted = false;
    betweenWaveTimer = 0;
    waitingForNextWave = false;
    timeBetweenWaves;
    minSpawnInterval;
    /**
     * @param minSpawnInterval - Minimum ms between spawns to prevent visual overlap.
     *   Formula: (enemyDisplayHeight / enemySpeed) * 1000 * safetyFactor
     *   Default 700ms works for most enemy sizes ~60-100px at speed 80-120px/s.
     */
    constructor(scene, waves, timeBetweenWaves = 5000, minSpawnInterval = 700) {
        this.scene = scene;
        this.waves = waves;
        this.timeBetweenWaves = timeBetweenWaves;
        this.minSpawnInterval = minSpawnInterval;
    }
    get currentWave() {
        return this.currentWaveIndex + 1;
    }
    get totalWaves() {
        return this.waves.length;
    }
    get isWaveActive() {
        return this.waveActive;
    }
    get isAllWavesComplete() {
        return (this.allWavesStarted && !this.waveActive && this.activeEnemyCount <= 0);
    }
    get isWaitingForNextWave() {
        return this.waitingForNextWave;
    }
    get timeBetweenWavesMs() {
        return this.timeBetweenWaves;
    }
    /** Call when an enemy dies or reaches the exit */
    notifyEnemyRemoved() {
        this.activeEnemyCount = Math.max(0, this.activeEnemyCount - 1);
    }
    startFirstWave() {
        this.startNextWave();
    }
    startNextWave() {
        this.currentWaveIndex++;
        if (this.currentWaveIndex >= this.waves.length) {
            this.allWavesStarted = true;
            return;
        }
        const wave = this.waves[this.currentWaveIndex];
        this.buildSpawnQueue(wave);
        this.spawnTimer = 0;
        this.waveActive = true;
        this.waitingForNextWave = false;
        this.scene.events.emit('waveStart', this.currentWaveIndex + 1, this.waves.length);
    }
    buildSpawnQueue(wave) {
        this.spawnQueue = [];
        const preDelay = wave.preDelay ?? 0;
        let accumulatedDelay = preDelay;
        for (const group of wave.groups) {
            const safeInterval = Math.max(group.interval, this.minSpawnInterval);
            for (let i = 0; i < group.count; i++) {
                this.spawnQueue.push({
                    enemyType: group.enemyType,
                    delay: accumulatedDelay,
                });
                accumulatedDelay += safeInterval;
            }
        }
    }
    /** Skip the between-wave timer and start the next wave immediately */
    skipToNextWave() {
        if (this.waitingForNextWave) {
            this.betweenWaveTimer = 0;
        }
    }
    update(delta) {
        if (this.waitingForNextWave) {
            this.betweenWaveTimer -= delta;
            if (this.betweenWaveTimer <= 0) {
                this.startNextWave();
            }
            return;
        }
        if (!this.waveActive)
            return;
        if (this.spawnQueue.length > 0) {
            this.spawnTimer += delta;
            while (this.spawnQueue.length > 0 &&
                this.spawnTimer >= this.spawnQueue[0].delay) {
                const spawn = this.spawnQueue.shift();
                this.activeEnemyCount++;
                this.scene.events.emit('spawnEnemy', spawn.enemyType);
            }
        }
        if (this.spawnQueue.length === 0 && this.activeEnemyCount <= 0) {
            this.onWaveCleared();
        }
    }
    onWaveCleared() {
        this.waveActive = false;
        const clearedWave = this.waves[this.currentWaveIndex];
        if (clearedWave?.reward) {
            this.scene.events.emit('waveReward', clearedWave.reward);
        }
        this.scene.events.emit('waveComplete', this.currentWaveIndex + 1, this.waves.length);
        if (this.currentWaveIndex + 1 >= this.waves.length) {
            this.allWavesStarted = true;
            this.scene.events.emit('allWavesComplete');
        }
        else {
            this.waitingForNextWave = true;
            this.betweenWaveTimer = this.timeBetweenWaves;
        }
    }
    destroy() {
        this.spawnQueue = [];
        this.waveActive = false;
    }
}
//# sourceMappingURL=WaveManager.js.map