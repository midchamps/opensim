/**
 * ============================================================================
 * CHOICE MANAGER - Branching choice logic with consequences
 * ============================================================================
 *
 * Manages player choices and their effects on game state.
 * Works with GameDataManager to apply effects and track history.
 * Works with DialogueManager to handle choice points in dialogue.
 *
 * EVENTS:
 *   - 'choicePresented': (choiceId, prompt, options[]) => void
 *   - 'choiceSelected': (choiceId, option, effects) => void
 *   - 'effectsApplied': (choiceId, effects) => void
 *
 * USAGE:
 *   const cm = new ChoiceManager(gameDataManager);
 *   cm.presentChoice('greeting', 'How do you respond?', [
 *     { text: 'Hello!', effects: { friendship: +1 } },
 *     { text: 'Go away.', effects: { friendship: -2, hostility: +1 } },
 *   ]);
 *   // When player selects:
 *   cm.selectOption('greeting', 0);  // applies effects to GameDataManager
 */
import Phaser from 'phaser';
import { type ChoiceOption } from '../scenes/BaseChapterScene';
import { type GameDataManager } from './GameDataManager';
export declare class ChoiceManager extends Phaser.Events.EventEmitter {
    private gameData;
    private activeChoices;
    constructor(gameData: GameDataManager);
    /**
     * Present a choice to the player.
     * Filters options by their condition (if any).
     */
    presentChoice(choiceId: string, prompt: string, options: ChoiceOption[]): ChoiceOption[];
    /**
     * Player selects an option.
     * Applies effects to GameDataManager and records in choice history.
     */
    selectOption(choiceId: string, optionIndex: number): ChoiceOption | undefined;
    /** Check if a choice is currently active (waiting for input). */
    isChoiceActive(choiceId: string): boolean;
    /** Check if ANY choice is currently active. */
    hasActiveChoice(): boolean;
}
