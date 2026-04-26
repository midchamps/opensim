/**
 * ============================================================================
 * CARD - Interactive card UI prefab (Container)
 * ============================================================================
 *
 * A Phaser Container composing multiple elements into an interactive card:
 * - Card frame (Image or colored rectangle)
 * - Name text
 * - Description text
 * - Value indicator
 * - Hover effects (tween: float up + glow)
 * - Click handler
 * - Disabled/locked state
 *
 * EVENTS:
 *   - 'selected': (cardConfig) => void
 *   - 'hoverIn': (cardConfig) => void
 *   - 'hoverOut': (cardConfig) => void
 *
 * USAGE:
 *   const card = new Card(scene, 200, 500, {
 *     id: 'fireball', name: 'Fireball', type: 'attack', value: 25,
 *     textureKey: 'spell_card_frame', description: 'Deal 25 fire damage',
 *   });
 *   card.on('selected', (config) => battleScene.onCardSelected(config));
 */
import Phaser from 'phaser';
import {} from '../scenes/BaseBattleScene';
export class Card extends Phaser.GameObjects.Container {
    cardConfig;
    displayConfig;
    frame;
    artImage;
    nameText;
    descText;
    valueText;
    isHovered = false;
    isDisabled = false;
    originalY;
    constructor(scene, x, y, cardConfig, displayConfig) {
        super(scene, x, y);
        this.cardConfig = cardConfig;
        this.displayConfig = displayConfig ?? {};
        this.originalY = y;
        scene.add.existing(this);
        this.setDepth(160);
        this.createElements();
        this.setupInteraction();
    }
    // -- Public API --
    /** Get the card configuration data. */
    getCardConfig() {
        return this.cardConfig;
    }
    /** Enable/disable the card (disabled cards cannot be clicked). */
    setDisabled(disabled) {
        this.isDisabled = disabled;
        this.setAlpha(disabled ? 0.5 : 1.0);
    }
    /** Play a "card played" animation (fly to center, fade out). */
    playUsedAnimation(onComplete) {
        const cam = this.scene.cameras.main;
        this.scene.tweens.add({
            targets: this,
            x: cam.width / 2,
            y: cam.height / 2,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 400,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.destroy();
                onComplete?.();
            },
        });
    }
    /** Play a "card drawn" animation (slide in from a position). */
    playDrawAnimation(fromX, fromY, onComplete) {
        const targetX = this.x;
        const targetY = this.y;
        this.setPosition(fromX, fromY);
        this.setAlpha(0);
        this.setScale(0.5);
        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => onComplete?.(),
        });
    }
    // -- Internal --
    createElements() {
        const cfg = this.displayConfig;
        const cardW = cfg.width ?? 140;
        const cardH = cfg.height ?? 190;
        // Card frame
        const frameKey = cfg.frameKey ?? this.cardConfig.textureKey;
        if (frameKey && this.scene.textures.exists(frameKey)) {
            this.frame = this.scene.add.image(0, 0, frameKey);
            this.frame.setDisplaySize(cardW, cardH);
        }
        else {
            // Colored rectangle based on card type
            const typeColors = {
                attack: 0x8b0000,
                heavy_attack: 0x4b0000,
                defend: 0x00008b,
                heal: 0x006400,
                special: 0x4b0082,
            };
            const color = typeColors[this.cardConfig.type] ?? 0x333333;
            this.frame = this.scene.add.rectangle(0, 0, cardW, cardH, color, 0.9);
            this.frame.setStrokeStyle(2, 0xcccccc);
        }
        this.frame.setOrigin(0.5);
        this.add(this.frame);
        // Type label at top with color coding per card type
        const typeLabels = {
            attack: 'ATTACK',
            heavy_attack: 'HEAVY ATK',
            defend: 'SHIELD',
            heal: 'HEAL',
            special: 'SPECIAL',
        };
        const typeLabelColors = {
            attack: '#ff6644',
            heavy_attack: '#ff3333',
            defend: '#4488ff',
            heal: '#44cc44',
            special: '#cc88ff',
        };
        const typeLabel = typeLabels[this.cardConfig.type] ?? this.cardConfig.type.toUpperCase();
        const typeColor = typeLabelColors[this.cardConfig.type] ?? '#aaaaaa';
        const typeText = this.scene.add
            .text(0, -cardH / 2 + 12, typeLabel, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: typeColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2,
        })
            .setOrigin(0.5, 0);
        this.add(typeText);
        // Card name
        this.nameText = this.scene.add
            .text(0, -10, this.cardConfig.name, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2,
            wordWrap: { width: cardW - 16 },
            align: 'center',
            ...(cfg.nameStyle ?? {}),
        })
            .setOrigin(0.5);
        this.add(this.nameText);
        // Description - with stroke for readability against any card frame
        if (this.cardConfig.description) {
            this.descText = this.scene.add
                .text(0, 20, this.cardConfig.description, {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: cardW - 20 },
                align: 'center',
                lineSpacing: 2,
                ...(cfg.descStyle ?? {}),
            })
                .setOrigin(0.5, 0);
            this.add(this.descText);
        }
        // Value
        const valueStr = this.cardConfig.value > 0 ? String(this.cardConfig.value) : '';
        if (valueStr) {
            this.valueText = this.scene.add
                .text(0, cardH / 2 - 20, valueStr, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#ffdd44',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3,
            })
                .setOrigin(0.5);
            this.add(this.valueText);
        }
    }
    setupInteraction() {
        // Make the frame interactive (it covers the whole card area)
        if (this.frame instanceof Phaser.GameObjects.Rectangle) {
            this.frame.setInteractive({ useHandCursor: true });
        }
        else {
            this.frame.setInteractive({ useHandCursor: true });
        }
        this.frame.on('pointerover', () => this.onHoverIn());
        this.frame.on('pointerout', () => this.onHoverOut());
        this.frame.on('pointerdown', () => this.onClick());
    }
    onHoverIn() {
        if (this.isDisabled)
            return;
        this.isHovered = true;
        const lift = this.displayConfig.hoverLift ?? 20;
        const dur = this.displayConfig.hoverDuration ?? 200;
        this.scene.tweens.add({
            targets: this,
            y: this.originalY - lift,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: dur,
            ease: 'Cubic.easeOut',
        });
        this.emit('hoverIn', this.cardConfig);
    }
    onHoverOut() {
        this.isHovered = false;
        const dur = this.displayConfig.hoverDuration ?? 200;
        this.scene.tweens.add({
            targets: this,
            y: this.originalY,
            scaleX: 1,
            scaleY: 1,
            duration: dur,
            ease: 'Cubic.easeOut',
        });
        this.emit('hoverOut', this.cardConfig);
    }
    onClick() {
        if (this.isDisabled)
            return;
        this.emit('selected', this.cardConfig);
    }
}
//# sourceMappingURL=Card.js.map