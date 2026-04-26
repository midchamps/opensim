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
import { type CardConfig } from '../scenes/BaseBattleScene';
export interface CardDisplayConfig {
    /** Card width */
    width?: number;
    /** Card height */
    height?: number;
    /** Frame texture key */
    frameKey?: string;
    /** Art/icon texture key */
    artKey?: string;
    /** Text style for card name */
    nameStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    /** Text style for description */
    descStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    /** Hover tween distance (pixels, default: 20) */
    hoverLift?: number;
    /** Hover tween duration (ms, default: 200) */
    hoverDuration?: number;
}
export declare class Card extends Phaser.GameObjects.Container {
    private cardConfig;
    private displayConfig;
    private frame;
    private artImage?;
    private nameText;
    private descText?;
    private valueText?;
    private isHovered;
    private isDisabled;
    private originalY;
    constructor(scene: Phaser.Scene, x: number, y: number, cardConfig: CardConfig, displayConfig?: CardDisplayConfig);
    /** Get the card configuration data. */
    getCardConfig(): CardConfig;
    /** Enable/disable the card (disabled cards cannot be clicked). */
    setDisabled(disabled: boolean): void;
    /** Play a "card played" animation (fly to center, fade out). */
    playUsedAnimation(onComplete?: () => void): void;
    /** Play a "card drawn" animation (slide in from a position). */
    playDrawAnimation(fromX: number, fromY: number, onComplete?: () => void): void;
    private createElements;
    private setupInteraction;
    private onHoverIn;
    private onHoverOut;
    private onClick;
}
