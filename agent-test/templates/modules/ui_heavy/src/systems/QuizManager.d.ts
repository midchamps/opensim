/**
 * ============================================================================
 * QUIZ MANAGER - Question bank & validation system
 * ============================================================================
 *
 * Manages quiz/question functionality for educational games:
 * - Load questions from JSON or inline data
 * - Random question selection (with optional subject/difficulty filters)
 * - Answer validation
 * - Usage tracking (avoid repeats)
 * - Statistics (correct/wrong counts, accuracy)
 *
 * USAGE:
 *   const qm = new QuizManager();
 *   qm.loadQuestions(questionsArray);
 *   // or: qm.loadFromJSON(scene, 'questions');  // from cache
 *
 *   const q = qm.getRandomQuestion({ subject: 'math', difficulty: 2 });
 *   const correct = qm.checkAnswer(q, selectedIndex);
 *   const stats = qm.getStats();
 */
import Phaser from 'phaser';
import { type QuizQuestion } from '../scenes/BaseBattleScene';
export interface QuizFilter {
    /** Filter by subject */
    subject?: string;
    /** Filter by difficulty (exact) */
    difficulty?: number;
    /** Filter by max difficulty */
    maxDifficulty?: number;
    /** Exclude already-used questions */
    excludeUsed?: boolean;
}
export interface QuizStats {
    totalAsked: number;
    totalCorrect: number;
    totalWrong: number;
    accuracy: number;
    streakCurrent: number;
    streakBest: number;
}
export declare class QuizManager {
    private questions;
    private usedIndices;
    private stats;
    /** Load questions from an array. */
    loadQuestions(questions: QuizQuestion[]): void;
    /** Load questions from a cached JSON key. */
    loadFromJSON(scene: Phaser.Scene, cacheKey: string): void;
    /** Get a random question matching optional filters. */
    getRandomQuestion(filter?: QuizFilter): QuizQuestion | undefined;
    /** Get the total number of available questions matching optional filters. */
    getQuestionCount(filter?: QuizFilter): number;
    /** Check if the selected answer is correct. Updates stats. */
    checkAnswer(question: QuizQuestion, selectedIndex: number): boolean;
    /** Get quiz statistics. */
    getStats(): QuizStats;
    /** Reset usage tracking (allow questions to repeat). */
    resetUsed(): void;
    /** Reset all stats. */
    resetStats(): void;
}
