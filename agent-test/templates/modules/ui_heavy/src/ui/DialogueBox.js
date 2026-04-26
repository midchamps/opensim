/**
 * ============================================================================
 * DIALOGUE BOX - Text display with typewriter effect
 * ============================================================================
 *
 * A Phaser Container that displays dialogue text with:
 * - Typewriter (character-by-character) text reveal
 * - Speaker name label
 * - Background panel (solid color rectangle)
 * - Click/Enter to complete or advance
 * - Configurable text speed, font, colors
 *
 * EVENTS:
 *   - 'typeComplete': () => void  -- typewriter finished current text
 *   - 'advance': () => void       -- player clicked to advance
 *   - 'skip': () => void          -- player skipped typewriter
 *
 * USAGE:
 *   const box = new DialogueBox(scene, { x: 512, y: 650, width: 900, height: 150 });
 *   box.showText('Alaric', 'Hello there!');
 *   box.on('typeComplete', () => { ... });
 *   // On click: box.handleInput();  // completes or advances
 */
import Phaser from 'phaser';
export class DialogueBox extends Phaser.GameObjects.Container {
    boxConfig;
    background;
    nameText;
    bodyText;
    continueIndicator;
    typeTimer;
    fullText = '';
    currentCharIndex = 0;
    isTyping = false;
    constructor(scene, config) {
        super(scene, 0, 0);
        this.boxConfig = config;
        scene.add.existing(this);
        this.setDepth(100);
        this.createElements();
    }
    // -- Public API --
    /** Show text with typewriter effect. */
    showText(speaker, text) {
        this.setVisible(true);
        // Set speaker name
        if (speaker && speaker !== 'narrator') {
            this.nameText.setText(speaker);
            this.nameText.setVisible(true);
        }
        else {
            this.nameText.setText('');
            this.nameText.setVisible(false);
        }
        // Start typewriter
        this.fullText = text;
        this.currentCharIndex = 0;
        this.bodyText.setText('');
        this.continueIndicator.setVisible(false);
        this.isTyping = true;
        this.startTypewriter(text);
    }
    /** Handle player input (complete typewriter or signal advance). */
    handleInput() {
        if (this.isTyping) {
            this.completeTypewriter();
        }
        else {
            this.emit('advance');
        }
    }
    /** Complete typewriter immediately (show full text). */
    completeTypewriter() {
        if (this.typeTimer) {
            this.typeTimer.destroy();
            this.typeTimer = undefined;
        }
        this.bodyText.setText(this.fullText);
        this.isTyping = false;
        this.continueIndicator.setVisible(true);
        this.emit('typeComplete');
    }
    /** Show/hide the dialogue box. */
    setBoxVisible(visible) {
        this.setVisible(visible);
    }
    /** Check if typewriter is currently animating. */
    getIsTyping() {
        return this.isTyping;
    }
    // -- Internal --
    createElements() {
        const cfg = this.boxConfig;
        const pad = cfg.padding ?? 20;
        // Background
        if (cfg.backgroundKey && this.scene.textures.exists(cfg.backgroundKey)) {
            this.background = this.scene.add.image(cfg.x, cfg.y, cfg.backgroundKey);
            this.background.setDisplaySize(cfg.width, cfg.height);
        }
        else {
            this.background = this.scene.add.rectangle(cfg.x, cfg.y, cfg.width, cfg.height, cfg.backgroundColor ?? 0x000000, cfg.backgroundAlpha ?? 0.8);
        }
        this.background.setOrigin(0.5);
        this.add(this.background);
        // Add border
        const border = this.scene.add.rectangle(cfg.x, cfg.y, cfg.width + 4, cfg.height + 4);
        border.setStrokeStyle(2, 0x888888);
        border.setFillStyle(0x000000, 0);
        border.setOrigin(0.5);
        border.setDepth(-1);
        this.add(border);
        // Speaker name
        const nameLeft = cfg.x - cfg.width / 2 + pad;
        const nameTop = cfg.y - cfg.height / 2 + pad;
        this.nameText = this.scene.add.text(nameLeft, nameTop, '', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#C8A2C8',
            fontStyle: 'bold',
            ...(cfg.nameStyle ?? {}),
        });
        this.add(this.nameText);
        // Body text
        const textTop = nameTop + 28;
        const textWidth = cfg.width - pad * 2;
        this.bodyText = this.scene.add.text(nameLeft, textTop, '', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#E8D8A0',
            wordWrap: { width: textWidth },
            lineSpacing: 4,
            ...(cfg.textStyle ?? {}),
        });
        this.add(this.bodyText);
        // Continue indicator (blinking triangle)
        const indicatorX = cfg.x + cfg.width / 2 - pad;
        const indicatorY = cfg.y + cfg.height / 2 - pad;
        this.continueIndicator = this.scene.add
            .text(indicatorX, indicatorY, '\u25BC', {
            fontSize: '16px',
            color: '#ffffff',
        })
            .setOrigin(1, 1);
        this.continueIndicator.setVisible(false);
        this.add(this.continueIndicator);
        // Blink animation for indicator
        this.scene.tweens.add({
            targets: this.continueIndicator,
            alpha: { from: 1, to: 0.3 },
            duration: 500,
            yoyo: true,
            repeat: -1,
        });
    }
    startTypewriter(text) {
        const speed = this.boxConfig.typeSpeed ?? 30;
        this.currentCharIndex = 0;
        this.typeTimer = this.scene.time.addEvent({
            delay: speed,
            callback: () => {
                this.currentCharIndex++;
                this.bodyText.setText(text.substring(0, this.currentCharIndex));
                if (this.currentCharIndex >= text.length) {
                    this.isTyping = false;
                    this.continueIndicator.setVisible(true);
                    if (this.typeTimer) {
                        this.typeTimer.destroy();
                        this.typeTimer = undefined;
                    }
                    this.emit('typeComplete');
                }
            },
            repeat: text.length - 1,
        });
    }
}
//# sourceMappingURL=DialogueBox.js.map