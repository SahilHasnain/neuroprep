import { router } from "expo-router";
import type { QuestionContext } from "@/lib/types";
import { validateQuestionContext } from "./contextValidation";

/**
 * Navigate to ask-doubt screen with question context
 */
export function navigateToAskDoubtWithQuestion(context: QuestionContext) {
  if (!validateQuestionContext(context)) {
    console.error("Invalid question context:", context);
    // Graceful degradation - navigate without context
    router.push("/ask-doubt");
    return;
  }

  try {
    router.push({
      pathname: "/ask-doubt",
      params: {
        questionContext: JSON.stringify(context),
      },
    });
  } catch (error) {
    console.error("Error navigating to ask-doubt:", error);
    // Fallback to simple navigation
    router.push("/ask-doubt");
  }
}
