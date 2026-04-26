/**
 * ============================================================================
 * DIALOGUE MANAGER - Event-driven dialogue sequence engine
 * ============================================================================
 *
 * Controls the flow of dialogue sequences via EVENTS. This is a LOGIC-ONLY
 * system that emits events for UI components to listen to.
 *
 * NOTE: BaseChapterScene has a built-in dialogue engine with template-method
 * hooks. Use DialogueManager only if you need a STANDALONE, event-driven
 * dialogue system (e.g., dialogue inside a battle scene, or a custom scene
 * that does not extend BaseChapterScene).
 *
 * EVENTS (via Phaser.Events.EventEmitter):
 *   - 'showText': (speaker: string, text: string, expression?: string) => void
 *   - 'showChoice': (choiceId: string, prompt: string, options: ChoiceOption[]) => void
 *   - 'characterAction': (characterId: string, action: string, position?: string) => void
 *   - 'triggerEvent': (action: string, data?: Record<string, any>) => void
 *   - 'dialogueComplete': () => void
 *   - 'waitingForInput': () => void
 *
 * USAGE:
 *   const dm = new DialogueManager(scene);
 *   dm.loadDialogues(dialogueEntries);
 *   dm.on('showText', (speaker, text, expr) => dialogueBox.showText(speaker, text));
 *   dm.on('showChoice', (id, prompt, opts) => choicePanel.showChoices(prompt, opts));
 *   dm.on('characterAction', (id, action, pos) => portrait.handleAction(id, action, pos));
 *   dm.on('waitingForInput', () => { // show continue indicator });
 *   dm.start();
 *   // On player click/enter: dm.advance();
 *   // On choice selected: dm.selectChoice(optionIndex);
 */
import Phaser from 'phaser';
import { type DialogueEntry } from '../scenes/BaseChapterScene';
export declare class DialogueManager extends Phaser.Events.EventEmitter {
    private scene;
    private dialogues;
    private currentIndex;
    private isPlaying;
    private isWaitingForInput;
    private isChoiceActive;
    /** Guard: true while a delayed auto-advance is pending (character/wait entries). */
    private isAutoAdvancing;
    constructor(scene: Phaser.Scene);
    /** Load a sequence of dialogue entries (makes a shallow copy to avoid mutation of caller's array). */
    loadDialogues(dialogues: DialogueEntry[]): void;
    /** Start playing from the beginning or a specific index. */
    start(fromIndex?: number): void;
    /** Advance to the next entry (called on player click/enter). */
    advance(): void;
    /** Select a choice option (called when player clicks a choice). */
    selectChoice(optionIndex: number): void;
    /** Skip all remaining dialogue (for skip button). */
    skipAll(): void;
    isActive(): boolean;
    getCurrentEntry(): DialogueEntry | undefined;
    getProgress(): number;
    isWaiting(): boolean;
    private processEntry;
    private processTextEntry;
    private processChoiceEntry;
    private processEventEntry;
    private processCharacterEntry;
    private processBranchEntry;
    private processWaitEntry;
}
