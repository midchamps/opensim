/**
 * ============================================================================
 * CHARACTER PORTRAIT - Character display with expression management
 * ============================================================================
 *
 * Manages a character's visual representation on screen:
 * - Display portrait image at a screen position (left, center, right)
 * - Switch expressions via texture changes
 * - Enter/exit animations (slide, fade)
 * - Highlight active speaker (dim others)
 *
 * USAGE:
 *   const portrait = new CharacterPortrait(scene, {
 *     id: 'hero',
 *     textureKey: 'hero_neutral',
 *     displayName: 'Alaric',
 *     expressions: { happy: 'hero_happy', angry: 'hero_angry' },
 *     position: 'left',
 *   });
 *   portrait.enter();               // slide in with animation
 *   portrait.setExpression('happy'); // change face
 *   portrait.setActive(true);       // highlight as speaker
 *   portrait.exit();                // slide out
 */
import Phaser from 'phaser';
export interface PortraitConfig {
    /** Character ID */
    id: string;
    /** Default texture key */
    textureKey: string;
    /** Display name */
    displayName: string;
    /** Expression texture map: { expressionName: textureKey } */
    expressions?: Record<string, string>;
    /** Screen position */
    position: 'left' | 'center' | 'right';
    /** Display scale (default: 1.0) */
    scale?: number;
    /** Y position from bottom (default: 0, aligned to bottom of screen) */
    bottomOffset?: number;
}
export declare class CharacterPortrait extends Phaser.GameObjects.Container {
    private portraitConfig;
    private portrait;
    private namePlate?;
    private isOnScreen;
    private isActiveSpeaker;
    private screenWidth;
    private screenHeight;
    constructor(scene: Phaser.Scene, config: PortraitConfig);
    /** Animate character entering the scene. */
    enter(onComplete?: () => void): void;
    /** Animate character exiting the scene. */
    exit(onComplete?: () => void): void;
    /** Change character expression. */
    setExpression(expression: string): void;
    /** Highlight as active speaker (full brightness) or dim (inactive). */
    setSpeakerActive(active: boolean): void;
    /** Move to a different screen position with animation. */
    moveToPosition(position: 'left' | 'center' | 'right', onComplete?: () => void): void;
    /** Check if character is currently on screen. */
    getIsOnScreen(): boolean;
    /** Get config ID */
    getId(): string;
    private createPortrait;
    private getXForPosition;
}
