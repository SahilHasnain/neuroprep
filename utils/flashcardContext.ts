import type {
  DocumentContext,
  NoteContext,
  DoubtContext,
} from "@/types/flashcard";

/**
 * Validates document context structure
 */
export function validateDocumentContext(
  context: any
): context is DocumentContext {
  if (!context || typeof context !== "object") return false;

  return (
    typeof context.documentId === "string" &&
    context.documentId.length > 0 &&
    typeof context.documentTitle === "string" &&
    context.documentTitle.length > 0 &&
    typeof context.ocrText === "string" &&
    context.ocrText.length > 0
  );
}

/**
 * Validates note context structure
 */
export function validateNoteContext(context: any): context is NoteContext {
  if (!context || typeof context !== "object") return false;

  return (
    typeof context.noteId === "string" &&
    context.noteId.length > 0 &&
    typeof context.subject === "string" &&
    context.subject.length > 0 &&
    typeof context.topic === "string" &&
    context.topic.length > 0 &&
    typeof context.content === "string" &&
    context.content.length > 0
  );
}

/**
 * Validates doubt context structure
 */
export function validateDoubtContext(context: any): context is DoubtContext {
  if (!context || typeof context !== "object") return false;

  return (
    typeof context.doubtId === "string" &&
    context.doubtId.length > 0 &&
    typeof context.doubtText === "string" &&
    context.doubtText.length > 0 &&
    typeof context.resolution === "string" &&
    context.resolution.length > 0 &&
    typeof context.subject === "string" &&
    context.subject.length > 0 &&
    typeof context.topic === "string" &&
    context.topic.length > 0
  );
}

/**
 * Parses and validates context from route params
 */
export function parseContextFromParams(params: any): {
  documentContext?: DocumentContext;
  noteContext?: NoteContext;
  doubtContext?: DoubtContext;
} {
  const result: {
    documentContext?: DocumentContext;
    noteContext?: NoteContext;
    doubtContext?: DoubtContext;
  } = {};

  // Try to parse document context
  if (params.documentContext) {
    try {
      const parsed =
        typeof params.documentContext === "string"
          ? JSON.parse(params.documentContext)
          : params.documentContext;

      if (validateDocumentContext(parsed)) {
        result.documentContext = parsed;
      }
    } catch (error) {
      console.warn("Failed to parse document context:", error);
    }
  }

  // Try to parse note context
  if (params.noteContext) {
    try {
      const parsed =
        typeof params.noteContext === "string"
          ? JSON.parse(params.noteContext)
          : params.noteContext;

      if (validateNoteContext(parsed)) {
        result.noteContext = parsed;
      }
    } catch (error) {
      console.warn("Failed to parse note context:", error);
    }
  }

  // Try to parse doubt context
  if (params.doubtContext) {
    try {
      const parsed =
        typeof params.doubtContext === "string"
          ? JSON.parse(params.doubtContext)
          : params.doubtContext;

      if (validateDoubtContext(parsed)) {
        result.doubtContext = parsed;
      }
    } catch (error) {
      console.warn("Failed to parse doubt context:", error);
    }
  }

  return result;
}

/**
 * Checks if any context is present
 */
export function hasContext(params: any): boolean {
  if (!params || typeof params !== "object") return false;

  return !!(
    params.documentContext ||
    params.noteContext ||
    params.doubtContext
  );
}
