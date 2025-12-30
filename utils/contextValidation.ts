import type {
  QuestionContext,
  DoubtContext,
  NoteContext,
  QuestionToNoteContext,
  DoubtToNoteContext,
  DocumentContext,
} from "@/lib/types";

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

/**
 * Validate note context before navigation from notes to questions/doubts
 */
export function validateNoteContext(context: any): context is NoteContext {
  try {
    if (!context || typeof context !== "object") {
      console.error("Note context validation failed: Invalid context object");
      return false;
    }

    const required = ["noteId", "noteTitle", "subject", "topic", "noteLength"];
    for (const field of required) {
      if (!context[field] || typeof context[field] !== "string") {
        console.error(
          `Note context validation failed: Missing or invalid field '${field}'`
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Note context validation failed:", error);
    return false;
  }
}

/**
 * Validate question-to-note context before navigation from questions to notes
 */
export function validateQuestionToNoteContext(
  context: any
): context is QuestionToNoteContext {
  try {
    if (!context || typeof context !== "object") {
      console.error(
        "Question-to-note context validation failed: Invalid context object"
      );
      return false;
    }

    if (
      !context.subject ||
      typeof context.subject !== "string" ||
      !context.topic ||
      typeof context.topic !== "string" ||
      !context.difficulty ||
      typeof context.difficulty !== "string"
    ) {
      console.error(
        "Question-to-note context validation failed: Missing required fields (subject, topic, difficulty)"
      );
      return false;
    }

    // questionSetId is optional
    if (
      context.questionSetId !== undefined &&
      typeof context.questionSetId !== "string"
    ) {
      console.error(
        "Question-to-note context validation failed: Invalid questionSetId type"
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Question-to-note context validation failed:", error);
    return false;
  }
}

/**
 * Validate doubt-to-note context before navigation from doubts to notes
 */
export function validateDoubtToNoteContext(
  context: any
): context is DoubtToNoteContext {
  try {
    if (!context || typeof context !== "object") {
      console.error(
        "Doubt-to-note context validation failed: Invalid context object"
      );
      return false;
    }

    const required = ["doubtId", "doubtText", "subject", "topic"];
    for (const field of required) {
      if (!context[field] || typeof context[field] !== "string") {
        console.error(
          `Doubt-to-note context validation failed: Missing or invalid field '${field}'`
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Doubt-to-note context validation failed:", error);
    return false;
  }
}

/**
 * Validate document context before navigation from documents to questions/doubts/notes
 */
export function validateDocumentContext(
  context: any
): context is DocumentContext {
  try {
    if (!context || typeof context !== "object") {
      console.error(
        "Document context validation failed: Invalid context object"
      );
      return false;
    }

    const required = ["documentId", "documentTitle", "documentType"];
    for (const field of required) {
      if (!context[field] || typeof context[field] !== "string") {
        console.error(
          `Document context validation failed: Missing or invalid field '${field}'`
        );
        return false;
      }
    }

    // ocrText is optional but should be a string if present
    if (context.ocrText !== undefined && typeof context.ocrText !== "string") {
      console.error("Document context validation failed: Invalid ocrText type");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Document context validation failed:", error);
    return false;
  }
}
