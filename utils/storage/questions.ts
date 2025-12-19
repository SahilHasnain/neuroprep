import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  generateUniqueId,
  capitalizeFirstLetter,
  truncateText,
  getDifficultyLabel,
} from "../helpers";

export interface Question {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
}

export interface StoredQuestionSet {
  id: string;
  label: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  questions: Question[];
  createdAt: string;
}

const STORAGE_KEY = "@neuroprep_questions";

/**
 * Generate a clear, human-readable label for a question set
 * Format: "Physics - Newton's Laws (Medium) - 10 Qs"
 */
export const generateQuestionSetLabel = (
  subject: string,
  topic: string,
  difficulty: string,
  count: number
): string => {
  const capitalizedSubject = capitalizeFirstLetter(subject);
  const capitalizedDifficulty = getDifficultyLabel(difficulty);
  const truncatedTopic = truncateText(topic, 20);

  return `${capitalizedSubject} - ${truncatedTopic} (${capitalizedDifficulty}) - ${count} Qs`;
};

/**
 * Load all question sets from AsyncStorage
 */
export const loadQuestionsFromStorage = async (): Promise<
  StoredQuestionSet[]
> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const questionSets: StoredQuestionSet[] = JSON.parse(stored);
      console.log(
        `📚 Loaded ${questionSets.length} question sets from storage`
      );
      return questionSets;
    }
    return [];
  } catch (err) {
    console.error("❌ Error loading questions from storage:", err);
    return [];
  }
};

/**
 * Save a new question set to AsyncStorage
 * Keeps only the last 10 sets to prevent storage bloat
 */
export const saveQuestionsToStorage = async (
  newQuestions: Question[],
  metadata: {
    subject: string;
    topic: string;
    difficulty: string;
    questionCount: number;
  }
): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const existingSets: StoredQuestionSet[] = stored ? JSON.parse(stored) : [];

    const uniqueId = generateUniqueId("qs");
    const label = generateQuestionSetLabel(
      metadata.subject,
      metadata.topic,
      metadata.difficulty,
      metadata.questionCount
    );

    const newSet: StoredQuestionSet = {
      id: uniqueId,
      label: label,
      subject: metadata.subject,
      topic: metadata.topic,
      difficulty: metadata.difficulty,
      questionCount: metadata.questionCount,
      questions: newQuestions,
      createdAt: new Date().toISOString(),
    };

    // Keep only last 10 question sets
    const updatedSets = [newSet, ...existingSets].slice(0, 10);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));

    console.log(`✅ Saved question set: ${label}`);
  } catch (err) {
    console.error("❌ Error saving questions to storage:", err);
  }
};

/**
 * Delete a question set by ID
 */
export const deleteQuestionFromStorage = async (id: string): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const questionSets: StoredQuestionSet[] = JSON.parse(stored);
      const filtered = questionSets.filter((set) => set.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log(`🗑️ Deleted question set: ${id}`);
    }
  } catch (err) {
    console.error("❌ Error deleting question set:", err);
  }
};
