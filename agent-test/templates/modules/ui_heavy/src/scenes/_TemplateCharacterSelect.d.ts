/**
 * ============================================================================
 * TEMPLATE: Character Selection Scene
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename (e.g., HeroSelectScene.ts)
 * 2. Rename the class and constructor scene key
 * 3. Implement getSelectableCharacters() with your game's characters
 * 4. Set getNextSceneKey() to your first game scene
 * 5. Override hooks as needed for custom UI
 *
 * CRITICAL RULES:
 * - This extends BaseCharacterSelectScene. All hooks are available.
 * - Override getSelectableCharacters() (REQUIRED).
 * - Override getNextSceneKey() to navigate to your battle/chapter scene.
 * - For PVP (2 players pick sequentially):
 *     Override shouldAutoTransition() to return false.
 *     Track P1/P2 picks manually, then call triggerTransition().
 *
 * REGISTRY:
 * - On confirm, base class stores: registry.set('selectedCharacter', character)
 * - Retrieve in battle scene: this.registry.get('selectedCharacter')
 * - For PVP, store per-player:
 *     this.registry.set('p1Character', character)
 *     this.registry.set('p2Character', character)
 *
 * TYPE IMPORTS:
 *   All interfaces/types MUST use the "type" keyword:
 *     import { BaseCharacterSelectScene, type SelectableCharacter } from './BaseCharacterSelectScene';
 *
 * FILE CHECKLIST (complete AFTER implementing this scene):
 *   [ ] main.ts — import and register this scene with game.scene.add()
 *   [ ] LevelManager.ts — add scene key to LEVEL_ORDER
 *   [ ] asset-pack.json — register ALL character portrait/expression texture keys
 *   [ ] gameConfig.json — merge characterSelectConfig values if customizing grid
 * ============================================================================
 */
import { BaseCharacterSelectScene, type SelectableCharacter } from './BaseCharacterSelectScene';
export declare class _TemplateCharacterSelect extends BaseCharacterSelectScene {
    constructor();
    protected getSelectableCharacters(): SelectableCharacter[];
    protected getNextSceneKey(): string;
    protected createBackground(): void;
    protected createTitle(): void;
    protected getBackgroundMusicKey(): string | undefined;
    protected createCustomUI(): void;
    protected onCharacterSelected(character: SelectableCharacter): void;
}
