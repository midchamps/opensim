import Phaser from 'phaser';
import type { TowerTypeConfig } from '../towers/BaseTower';
/**
 * UI Scene -- In-game HUD overlay (Tower Defense)
 *
 * This is the tower defense module's UIScene with TD-specific HUD elements:
 * - Gold counter, Lives counter, Wave progress
 * - Tower selection panel (bottom)
 * - Pause button + ESC key
 * - Controls hint
 *
 * This file OVERWRITES the core UIScene.ts during scaffold.
 *
 * Communication with game scene via Phaser events:
 * - Game -> UI: 'goldChanged', 'livesChanged', 'waveChanged', 'towerTypesReady'
 * - UI -> Game: 'towerTypeSelected', 'towerTypeDeselected'
 */
export default class UIScene extends Phaser.Scene {
    currentGameSceneKey: string | null;
    uiContainer: Phaser.GameObjects.DOMElement | null;
    private gold;
    private lives;
    private currentWave;
    private totalWaves;
    private towerTypes;
    private selectedTowerTypeId;
    private waveTimerActive;
    private waveTimerEndTime;
    constructor();
    init(data: {
        callingScene?: string;
        gold?: number;
        lives?: number;
        towerTypes?: TowerTypeConfig[];
    }): void;
    create(): void;
    createDOMUI(): void;
    private setupPauseControls;
    private pauseGame;
    private setupTowerButtons;
    /**
     * Extract Phaser textures and inject them as data URLs into tower button icons.
     * Uses the game scene's texture manager to convert loaded textures to base64.
     */
    private injectTowerIcons;
    private selectTower;
    private deselectTower;
    private updateTowerButtonStyles;
    private setupGameEventListeners;
    private updateGoldDisplay;
    private updateLivesDisplay;
    private updateWaveDisplay;
    private showWaveTimer;
    private hideWaveTimer;
    private updateWaveTimer;
    private showCombo;
    private showWaveBonus;
    update(): void;
}
