import Phaser from 'phaser';
import { scaleToCell, textureExists } from '../utils';
export class BaseGridEntity extends Phaser.GameObjects.Sprite {
    _gridX;
    _gridY;
    _entityType;
    _entityId;
    _isWalkable;
    _isPushable;
    _isDestructible;
    _cellSize = 64;
    _gridOffsetX = 0;
    _gridOffsetY = 0;
    _facingDirection = 'down';
    _health;
    _maxHealth;
    constructor(scene, config) {
        const key = textureExists(scene, config.textureKey)
            ? config.textureKey
            : '__DEFAULT';
        super(scene, 0, 0, key);
        this._entityId = config.id;
        this._entityType = config.entityType;
        this._gridX = config.gridX;
        this._gridY = config.gridY;
        this._isWalkable = config.isWalkable ?? false;
        this._isPushable = config.isPushable ?? false;
        this._isDestructible = config.isDestructible ?? false;
        this._maxHealth = config.maxHealth ?? 0;
        this._health = this._maxHealth;
        if (key === '__DEFAULT') {
            this.setVisible(false);
        }
        scene.add.existing(this);
        this.setDepth(10);
    }
    // --------------------------------------------------------------------------
    // Properties
    // --------------------------------------------------------------------------
    get gridX() {
        return this._gridX;
    }
    get gridY() {
        return this._gridY;
    }
    get entityType() {
        return this._entityType;
    }
    get entityId() {
        return this._entityId;
    }
    get isWalkable() {
        return this._isWalkable;
    }
    get isPushable() {
        return this._isPushable;
    }
    get isDestructible() {
        return this._isDestructible;
    }
    get facingDirection() {
        return this._facingDirection;
    }
    get health() {
        return this._health;
    }
    set health(value) {
        this._health = Math.max(0, Math.min(this._maxHealth, value));
    }
    get maxHealth() {
        return this._maxHealth;
    }
    get isAlive() {
        return this._maxHealth <= 0 || this._health > 0;
    }
    set facingDirection(dir) {
        this._facingDirection = dir;
    }
    // --------------------------------------------------------------------------
    // Health / Combat
    // --------------------------------------------------------------------------
    /**
     * Deal damage to this entity. Clamps health to [0, maxHealth].
     * Calls onDamage() hook, then onDeath() if health reaches 0.
     * No-op if maxHealth is 0 (entity has no HP system).
     */
    takeDamage(amount) {
        if (this._maxHealth <= 0)
            return;
        const oldHP = this._health;
        this._health = Math.max(0, this._health - amount);
        this.onDamage(amount, oldHP, this._health);
        if (this._health <= 0 && oldHP > 0) {
            this.onDeath();
        }
    }
    /**
     * Restore health. Clamps to maxHealth.
     */
    heal(amount) {
        if (this._maxHealth <= 0)
            return;
        this._health = Math.min(this._maxHealth, this._health + amount);
    }
    // --------------------------------------------------------------------------
    // Grid Configuration (called by BaseGridScene after creation)
    // --------------------------------------------------------------------------
    /**
     * Set the grid parameters so the entity can convert grid <-> world coords.
     * Called automatically by BaseGridScene.addEntity().
     */
    initGridParams(cellSize, offsetX, offsetY) {
        this._cellSize = cellSize;
        this._gridOffsetX = offsetX;
        this._gridOffsetY = offsetY;
        this.syncWorldPosition();
    }
    /**
     * Scale the sprite to fit within a grid cell.
     * Called automatically by BaseGridScene.addEntity() if config.displaySize is set.
     */
    scaleToGrid(cellSize, padding) {
        scaleToCell(this, cellSize, padding);
    }
    // --------------------------------------------------------------------------
    // Position Management
    // --------------------------------------------------------------------------
    /**
     * Set grid position and immediately sync the visual sprite to world coords.
     */
    setGridPosition(gridX, gridY) {
        const fromX = this._gridX;
        const fromY = this._gridY;
        this._gridX = gridX;
        this._gridY = gridY;
        this.syncWorldPosition();
        this.onMoved(fromX, fromY);
    }
    /**
     * Animate the sprite to a new grid position over time.
     * Does NOT update gridX/gridY -- the caller (BaseGridScene) handles data updates.
     * Returns a Promise that resolves when the animation completes.
     */
    animateToGridPosition(gridX, gridY, duration = 200, ease = 'Power2') {
        const worldPos = this.gridToWorldCenter(gridX, gridY);
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                x: worldPos.x,
                y: worldPos.y,
                duration,
                ease,
                onComplete: () => {
                    const fromX = this._gridX;
                    const fromY = this._gridY;
                    this._gridX = gridX;
                    this._gridY = gridY;
                    resolve();
                    this.onMoved(fromX, fromY);
                },
            });
        });
    }
    /**
     * Sync the sprite's world position to match its current grid position.
     */
    syncWorldPosition() {
        const worldPos = this.gridToWorldCenter(this._gridX, this._gridY);
        this.setPosition(worldPos.x, worldPos.y);
    }
    gridToWorldCenter(gx, gy) {
        return {
            x: this._gridOffsetX + gx * this._cellSize + this._cellSize / 2,
            y: this._gridOffsetY + gy * this._cellSize + this._cellSize / 2,
        };
    }
    // --------------------------------------------------------------------------
    // Hooks (override in subclasses)
    // --------------------------------------------------------------------------
    /**
     * Called when the entity is first added to the board.
     */
    onPlaced() { }
    /**
     * Called after the entity's grid position changes.
     */
    onMoved(fromX, fromY) { }
    /**
     * Called when the entity is removed from the board.
     */
    onRemoved() { }
    /**
     * Called when the entity is selected by the player.
     */
    onSelected() { }
    /**
     * Called when the entity is deselected.
     */
    onDeselected() { }
    /**
     * Called when the entity is interacted with (clicked, pushed, etc).
     */
    onInteraction(interactionType) { }
    /**
     * Called every game step/turn for entity-specific logic (AI, timers, cooldowns).
     * Receives the current turn number for cooldown tracking.
     */
    onStep(turnNumber) { }
    /**
     * Called when this entity takes damage.
     */
    onDamage(amount, oldHP, newHP) { }
    /**
     * Called when this entity's health reaches 0.
     */
    onDeath() { }
    /**
     * Called when this entity enters a new cell (after move completes).
     * Useful for triggering tile effects on this entity.
     */
    onCellEntered(cellType) { }
    // --------------------------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------------------------
    destroy(fromScene) {
        this.onRemoved();
        super.destroy(fromScene);
    }
}
//# sourceMappingURL=BaseGridEntity.js.map