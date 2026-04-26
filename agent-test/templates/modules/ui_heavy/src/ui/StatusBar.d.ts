/**
 * ============================================================================
 * STATUS BAR - HP / MP / Score / Progress bar component
 * ============================================================================
 *
 * A reusable bar component for displaying any numeric value as a
 * filled rectangle with optional label and value text.
 *
 * FEATURES:
 * - Smooth animated fill transitions (tweened)
 * - Color change at thresholds (green -> yellow -> red)
 * - Optional label text (e.g., "HP", "Mana")
 * - Optional value text (e.g., "75/100")
 * - Customizable frame/border
 *
 * USAGE:
 *   const hpBar = new StatusBar(scene, 100, 50, {
 *     width: 200, height: 24,
 *     maxValue: 100,
 *     label: 'HP',
 *     showValue: true,
 *     colorThresholds: [
 *       { percent: 0.6, color: 0x00ff00 },
 *       { percent: 0.3, color: 0xffff00 },
 *       { percent: 0.0, color: 0xff0000 },
 *     ],
 *   });
 *   hpBar.setValue(75);  // animated fill to 75%
 */
import Phaser from 'phaser';
export interface ColorThreshold {
    /** Minimum percentage (0-1) for this color */
    percent: number;
    /** Fill color at this threshold */
    color: number;
}
export interface StatusBarConfig {
    /** Bar width */
    width: number;
    /** Bar height */
    height: number;
    /** Maximum value */
    maxValue: number;
    /** Initial value (default: maxValue) */
    initialValue?: number;
    /** Label text (e.g., "HP") */
    label?: string;
    /** Show "current/max" value text */
    showValue?: boolean;
    /** Fill color (default: 0x00ff00) */
    fillColor?: number;
    /** Background color (default: 0x333333) */
    backgroundColor?: number;
    /** Border color (default: 0xffffff) */
    borderColor?: number;
    /** Border width (default: 2) */
    borderWidth?: number;
    /** Color thresholds (sorted by percent descending) */
    colorThresholds?: ColorThreshold[];
    /** Animation duration for value changes (ms, default: 300) */
    animDuration?: number;
}
export declare class StatusBar extends Phaser.GameObjects.Container {
    private barConfig;
    private background;
    private fill;
    private border?;
    private labelText?;
    private valueText?;
    private currentValue;
    private maxValue;
    constructor(scene: Phaser.Scene, x: number, y: number, config: StatusBarConfig);
    /** Set the current value (animated). */
    setValue(value: number, animate?: boolean): void;
    /** Set the maximum value. */
    setMaxValue(maxValue: number): void;
    /** Get current value. */
    getValue(): number;
    /** Get percentage (0-1). */
    getPercent(): number;
    private createBar;
    private getColorForPercent;
}
