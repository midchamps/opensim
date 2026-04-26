import Phaser from 'phaser';
import { initUIDom } from '../utils';
export default class UIScene extends Phaser.Scene {
    gameSceneKey = '';
    turnMode = 'step';
    maxMoves = -1;
    dom;
    _eventHandlers = [];
    constructor() {
        super({ key: 'UIScene' });
    }
    init(data) {
        this.gameSceneKey = data.gameSceneKey;
        this.turnMode = data.turnMode ?? 'step';
        this.maxMoves = data.maxMoves ?? -1;
    }
    create() {
        this.dom = initUIDom(this, this.createDOMUI());
        this.setupEventListeners();
        this.setupButtonHandlers();
    }
    createDOMUI() {
        const moveLabel = this.turnMode === 'turn' ? 'Turn' : 'Moves';
        const moveDisplay = this.maxMoves > 0 ? `0 / ${this.maxMoves}` : '0';
        return `
      <div id="grid-ui" style="
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; font-family: 'RetroPixel', monospace;
      ">
        <!-- Top Bar -->
        <div style="
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 12px 16px;
        ">
          <!-- Left: Stats -->
          <div style="display: flex; gap: 8px; flex-direction: column;">
            <div id="move-counter" class="game-pixel-container-brown" style="
              padding: 6px 14px; font-size: 14px; color: #fff;
              min-width: 100px; text-align: center;
            ">
              ${moveLabel}: <span id="move-value">${moveDisplay}</span>
            </div>
            <div id="hp-display" class="game-pixel-container-brown" style="
              padding: 6px 14px; font-size: 14px; color: #ff6666;
              min-width: 100px; text-align: center; display: none;
            ">
              <span id="hp-value"></span>
            </div>
            <div id="score-display" class="game-pixel-container-brown" style="
              padding: 6px 14px; font-size: 14px; color: #FFD700;
              min-width: 100px; text-align: center; display: none;
            ">
              Score: <span id="score-value">0</span>
            </div>
            <div id="status-display" class="game-pixel-container-brown" style="
              padding: 6px 14px; font-size: 13px; color: #aaddff;
              min-width: 100px; text-align: center; display: none;
            ">
              <span id="status-value"></span>
            </div>
          </div>

          <!-- Right: Buttons -->
          <div style="display: flex; gap: 8px; flex-direction: column; align-items: flex-end;">
            <button id="pause-btn" class="game-pixel-container-clickable-brown" style="
              pointer-events: auto; cursor: pointer; padding: 8px 12px;
              font-size: 14px; color: #fff; border: none; font-family: inherit;
            ">
              || Pause
            </button>
            <button id="undo-btn" class="game-pixel-container-clickable-brown" style="
              pointer-events: auto; cursor: pointer; padding: 8px 12px;
              font-size: 14px; color: #fff; border: none; font-family: inherit;
              opacity: 0.4;
            ">
              &lt; Undo
            </button>
          </div>
        </div>

        <!-- Bottom: Controls Hint -->
        <div style="
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          font-size: 11px; color: rgba(255,255,255,0.5); text-align: center;
          line-height: 1.4;
        ">
          <span id="controls-hint">Arrow keys / WASD: Move &nbsp;|&nbsp; Space: Action &nbsp;|&nbsp; Z: Undo &nbsp;|&nbsp; ESC: Pause</span>
        </div>

        <!-- Center: Level Info (shown briefly) -->
        <div id="level-info" style="
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          font-size: 24px; color: #fff; text-align: center;
          text-shadow: 0 2px 8px rgba(0,0,0,0.8);
          opacity: 0; transition: opacity 0.5s;
          pointer-events: none;
        ">
          <span id="level-title"></span>
        </div>
      </div>
    `;
    }
    listenGameEvent(event, handler) {
        const gameScene = this.scene.get(this.gameSceneKey);
        if (!gameScene)
            return;
        gameScene.events.on(event, handler, this);
        this._eventHandlers.push({ event, handler });
    }
    setupEventListeners() {
        this.listenGameEvent('moveCountChanged', (count, max) => {
            this.updateMoveCounter(count, max);
        });
        this.listenGameEvent('turnChanged', (turnNumber) => {
            this.updateTurnDisplay(turnNumber);
        });
        this.listenGameEvent('scoreChanged', (score) => {
            this.updateScore(score);
        });
        this.listenGameEvent('hpChanged', (current, max) => {
            this.updateHP(current, max);
        });
        this.listenGameEvent('statusChanged', (text) => {
            this.updateStatus(text);
        });
        this.listenGameEvent('undoAvailable', (available) => {
            this.setUndoEnabled(available);
        });
        this.listenGameEvent('showLevelTitle', (title) => {
            this.showLevelTitle(title);
        });
    }
    setupButtonHandlers() {
        const pauseBtn = this.dom.getChildByID('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.scene.launch('PauseUIScene', { gameSceneKey: this.gameSceneKey });
                this.scene.get(this.gameSceneKey)?.scene.pause();
            });
        }
        const undoBtn = this.dom.getChildByID('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                const gameScene = this.scene.get(this.gameSceneKey);
                if (gameScene) {
                    gameScene.events.emit('undoRequested');
                }
            });
        }
    }
    // --------------------------------------------------------------------------
    // UI Updates
    // --------------------------------------------------------------------------
    updateMoveCounter(count, max) {
        const el = this.dom.getChildByID('move-value');
        if (!el)
            return;
        if (max > 0) {
            el.textContent = `${count} / ${max}`;
            el.style.color = max - count <= 3 ? '#ff4444' : '#fff';
        }
        else {
            el.textContent = `${count}`;
        }
    }
    updateTurnDisplay(turnNumber) {
        const el = this.dom.getChildByID('move-value');
        if (!el)
            return;
        if (this.turnMode === 'turn') {
            el.textContent = `${turnNumber}`;
        }
    }
    updateScore(score) {
        const container = this.dom.getChildByID('score-display');
        const el = this.dom.getChildByID('score-value');
        if (container)
            container.style.display = 'block';
        if (el)
            el.textContent = `${score}`;
    }
    updateHP(current, max) {
        const container = this.dom.getChildByID('hp-display');
        const el = this.dom.getChildByID('hp-value');
        if (!container || !el)
            return;
        container.style.display = 'block';
        let hearts = '';
        for (let i = 0; i < max; i++) {
            hearts += i < current ? '\u2764' : '\u2661';
        }
        el.textContent = hearts;
    }
    updateStatus(text) {
        const container = this.dom.getChildByID('status-display');
        const el = this.dom.getChildByID('status-value');
        if (!container || !el)
            return;
        if (text) {
            container.style.display = 'block';
            el.textContent = text;
        }
        else {
            container.style.display = 'none';
        }
    }
    setUndoEnabled(enabled) {
        const btn = this.dom.getChildByID('undo-btn');
        if (btn) {
            btn.style.opacity = enabled ? '1' : '0.4';
            btn.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    }
    showLevelTitle(title) {
        const el = this.dom.getChildByID('level-info');
        const titleEl = this.dom.getChildByID('level-title');
        if (!el || !titleEl)
            return;
        titleEl.textContent = title;
        el.style.opacity = '1';
        this.time.delayedCall(2000, () => {
            el.style.opacity = '0';
        });
    }
    // --------------------------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------------------------
    shutdown() {
        const gameScene = this.scene.get(this.gameSceneKey);
        if (gameScene) {
            for (const { event, handler } of this._eventHandlers) {
                gameScene.events.off(event, handler, this);
            }
        }
        this._eventHandlers.length = 0;
    }
}
//# sourceMappingURL=UIScene.js.map