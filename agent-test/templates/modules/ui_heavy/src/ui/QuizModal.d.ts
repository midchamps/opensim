/**
 * ============================================================================
 * QUIZ MODAL - Quiz question popup dialog
 * ============================================================================
 *
 * Extends ModalOverlay to display quiz questions with:
 * - Question text
 * - Multiple choice answer buttons
 * - Correct/wrong visual feedback
 * - Explanation panel (for educational games)
 *
 * EVENTS:
 *   - 'answered': (correct: boolean, selectedIndex: number) => void
 *   - 'feedbackDismissed': () => void
 *
 * USAGE:
 *   const quiz = new QuizModal(scene);
 *   quiz.showQuestion({
 *     question: 'What is 2+2?',
 *     options: ['3', '4', '5', '6'],
 *     correctIndex: 1,
 *     explanation: '2+2=4',
 *   });
 *   quiz.on('answered', (correct, index) => { ... });
 */
import Phaser from 'phaser';
import { ModalOverlay, type ModalConfig } from './ModalOverlay';
import { type QuizQuestion } from '../scenes/BaseBattleScene';
export interface QuizModalConfig extends ModalConfig {
    /** Time limit in seconds (0 = no limit, default: 0) */
    timeLimit?: number;
    /** Show explanation after answering (default: true) */
    showExplanation?: boolean;
    /** Question text style */
    questionStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    /** Answer button style */
    answerStyle?: Phaser.Types.GameObjects.Text.TextStyle;
}
export declare class QuizModal extends ModalOverlay {
    private quizConfig;
    private currentQuestion?;
    private questionText?;
    private answerButtons;
    private explanationText?;
    private feedbackText?;
    private continueText?;
    private answered;
    private pendingDismissHandler?;
    private pendingDismissEnterKey?;
    constructor(scene: Phaser.Scene, config?: QuizModalConfig);
    /** Show a quiz question in the modal. */
    showQuestion(question: QuizQuestion): void;
    /** Show the explanation panel (after answering). */
    showExplanation(question: QuizQuestion, wasCorrect: boolean): void;
    /** Remove any pending dismiss event handlers to prevent leaks. */
    private cleanupDismissHandlers;
    private createQuestionUI;
    private createAnswerButton;
    private onAnswerSelected;
    private clearQuizContent;
}
