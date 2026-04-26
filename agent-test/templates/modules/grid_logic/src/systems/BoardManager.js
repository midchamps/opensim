import Phaser from 'phaser';
export class BoardManager extends Phaser.Events.EventEmitter {
    _cells;
    _width;
    _height;
    _cellSize;
    _offsetX;
    _offsetY;
    _entities = new Map();
    _entityGrid = new Map();
    _undoStack = [];
    _maxUndoSteps;
    constructor(config, maxUndoSteps = 100) {
        super();
        this._width = config.cols;
        this._height = config.rows;
        this._cellSize = config.cellSize;
        this._offsetX = config.offsetX ?? 0;
        this._offsetY = config.offsetY ?? 0;
        this._maxUndoSteps = maxUndoSteps;
        this._cells = [];
        for (let y = 0; y < this._height; y++) {
            this._cells[y] = [];
            for (let x = 0; x < this._width; x++) {
                this._cells[y][x] = config.cells[y]?.[x] ?? 0;
            }
        }
    }
    // --------------------------------------------------------------------------
    // Properties
    // --------------------------------------------------------------------------
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get cellSize() {
        return this._cellSize;
    }
    get offsetX() {
        return this._offsetX;
    }
    get offsetY() {
        return this._offsetY;
    }
    get cells() {
        return this._cells;
    }
    // --------------------------------------------------------------------------
    // Cell State
    // --------------------------------------------------------------------------
    getCell(x, y) {
        if (!this.isInBounds(x, y))
            return -1;
        return this._cells[y][x];
    }
    setCell(x, y, value) {
        if (!this.isInBounds(x, y))
            return;
        const oldValue = this._cells[y][x];
        if (oldValue === value)
            return;
        this._cells[y][x] = value;
        this.emit('cellChanged', x, y, oldValue, value);
    }
    isInBounds(x, y) {
        return x >= 0 && x < this._width && y >= 0 && y < this._height;
    }
    /**
     * Fill the entire board with a single value.
     */
    fill(value) {
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                this._cells[y][x] = value;
            }
        }
        this.emit('boardReset');
    }
    // --------------------------------------------------------------------------
    // Entity Tracking
    // --------------------------------------------------------------------------
    entityGridKey(x, y) {
        return `${x},${y}`;
    }
    placeEntity(entity) {
        this._entities.set(entity.id, entity);
        const gk = this.entityGridKey(entity.gridX, entity.gridY);
        if (!this._entityGrid.has(gk)) {
            this._entityGrid.set(gk, []);
        }
        this._entityGrid.get(gk).push(entity.id);
        this.emit('entityPlaced', entity);
    }
    removeEntity(entityId) {
        const entity = this._entities.get(entityId);
        if (!entity)
            return;
        const gk = this.entityGridKey(entity.gridX, entity.gridY);
        const list = this._entityGrid.get(gk);
        if (list) {
            const idx = list.indexOf(entityId);
            if (idx !== -1)
                list.splice(idx, 1);
            if (list.length === 0)
                this._entityGrid.delete(gk);
        }
        this._entities.delete(entityId);
        this.emit('entityRemoved', entity);
    }
    moveEntity(entityId, toX, toY) {
        const entity = this._entities.get(entityId);
        if (!entity)
            return;
        const fromX = entity.gridX;
        const fromY = entity.gridY;
        const oldGk = this.entityGridKey(fromX, fromY);
        const oldList = this._entityGrid.get(oldGk);
        if (oldList) {
            const idx = oldList.indexOf(entityId);
            if (idx !== -1)
                oldList.splice(idx, 1);
            if (oldList.length === 0)
                this._entityGrid.delete(oldGk);
        }
        entity.gridX = toX;
        entity.gridY = toY;
        const newGk = this.entityGridKey(toX, toY);
        if (!this._entityGrid.has(newGk)) {
            this._entityGrid.set(newGk, []);
        }
        this._entityGrid.get(newGk).push(entityId);
        this.emit('entityMoved', entity, fromX, fromY, toX, toY);
    }
    getEntityAt(x, y) {
        const gk = this.entityGridKey(x, y);
        const list = this._entityGrid.get(gk);
        if (!list || list.length === 0)
            return null;
        return this._entities.get(list[0]) ?? null;
    }
    getAllEntitiesAt(x, y) {
        const gk = this.entityGridKey(x, y);
        const list = this._entityGrid.get(gk);
        if (!list)
            return [];
        return list.map((id) => this._entities.get(id)).filter(Boolean);
    }
    getEntitiesOfType(entityType) {
        const result = [];
        for (const entity of this._entities.values()) {
            if (entity.entityType === entityType) {
                result.push(entity);
            }
        }
        return result;
    }
    getEntityById(id) {
        return this._entities.get(id) ?? null;
    }
    getAllEntities() {
        return Array.from(this._entities.values());
    }
    // --------------------------------------------------------------------------
    // Undo / State History
    // --------------------------------------------------------------------------
    /**
     * Save the current board state to the undo stack.
     * Call BEFORE making changes that should be undoable.
     */
    pushState() {
        const snapshot = {
            cells: this._cells.map((row) => [...row]),
            entities: Array.from(this._entities.values()).map((e) => ({
                id: e.id,
                entityType: e.entityType,
                gridX: e.gridX,
                gridY: e.gridY,
            })),
        };
        this._undoStack.push(snapshot);
        if (this._undoStack.length > this._maxUndoSteps) {
            this._undoStack.shift();
        }
        this.emit('undoStackChanged', this._undoStack.length);
    }
    /**
     * Restore the previous board state from the undo stack.
     * Returns true if an undo was performed, false if the stack was empty.
     */
    popState() {
        const snapshot = this._undoStack.pop();
        if (!snapshot)
            return false;
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                this._cells[y][x] = snapshot.cells[y]?.[x] ?? 0;
            }
        }
        this._entities.clear();
        this._entityGrid.clear();
        for (const e of snapshot.entities) {
            this.placeEntity({ ...e });
        }
        this.emit('boardRestored');
        this.emit('undoStackChanged', this._undoStack.length);
        return true;
    }
    get canUndo() {
        return this._undoStack.length > 0;
    }
    get undoStackSize() {
        return this._undoStack.length;
    }
    clearHistory() {
        this._undoStack.length = 0;
        this.emit('undoStackChanged', 0);
    }
    // --------------------------------------------------------------------------
    // Serialization
    // --------------------------------------------------------------------------
    serialize() {
        return JSON.stringify({
            cells: this._cells,
            entities: Array.from(this._entities.values()).map((e) => ({
                id: e.id,
                entityType: e.entityType,
                gridX: e.gridX,
                gridY: e.gridY,
            })),
        });
    }
    deserialize(data) {
        const parsed = JSON.parse(data);
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                this._cells[y][x] = parsed.cells[y]?.[x] ?? 0;
            }
        }
        this._entities.clear();
        this._entityGrid.clear();
        for (const e of parsed.entities) {
            this.placeEntity({ ...e });
        }
        this.emit('boardRestored');
    }
    // --------------------------------------------------------------------------
    // Coordinate Conversion
    // --------------------------------------------------------------------------
    gridToWorld(gridX, gridY) {
        return {
            x: this._offsetX + gridX * this._cellSize + this._cellSize / 2,
            y: this._offsetY + gridY * this._cellSize + this._cellSize / 2,
        };
    }
    worldToGrid(worldX, worldY) {
        return {
            gridX: Math.floor((worldX - this._offsetX) / this._cellSize),
            gridY: Math.floor((worldY - this._offsetY) / this._cellSize),
        };
    }
    // --------------------------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------------------------
    destroy() {
        this._entities.clear();
        this._entityGrid.clear();
        this._undoStack.length = 0;
        this.removeAllListeners();
        super.destroy();
    }
}
//# sourceMappingURL=BoardManager.js.map