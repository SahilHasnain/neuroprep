import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  generateUniqueId,
  capitalizeFirstLetter,
  truncateText,
  getDifficultyLabel,
} from "../helpers";
import { tablesDB } from "@/lib/appwrite";
import { useAuthStore } from "@/store/authStore";
import { APPWRITE_CONFIG } from "@/config/appwrite";
import { ID, Query } from "react-native-appwrite";

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
 * Load all question sets from Storage (Hybrid: Cloud if logged in, Local if guest)
 */
export const loadQuestionsFromStorage = async (): Promise<
  StoredQuestionSet[]
> => {
  const { user } = useAuthStore.getState();

  if (user) {
    // ☁️ Cloud Load
    try {
      const response = await tablesDB.listRows({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.questionsTableId!,
        queries: [
          Query.equal("userId", user.$id),
          Query.orderDesc("createdAt"),
        ],
      });

      const questionSets: StoredQuestionSet[] = response.rows.map(
        (doc: any) => {
          const questions = JSON.parse(doc.questions);
          return {
            id: doc.$id,
            label: doc.label,
            subject: doc.subject,
            topic: doc.topic,
            difficulty: doc.difficulty,
            questionCount: questions.length,
            questions: questions,
            createdAt: doc.createdAt,
          };
        }
      );

      console.log(
        `☁️ Loaded ${questionSets.length} question sets from Appwrite`
      );
      return questionSets;
    } catch (err) {
      console.error("❌ Error loading questions from Appwrite:", err);
      return [];
    }
  } else {
    // 🏠 Local Load
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const questionSets: StoredQuestionSet[] = JSON.parse(stored);
        console.log(
          `🏠 Loaded ${questionSets.length} question sets from local storage`
        );
        return questionSets;
      }
      return [];
    } catch (err) {
      console.error("❌ Error loading questions from local storage:", err);
      return [];
    }
  }
};

/**
 * Save a new question set to Storage (Hybrid: Cloud if logged in, Local if guest)
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
  const { user } = useAuthStore.getState();
  const label = generateQuestionSetLabel(
    metadata.subject,
    metadata.topic,
    metadata.difficulty,
    metadata.questionCount
  );

  if (user) {
    // ☁️ Cloud Save
    try {
      await tablesDB.createRow({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.questionsTableId!,
        rowId: ID.unique(),
        data: {
          userId: user.$id,
          label: label,
          subject: metadata.subject,
          topic: metadata.topic,
          difficulty: metadata.difficulty,
          questions: JSON.stringify(newQuestions),
          createdAt: new Date().toISOString(),
        },
      });
      console.log(`☁️ Saved question set to Appwrite: ${label}`);
    } catch (err) {
      console.error("❌ Error saving questions to Appwrite:", err);
      throw err;
    }
  } else {
    // 🏠 Local Save
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const existingSets: StoredQuestionSet[] = stored
        ? JSON.parse(stored)
        : [];

      const uniqueId = generateUniqueId("qs");

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

      console.log(`🏠 Saved question set locally: ${label}`);
    } catch (err) {
      console.error("❌ Error saving questions to local storage:", err);
    }
  }
};

/**
 * Delete a question set by ID (Hybrid: Cloud if logged in, Local if guest)
 */
export const deleteQuestionFromStorage = async (id: string): Promise<void> => {
  const { user } = useAuthStore.getState();

  if (user) {
    // ☁️ Cloud Delete
    try {
      await tablesDB.deleteRow({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.questionsTableId!,
        rowId: id,
      });
      console.log(`☁️ Deleted question set from Appwrite: ${id}`);
    } catch (err) {
      console.error("❌ Error deleting question set from Appwrite:", err);
    }
  } else {
    // 🏠 Local Delete
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const questionSets: StoredQuestionSet[] = JSON.parse(stored);
        const updatedSets = questionSets.filter((set) => set.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
        console.log(`🏠 Deleted question set locally: ${id}`);
      }
    } catch (err) {
      console.error("❌ Error deleting question set from local storage:", err);
    }
  }
};
