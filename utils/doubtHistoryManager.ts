import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "guestDoubtHistory";
const MAX_HISTORY_SIZE = 3;

export interface DoubtHistoryEntry {
  id: string;
  doubtText: string;
  subject: string;
  topic: string;
  aiAnswer: {
    explanation: string[];
    intuition: string;
    revisionTip: string;
  };
  timestamp: string;
}

interface GuestDoubtHistory {
  doubts: DoubtHistoryEntry[];
}

interface HistoryContextForAPI {
  doubtText: string;
  subject: string;
  topic: string;
  aiAnswer?: string; // JSON stringified
}

/**
 * Retrieves guest doubt history from AsyncStorage
 * @returns Array of doubt history entries, empty array if none exist or on error
 */
export const getGuestHistory = async (): Promise<DoubtHistoryEntry[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const history: GuestDoubtHistory = JSON.parse(stored);

    // Validate structure
    if (!history.doubts || !Array.isArray(history.doubts)) {
      console.warn("Invalid doubt history structure, clearing storage");
      await clearGuestHistory();
      return [];
    }

    return history.doubts;
  } catch (error) {
    console.error("Error reading guest doubt history:", error);
    // Attempt to clear corrupted data
    try {
      await clearGuestHistory();
    } catch (clearError) {
      console.error("Error clearing corrupted history:", clearError);
    }
    return [];
  }
};

/**
 * Adds a new doubt to guest history with FIFO eviction
 * Maintains maximum of 3 records
 * @param entry The doubt history entry to add
 */
export const addGuestDoubt = async (
  entry: DoubtHistoryEntry
): Promise<void> => {
  try {
    const currentHistory = await getGuestHistory();

    // Add new entry at the end
    const updatedHistory = [...currentHistory, entry];

    // Apply FIFO eviction if exceeds limit
    // Keep only the last MAX_HISTORY_SIZE entries
    const trimmedHistory = updatedHistory.slice(-MAX_HISTORY_SIZE);

    const historyToStore: GuestDoubtHistory = {
      doubts: trimmedHistory,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(historyToStore));
  } catch (error) {
    console.error("Error adding guest doubt to history:", error);
    throw error;
  }
};

/**
 * Clears all guest doubt history from AsyncStorage
 */
export const clearGuestHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing guest doubt history:", error);
    throw error;
  }
};

/**
 * Formats doubt history for API request payload
 * Converts frontend format to backend-compatible format
 * @param history Array of doubt history entries
 * @returns Array formatted for API consumption
 */
export const formatHistoryForAPI = (
  history: DoubtHistoryEntry[]
): HistoryContextForAPI[] => {
  try {
    return history.map((entry) => ({
      doubtText: entry.doubtText,
      subject: entry.subject,
      topic: entry.topic,
      aiAnswer: JSON.stringify(entry.aiAnswer),
    }));
  } catch (error) {
    console.error("Error formatting history for API:", error);
    return [];
  }
};

export const DoubtHistoryManager = {
  getGuestHistory,
  addGuestDoubt,
  clearGuestHistory,
  formatHistoryForAPI,
};
