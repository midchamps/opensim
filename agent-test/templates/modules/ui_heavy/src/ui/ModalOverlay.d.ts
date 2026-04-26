/**
 * ============================================================================
 * MODAL OVERLAY - Base class for modal dialogs
 * ============================================================================
 *
 * Creates a semi-transparent overlay that blocks background interaction,
 * providing a content container for modal windows like quiz panels,
 * confirmation dialogs, or information popups.
 *
 * USAGE:
 *   class MyModal extends ModalOverlay {
 *     protected createContent(): void {
 *       // Add your content to this.content container
 *       const text = this.scene.add.text(0, 0, 'Hello!');
 *       this.content.add(text);
 *     }
 *   }
 *   const modal = new MyModal(scene, { width: 600, height: 400 });
 *   modal.show();
 *   modal.hide();
 */
import Phaser from 'phaser';
export interface ModalConfig {
    /** Modal content area width */
    width?: number;
    /** Modal content area height */
    height?: number;
    /** Overlay background color (default: 0x000000) */
    overlayColor?: number;
    /** Overlay opacity (default: 0.6) */
    overlayAlpha?: number;
    /** Close on clicking overlay (default: false) */
    closeOnOverlayClick?: boolean;
    /** Panel background color (default: 0x1a1a2e) */
    panelColor?: number;
    /** Panel background opacity (default: 0.95) */
    panelAlpha?: number;
    /** Panel border color (default: 0x6666aa) */
    panelStrokeColor?: number;
    /** Panel border width (default: 2) */
    panelStrokeWidth?: number;
}
export declare class ModalOverlay extends Phaser.GameObjects.Container {
    protected modalConfig: ModalConfig;
    protected overlay: Phaser.GameObjects.Rectangle;
    protected panel: Phaser.GameObjects.Rectangle;
    protected content: Phaser.GameObjects.Container;
    protected isShowing: boolean;
    constructor(scene: Phaser.Scene, config?: ModalConfig);
    /** Show the modal with fade-in. */
    show(): void;
    /** Hide the modal with fade-out. */
    hide(): void;
    /** Check if modal is currently visible. */
    getIsShowing(): boolean;
    /** HOOK: Override to populate the content container with custom UI. */
    protected createContent(): void;
    private createOverlay;
}
