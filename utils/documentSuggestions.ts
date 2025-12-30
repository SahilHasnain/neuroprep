/**
 * Document AI Suggestion Logic
 * Determines what AI action to suggest based on document context
 */

export interface DocumentSuggestion {
  text: string;
  action: "generate-questions" | "ask-doubt" | "create-notes";
  description: string;
}

export function getDocumentSuggestion(
  hasGeneratedQuestions: boolean = false,
  hasCreatedNotes: boolean = false
): DocumentSuggestion {
  // Priority order: Questions -> Doubts -> Notes
  if (!hasGeneratedQuestions) {
    return {
      text: "Generate questions from this document",
      action: "generate-questions",
      description: "Create practice questions based on the content",
    };
  }

  if (!hasCreatedNotes) {
    return {
      text: "Create notes from this document",
      action: "create-notes",
      description: "Generate structured notes from the content",
    };
  }

  // Default to ask doubt if everything else is done
  return {
    text: "Ask a doubt about this document",
    action: "ask-doubt",
    description: "Get AI help with questions about the content",
  };
}
