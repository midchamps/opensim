import { BaseGridEntity, type GridEntityConfig } from './BaseGridEntity';
declare const TEMPLATE_ENTITY_CONFIG: GridEntityConfig;
export declare class TemplateEntity extends BaseGridEntity {
    constructor(scene: Phaser.Scene, gridX: number, gridY: number, id?: string);
    onPlaced(): void;
    onMoved(fromX: number, fromY: number): void;
    onSelected(): void;
    onDeselected(): void;
    onInteraction(interactionType: string): void;
    /**
     * Called every game step/turn. Use for AI, cooldowns, periodic effects.
     * @param turnNumber Current turn number, useful for cooldown math.
     */
    onStep(turnNumber: number): void;
    onDamage(amount: number, oldHP: number, newHP: number): void;
    onDeath(): void;
    onCellEntered(cellType: number): void;
}
export { TEMPLATE_ENTITY_CONFIG };
