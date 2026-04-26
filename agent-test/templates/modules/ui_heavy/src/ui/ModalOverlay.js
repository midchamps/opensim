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
export class ModalOverlay extends Phaser.GameObjects.Container {
    modalConfig;
    overlay;
    panel;
    content;
    isShowing = false;
    constructor(scene, config) {
        super(scene, 0, 0);
        this.modalConfig = config ?? {};
        scene.add.existing(this);
        this.setDepth(300);
        this.createOverlay();
        this.setVisible(false);
    }
    // -- Public API --
    /** Show the modal with fade-in. */
    show() {
        // Cancel any pending hide tween to prevent it from overriding this show
        this.scene.tweens.killTweensOf(this);
        this.isShowing = true;
        this.setVisible(true);
        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 200,
        });
    }
    /** Hide the modal with fade-out. */
    hide() {
        this.scene.tweens.killTweensOf(this);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.isShowing = false;
                this.setVisible(false);
                this.emit('hidden');
            },
        });
    }
    /** Check if modal is currently visible. */
    getIsShowing() {
        return this.isShowing;
    }
    // -- Protected (override in subclasses) --
    /** HOOK: Override to populate the content container with custom UI. */
    createContent() {
        // Override in subclass
    }
    // -- Internal --
    createOverlay() {
        const cam = this.scene.cameras.main;
        const w = cam.width;
        const h = cam.height;
        const cfg = this.modalConfig;
        // Dark overlay
        this.overlay = this.scene.add.rectangle(w / 2, h / 2, w, h, cfg.overlayColor ?? 0x000000, cfg.overlayAlpha ?? 0.6);
        this.overlay.setOrigin(0.5);
        this.overlay.setInteractive(); // block clicks to background
        this.add(this.overlay);
        if (cfg.closeOnOverlayClick) {
            this.overlay.on('pointerdown', () => this.hide());
        }
        // Panel background (colors and stroke are configurable)
        const panelW = cfg.width ?? 600;
        const panelH = cfg.height ?? 400;
        this.panel = this.scene.add.rectangle(w / 2, h / 2, panelW, panelH, cfg.panelColor ?? 0x1a1a2e, cfg.panelAlpha ?? 0.95);
        this.panel.setOrigin(0.5);
        this.panel.setStrokeStyle(cfg.panelStrokeWidth ?? 2, cfg.panelStrokeColor ?? 0x6666aa);
        this.add(this.panel);
        // Content container (positioned at panel center)
        this.content = this.scene.add.container(w / 2, h / 2);
        this.add(this.content);
        // Let subclasses populate content
        this.createContent();
    }
}
//# sourceMappingURL=ModalOverlay.js.map