import Phaser from 'phaser';
export interface GridEntityConfig {
    id: string;
    entityType: string;
    textureKey: string;
    gridX: number;
    gridY: number;
    displaySize?: number;
    isWalkable?: boolean;
    isPushable?: boolean;
    isDestructible?: boolean;
    maxHealth?: number;
}
export declare class BaseGridEntity extends Phaser.GameObjects.Sprite {
    private _gridX;
    private _gridY;
    private _entityType;
    private _entityId;
    private _isWalkable;
    private _isPushable;
    private _isDestructible;
    private _cellSize;
    private _gridOffsetX;
    private _gridOffsetY;
    private _facingDirection;
    private _health;
    private _maxHealth;
    constructor(scene: Phaser.Scene, config: GridEntityConfig);
    get gridX(): number;
    get gridY(): number;
    get entityType(): string;
    get entityId(): string;
    get isWalkable(): boolean;
    get isPushable(): boolean;
    get isDestructible(): boolean;
    get facingDirection(): 'up' | 'down' | 'left' | 'right';
    get health(): number;
    set health(value: number);
    get maxHealth(): number;
    get isAlive(): boolean;
    set facingDirection(dir: 'up' | 'down' | 'left' | 'right');
    /**
     * Deal damage to this entity. Clamps health to [0, maxHealth].
     * Calls onDamage() hook, then onDeath() if health reaches 0.
     * No-op if maxHealth is 0 (entity has no HP system).
     */
    takeDamage(amount: number): void;
    /**
     * Restore health. Clamps to maxHealth.
     */
    heal(amount: number): void;
    /**
     * Set the grid parameters so the entity can convert grid <-> world coords.
     * Called automatically by BaseGridScene.addEntity().
     */
    initGridParams(cellSize: number, offsetX: number, offsetY: number): void;
    /**
     * Scale the sprite to fit within a grid cell.
     * Called automatically by BaseGridScene.addEntity() if config.displaySize is set.
     */
    scaleToGrid(cellSize: number, padding?: number): void;
    /**
     * Set grid position and immediately sync the visual sprite to world coords.
     */
    setGridPosition(gridX: number, gridY: number): void;
    /**
     * Animate the sprite to a new grid position over time.
     * Does NOT update gridX/gridY -- the caller (BaseGridScene) handles data updates.
     * Returns a Promise that resolves when the animation completes.
     */
    animateToGridPosition(gridX: number, gridY: number, duration?: number, ease?: string): Promise<void>;
    /**
     * Sync the sprite's world position to match its current grid position.
     */
    syncWorldPosition(): void;
    private gridToWorldCenter;
    /**
     * Called when the entity is first added to the board.
     */
    onPlaced(): void;
    /**
     * Called after the entity's grid position changes.
     */
    onMoved(fromX: number, fromY: number): void;
    /**
     * Called when the entity is removed from the board.
     */
    onRemoved(): void;
    /**
     * Called when the entity is selected by the player.
     */
    onSelected(): void;
    /**
     * Called when the entity is deselected.
     */
    onDeselected(): void;
    /**
     * Called when the entity is interacted with (clicked, pushed, etc).
     */
    onInteraction(interactionType: string): void;
    /**
     * Called every game step/turn for entity-specific logic (AI, timers, cooldowns).
     * Receives the current turn number for cooldown tracking.
     */
    onStep(turnNumber: number): void;
    /**
     * Called when this entity takes damage.
     */
    onDamage(amount: number, oldHP: number, newHP: number): void;
    /**
     * Called when this entity's health reaches 0.
     */
    onDeath(): void;
    /**
     * Called when this entity enters a new cell (after move completes).
     * Useful for triggering tile effects on this entity.
     */
    onCellEntered(cellType: number): void;
    destroy(fromScene?: boolean): void;
}
