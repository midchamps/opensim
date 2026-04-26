import Phaser from 'phaser';
/**
 * BaseEntity — Meta Template M0 Extension
 *
 * Minimal, game-agnostic entity base class.
 * Provides the common interface shared by ALL entity types across every
 * template family (characters, grid entities, towers, enemies, UI actors).
 *
 * Specialized families extend this with physics bodies, behavior managers,
 * health systems, and domain-specific hooks.
 */
export class BaseEntity extends Phaser.GameObjects.Sprite {
    /** Whether this entity is still active/alive */
    isAlive = true;
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
    }
    // ---------------------------------------------------------------------------
    // Lifecycle hooks — subclasses CAN override
    // ---------------------------------------------------------------------------
    /** Called every frame by the owning scene */
    onUpdate(_time, _delta) { }
    /** Called when this entity takes damage */
    onDamageTaken(_damage) { }
    /** Called when this entity dies */
    onDeath() {
        this.isAlive = false;
    }
    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------
    getIsAlive() {
        return this.isAlive;
    }
    /** Convenience: destroy with cleanup */
    destroyEntity() {
        this.isAlive = false;
        this.destroy();
    }
}
//# sourceMappingURL=BaseEntity.js.map