/**
 * ============================================================================
 * TEMPLATE: Chapter Scene (Narrative/Dialogue)
 * ============================================================================
 *
 * INSTRUCTIONS FOR AGENT:
 * 1. Copy this file and rename (e.g., Chapter1Scene.ts, IntroScene.ts)
 * 2. Rename the class
 * 3. Define dialogue content in initializeDialogues()
 * 4. Register characters in createCharacters()
 * 5. Override hooks as needed for custom behavior
 *
 * CRITICAL RULES:
 * - initializeDialogues() is REQUIRED - must return dialogue entries
 * - Use registerCharacter() in createCharacters() for each character
 * - Do NOT override create() - base class handles the full lifecycle
 * - Background/music keys must match asset-pack.json
 * - All interface/type imports MUST use "type" keyword
 * - Config access: import gameConfig from '../gameConfig.json';
 *   const gameplayConfig = gameConfig.gameplayConfig ?? {};
 *   then use gameplayConfig.textSpeed.value (use .value accessor)
 *
 * DEFAULT BEHAVIOR (provided by base class, can be overridden):
 * - createDialogueUI(): Creates DialogueBox + ChoicePanel
 * - setupDefaultInputs(): Click/Enter/Space to advance dialogue
 * - showDialogueText(): Shows text in DialogueBox with typewriter effect
 * - showChoiceUI(): Shows choice buttons via ChoicePanel
 * - handleCharacterEnter(): Creates CharacterPortrait with slide-in animation
 * - handleCharacterExit(): Slides CharacterPortrait out
 * - handleDialogueInput(): Delegates to DialogueBox for skip/advance
 * - getDialogueBoxConfig(): Returns style config for default DialogueBox
 *
 * CUSTOMIZATION:
 * - To change dialogue box appearance: override getDialogueBoxConfig()
 * - To use speech bubbles instead: override createDialogueUI() + showDialogueText()
 * - To use a custom choice UI: override showChoiceUI(), call resolveChoice(index)
 * - To change input scheme: override setupDefaultInputs()
 * - To change character display: override handleCharacterEnter/Exit()
 *
 * FILE CHECKLIST (complete AFTER implementing this scene):
 *   [ ] main.ts — import { YourScene } from './scenes/YourScene';
 *   [ ] main.ts — game.scene.add("YourSceneKey", YourScene);
 *   [ ] LevelManager.ts — add "YourSceneKey" to LEVEL_ORDER
 *   [ ] asset-pack.json — all texture/audio keys used here must be registered
 *   [ ] gameConfig.json — merge custom gameplay values (keep screenSize/debugConfig)
 *   [ ] TitleScreen.ts — update game title text
 * ============================================================================
 */
import { BaseChapterScene, type DialogueEntry, type ChoiceOption } from './BaseChapterScene';
export declare class _TemplateChapter extends BaseChapterScene {
    constructor();
    protected initializeDialogues(): DialogueEntry[];
    protected createBackground(): void;
    protected createCharacters(): void;
    protected getBackgroundMusicKey(): string | undefined;
    /**
     * OPTIONAL: Gameplay hints displayed in top-right corner.
     * Return [] to hide the panel entirely.
     */
    protected getGameplayHints(): string[];
    protected onDialogueEvent(action: string, data?: Record<string, any>): void;
    protected onChoiceMade(choiceId: string, option: ChoiceOption): void;
    protected onChapterComplete(): void;
}
