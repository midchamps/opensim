import Phaser from 'phaser';
/**
 * BaseGameScene — Meta Template M0 Extension
 *
 * Minimal, game-agnostic scene base class.
 * Provides the Template Method skeleton and lifecycle hooks shared by
 * ALL specialized template families (platformer, top_down, grid_logic,
 * tower_defense, ui_heavy) without assuming any physics regime, entity
 * model, or gameplay mechanic.
 *
 * Specialized families extend this with physics-specific world setup,
 * entity management, and domain hooks.
 */
export class BaseGameScene extends Phaser.Scene {
    /** Prevents duplicate completion triggers */
    gameCompleted = false;
    // ---------------------------------------------------------------------------
    // Lifecycle hooks — subclasses CAN override (no-op by default)
    // ---------------------------------------------------------------------------
    /** Called before any creation logic runs */
    onPreCreate() { }
    /** Called after all creation logic completes */
    onPostCreate() { }
    /** Called at the start of every update frame */
    onPreUpdate(_time, _delta) { }
    /** Called at the end of every update frame */
    onPostUpdate(_time, _delta) { }
    // ---------------------------------------------------------------------------
    // Template Method — fixed skeleton
    // ---------------------------------------------------------------------------
    create() {
        this.gameCompleted = false;
        this.onPreCreate();
        this.setupWorld();
        this.createEntities();
        this.scene.launch('UIScene', { gameSceneKey: this.scene.key });
        this.onPostCreate();
    }
    update(time, delta) {
        if (this.gameCompleted)
            return;
        this.onPreUpdate(time, delta);
        this.onPostUpdate(time, delta);
    }
    // ---------------------------------------------------------------------------
    // Shared utilities
    // ---------------------------------------------------------------------------
    /** Mark the level as complete and transition to victory */
    onLevelComplete() {
        if (this.gameCompleted)
            return;
        this.gameCompleted = true;
        this.scene.stop('UIScene');
        this.scene.launch('VictoryUIScene', { gameSceneKey: this.scene.key });
    }
    /** Mark the level as failed and transition to game-over */
    onGameOver() {
        if (this.gameCompleted)
            return;
        this.gameCompleted = true;
        this.scene.stop('UIScene');
        this.scene.launch('GameOverUIScene', { currentLevelKey: this.scene.key });
    }
}
//# sourceMappingURL=BaseGameScene.js.map