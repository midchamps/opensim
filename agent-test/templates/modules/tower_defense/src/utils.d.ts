import Phaser from 'phaser';
export declare enum CellType {
    BUILDABLE = 0,
    PATH = 1,
    BLOCKED = 2,
    SPAWN = 3,
    EXIT = 4
}
export declare const resetOriginAndOffset: (sprite: any, facingDirection: "left" | "right" | "up" | "down") => void;
export declare const safeAddSound: (scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig) => Phaser.Sound.BaseSound | undefined;
export declare const audioExists: (scene: Phaser.Scene, key: string) => boolean;
export declare const textureExists: (scene: Phaser.Scene, key: string) => boolean;
export declare const initScale: (sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, origin: {
    x: number;
    y: number;
}, maxDisplayWidth?: number, maxDisplayHeight?: number, bodyWidthFactorToDisplayWidth?: number, bodyHeightFactorToDisplayHeight?: number) => void;
export declare const addCollider: (scene: Phaser.Scene, object1: Phaser.Types.Physics.Arcade.ArcadeColliderType, object2: Phaser.Types.Physics.Arcade.ArcadeColliderType, collideCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, callbackContext?: any) => Phaser.Physics.Arcade.Collider;
export declare const addOverlap: (scene: Phaser.Scene, object1: Phaser.Types.Physics.Arcade.ArcadeColliderType, object2: Phaser.Types.Physics.Arcade.ArcadeColliderType, collideCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, callbackContext?: any) => Phaser.Physics.Arcade.Collider;
export declare const initUIDom: (scene: Phaser.Scene, html: string) => Phaser.GameObjects.DOMElement;
export declare const createDecoration: (scene: Phaser.Scene, group: Phaser.GameObjects.Group, key: string, x: number, y: number, maxDisplayHeight: number) => Phaser.GameObjects.Image;
/**
 * Convert grid coordinates to world (pixel) coordinates.
 * Returns the CENTER of the cell.
 */
export declare function gridToWorld(gridX: number, gridY: number, cellSize: number, offsetX?: number, offsetY?: number): {
    x: number;
    y: number;
};
/**
 * Convert world (pixel) coordinates to grid coordinates.
 * Returns the grid cell that contains the point.
 */
export declare function worldToGrid(worldX: number, worldY: number, cellSize: number, offsetX?: number, offsetY?: number): {
    gridX: number;
    gridY: number;
};
/**
 * Check if a grid cell is valid for tower placement.
 */
export declare function isValidPlacement(cells: CellType[][], gridX: number, gridY: number): boolean;
export interface WorldPoint {
    x: number;
    y: number;
}
/**
 * Calculate total pixel length of a waypoint path.
 */
export declare function getPathLength(waypoints: WorldPoint[]): number;
/**
 * Get an interpolated position along a waypoint path.
 * @param progress - 0 = start, 1 = end
 */
export declare function getPositionAlongPath(waypoints: WorldPoint[], progress: number): WorldPoint;
/**
 * Get a facing direction between two world points.
 */
export declare function getDirectionBetween(from: WorldPoint, to: WorldPoint): 'left' | 'right' | 'up' | 'down';
/**
 * Create a semi-transparent range circle for tower placement preview / selection.
 */
export declare function createRangeIndicator(scene: Phaser.Scene, x: number, y: number, range: number, color?: number, alpha?: number): Phaser.GameObjects.Graphics;
export declare const PROJECTILE_SIZES: {
    readonly BULLET_SMALL: 28;
    readonly BULLET_MEDIUM: 36;
    readonly ARROW: 52;
    readonly CANNONBALL: 60;
    readonly LARGE: 76;
};
export declare function createBulletTextures(scene: Phaser.Scene): void;
export declare function createProjectile(scene: Phaser.Scene, x: number, y: number, textureKey: string, targetSize?: number, damage?: number): Phaser.Physics.Arcade.Sprite;
/**
 * Create a homing projectile that moves toward a target.
 * Sets velocity directly toward the target position.
 */
export declare function launchProjectileAt(projectile: Phaser.Physics.Arcade.Sprite, targetX: number, targetY: number, speed: number): void;
/**
 * Draw a debug/gameplay grid overlay showing cell types.
 * Returns the Graphics object for later destruction.
 */
export declare function drawGridOverlay(scene: Phaser.Scene, cells: CellType[][], cellSize: number, offsetX?: number, offsetY?: number, alpha?: number): Phaser.GameObjects.Graphics;
/**
 * Draw a semi-transparent path line connecting waypoints.
 * Use in createEnvironment() to show the enemy route on top of the background.
 * Unlike drawGridOverlay (debug-only), this is intended for production gameplay.
 */
export declare function drawPathLine(scene: Phaser.Scene, waypoints: WorldPoint[], lineWidth?: number, color?: number, alpha?: number, depth?: number): Phaser.GameObjects.Graphics;
/**
 * Draw tower slot visuals on BUILDABLE cells.
 * When textureKey exists, renders the image in each cell.
 * Otherwise draws a subtle rounded-rect placeholder.
 * Slots start HIDDEN by default; BaseTDScene shows them during placement mode.
 * Call in createEnvironment() and assign to this.towerSlotGroup.
 */
export declare function drawTowerSlots(scene: Phaser.Scene, cells: CellType[][], cellSize: number, offsetX?: number, offsetY?: number, textureKey?: string, depth?: number, startVisible?: boolean): Phaser.GameObjects.Group;
/**
 * Draw subtle markers on all BUILDABLE cells so players know where towers can go.
 * Renders a dashed border and a small center dot on each buildable cell.
 */
export declare function drawBuildableMarkers(scene: Phaser.Scene, cells: CellType[][], cellSize: number, offsetX?: number, offsetY?: number, color?: number, alpha?: number, depth?: number): Phaser.GameObjects.Graphics;
/**
 * Show a floating text that rises and fades out.
 * Useful for kill rewards, damage numbers, or status messages.
 */
export declare function showFloatingText(scene: Phaser.Scene, x: number, y: number, text: string, color?: string, fontSize?: number, duration?: number, riseDistance?: number): void;
