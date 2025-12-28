import type { QuestionContext, DoubtContext } from "@/lib/types";

/**
 * Validate question context before navigation
 */
export function validateQuestionContext(
  context: any
): context is QuestionContext {
  return (
    context &&
    typeof context.questionId === "string" &&
    typeof context.questionText === "string" &&
    Array.isArray(context.options) &&
    context.options.length > 0 &&
    typeof context.correctAnswer === "string" &&
    typeof context.subject === "string" &&
    typeof context.topic === "string" &&
    typeof context.difficulty === "string"
  );
}

/**
 * Validate doubt context before navigation
 */
export function validateDoubtContext(context: any): context is DoubtContext {
  return (
    context &&
    typeof context.doubtId === "string" &&
    typeof context.doubtText === "string" &&
    typeof context.subject === "string" &&
    typeof context.topic === "string"
  );
}
