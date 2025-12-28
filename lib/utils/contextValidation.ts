/**
 * Context Validation Utilities
 * Validates context objects passed between doubts and questions features
 */

import type { QuestionContext, DoubtContext } from "@/lib/types";

/**
 * Validates question context before navigation
 * @param context - The context object to validate
 * @returns true if context is valid QuestionContext
 */
export function validateQuestionContext(
  context: any
): context is QuestionContext {
  if (!context || typeof context !== "object") {
    return false;
  }

  return (
    typeof context.questionId === "string" &&
    context.questionId.length > 0 &&
    typeof context.questionText === "string" &&
    context.questionText.length > 0 &&
    Array.isArray(context.options) &&
    context.options.length > 0 &&
    context.options.every((opt) => typeof opt === "string") &&
    typeof context.correctAnswer === "string" &&
    context.correctAnswer.length > 0 &&
    typeof context.subject === "string" &&
    context.subject.length > 0 &&
    typeof context.topic === "string" &&
    context.topic.length > 0 &&
    typeof context.difficulty === "string" &&
    context.difficulty.length > 0 &&
    (context.explanation === undefined ||
      typeof context.explanation === "string")
  );
}

/**
 * Validates doubt context before navigation
 * @param context - The context object to validate
 * @returns true if context is valid DoubtContext
 */
export function validateDoubtContext(context: any): context is DoubtContext {
  if (!context || typeof context !== "object") {
    return false;
  }

  return (
    typeof context.doubtId === "string" &&
    context.doubtId.length > 0 &&
    typeof context.doubtText === "string" &&
    context.doubtText.length > 0 &&
    typeof context.subject === "string" &&
    context.subject.length > 0 &&
    typeof context.topic === "string" &&
    context.topic.length > 0 &&
    (context.difficulty === undefined || typeof context.difficulty === "string")
  );
}

/**
 * Validates context size to prevent excessive data transfer
 * @param context - The context object to validate
 * @returns true if context size is within limits (max 2KB)
 */
export function validateContextSize(context: any): boolean {
  try {
    const contextString = JSON.stringify(context);
    const sizeInBytes = new Blob([contextString]).size;
    return sizeInBytes <= 2048; // 2KB limit
  } catch {
    return false;
  }
}
