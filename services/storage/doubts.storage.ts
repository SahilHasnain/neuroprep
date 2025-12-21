import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { tablesDB } from "@/lib/appwrite";
import { APPWRITE_CONFIG } from "@/config/appwrite";
import { ID, Query } from "react-native-appwrite";

export interface Doubt {
  id: string;
  text: string;
  answer?: string;
  createdAt: string;
}

const STORAGE_KEY = "@neuroprep_doubts";

export const loadDoubtsFromStorage = async (): Promise<Doubt[]> => {
  const { user } = useAuthStore.getState();

  if (user) {
    try {
      const response = await tablesDB.listRows({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.doubtsTableId!,
        queries: [
          Query.equal("userId", user.$id),
          Query.orderDesc("createdAt"),
        ],
      });

      const doubts: Doubt[] = response.rows.map((r: any) => ({
        id: r.$id,
        text: r.text,
        answer: r.answer,
        createdAt: r.createdAt,
      }));

      return doubts;
    } catch (err) {
      console.error("❌ Error loading doubts from Appwrite:", err);
      return [];
    }
  }

  // Guest / local
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const local: Doubt[] = JSON.parse(stored);
    return local;
  } catch (err) {
    console.error("❌ Error loading doubts from local storage:", err);
    return [];
  }
};

export const saveDoubtToStorage = async (
  text: string,
  answer: string
): Promise<void> => {
  const { user } = useAuthStore.getState();

  if (user) {
    try {
      await tablesDB.createRow({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.doubtsTableId!,
        rowId: ID.unique(),
        data: {
          userId: user.$id,
          doubtText: text,
          answer,
        },
      });
      console.log(`☁️ Saved doubt to Appwrite: ${text}`);
    } catch (err) {
      console.error("❌ Error saving doubt to Appwrite:", err);
      throw err;
    }
    return;
  }

  // Local save
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const existing: Doubt[] = stored ? JSON.parse(stored) : [];
    const id = ID.unique();
    const newDoubt: Doubt = {
      id,
      text,
      answer,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDoubt, ...existing].slice(0, 20);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log(`🏠 Saved doubt locally: ${text}`);
  } catch (err) {
    console.error("❌ Error saving doubt to local storage:", err);
  }
};

export const deleteDoubtFromStorage = async (id: string): Promise<void> => {
  const { user } = useAuthStore.getState();
  if (user) {
    try {
      await tablesDB.deleteRow({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.doubtsTableId!,
        rowId: id,
      });
      console.log(`☁️ Deleted doubt from Appwrite: ${id}`);
    } catch (err) {
      console.error("❌ Error deleting doubt from Appwrite:", err);
    }
    return;
  }

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const existing: Doubt[] = JSON.parse(stored);
    const updated = existing.filter((d) => d.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log(`🏠 Deleted doubt locally: ${id}`);
  } catch (err) {
    console.error("❌ Error deleting doubt from local storage:", err);
  }
};
