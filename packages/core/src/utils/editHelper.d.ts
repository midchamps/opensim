/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export interface NormalizedEditStrings {
    oldString: string;
    newString: string;
}
/**
 * Runs the core normalization pipeline:
 *   1. Strip trailing whitespace copied from numbered output.
 *   2. Attempt to find the literal text inside {@link fileContent}.
 *   3. If found through a relaxed match (smart quotes, line trims, etc.),
 *      return the canonical slice from disk so later replacements operate on
 *      exact bytes.
 */
export declare function normalizeEditStrings(fileContent: string | null, oldString: string, newString: string): NormalizedEditStrings;
/**
 * When deleting text and the on-disk content contains the same substring with a
 * trailing newline, automatically consume that newline so the removal does not
 * leave a blank line behind.
 */
export declare function maybeAugmentOldStringForDeletion(fileContent: string | null, oldString: string, newString: string): string;
/**
 * Counts the number of non-overlapping occurrences of {@link substr} inside
 * {@link source}. Returns 0 when the substring is empty.
 */
export declare function countOccurrences(source: string, substr: string): number;
/**
 * Result from extracting a snippet showing the edited region.
 */
export interface EditSnippetResult {
    /** Starting line number (1-indexed) of the snippet */
    startLine: number;
    /** Ending line number (1-indexed) of the snippet */
    endLine: number;
    /** Total number of lines in the new content */
    totalLines: number;
    /** The snippet content (subset of lines from newContent) */
    content: string;
}
/**
 * Extracts a snippet from the edited file showing the changed region with
 * surrounding context. This compares the old and new content line-by-line
 * from both ends to locate the changed region.
 *
 * @param oldContent The original file content before the edit (null for new files)
 * @param newContent The new file content after the edit
 * @param contextLines Number of context lines to show before and after the change
 * @returns Snippet information, or null if no meaningful snippet can be extracted
 */
export declare function extractEditSnippet(oldContent: string | null, newContent: string): EditSnippetResult | null;
