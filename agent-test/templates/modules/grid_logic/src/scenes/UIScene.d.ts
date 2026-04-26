import Phaser from 'phaser';
import type { GridTimingMode } from '../systems/TurnManager';
interface UISceneData {
    gameSceneKey: string;
    turnMode: GridTimingMode;
    maxMoves: number;
}
export default class UIScene extends Phaser.Scene {
    private gameSceneKey;
    private turnMode;
    private maxMoves;
    private dom;
    private _eventHandlers;
    constructor();
    init(data: UISceneData): void;
    create(): void;
    private createDOMUI;
    private listenGameEvent;
    private setupEventListeners;
    private setupButtonHandlers;
    private updateMoveCounter;
    private updateTurnDisplay;
    private updateScore;
    private updateHP;
    private updateStatus;
    private setUndoEnabled;
    private showLevelTitle;
    shutdown(): void;
}
export {};
