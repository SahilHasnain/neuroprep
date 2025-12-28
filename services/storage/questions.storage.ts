import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateUniqueId } from "@/utils/helpers";
import { questionsService } from "@/services/api/questions.service";
import { useAuthStore } from "@/store/authStore";
import type { Question, StoredQuestionSet, DoubtContext } from "@/lib/types";

const STORAGE_KEY = "@neuroprep_questions";

export const loadQuestionsFromStorage = async (): Promise<
  StoredQuestionSet[]
> => {
  const { user } = useAuthStore.getState();

  if (user) {
    try {
      const response = await questionsService.getHistory();
      return response.data || [];
    } catch (err) {
      console.error("❌ Error loading questions from backend:", err);
      return [];
    }
  }

  // Guest: Local storage
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (err) {
    console.error("❌ Error loading questions from local storage:", err);
    return [];
  }
};

export const saveQuestionsToStorage = async (
  newQuestions: Question[],
  metadata: {
    subject: string;
    topic: string;
    difficulty: string;
    questionCount: number;
    doubtContext?: DoubtContext;
  }
): Promise<void> => {
  const { user } = useAuthStore.getState();

  // Logged-in users: Backend already saved, skip frontend save
  if (user) {
    console.log("☁️ Questions already saved by backend");
    return;
  }

  // Guest: Local save
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const existingSets: StoredQuestionSet[] = stored ? JSON.parse(stored) : [];

    const uniqueId = generateUniqueId("qs");
    const label = `${metadata.subject} - ${metadata.topic} (${metadata.difficulty}) - ${metadata.questionCount} Qs`;

    const newSet: StoredQuestionSet = {
      id: uniqueId,
      label: label,
      subject: metadata.subject,
      topic: metadata.topic,
      difficulty: metadata.difficulty,
      questionCount: metadata.questionCount,
      questions: newQuestions,
      createdAt: new Date().toISOString(),
      // Store doubt reference if provided
      doubtContext: metadata.doubtContext
        ? {
            doubtId: metadata.doubtContext.doubtId,
            doubtText: metadata.doubtContext.doubtText,
          }
        : undefined,
    };

    const updatedSets = [newSet, ...existingSets].slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
    console.log("🏠 Saved questions locally");
  } catch (err) {
    console.error("❌ Error saving questions to local storage:", err);
  }
};

export const deleteQuestionFromStorage = async (id: string): Promise<void> => {
  const { user } = useAuthStore.getState();

  if (user) {
    console.log("⚠️ Delete via backend not implemented yet");
    return;
  }

  // Guest: Local delete
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const questionSets: StoredQuestionSet[] = JSON.parse(stored);
      const updatedSets = questionSets.filter((set) => set.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
      console.log("🏠 Deleted questions locally");
    }
  } catch (err) {
    console.error("❌ Error deleting questions from local storage:", err);
  }
};
