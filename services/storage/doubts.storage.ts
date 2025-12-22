import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { doubtsService } from "@/services/api/doubts.service";
import { ID } from "react-native-appwrite";
import type { Doubt } from "@/lib/types";

const STORAGE_KEY = "@neuroprep_doubts";

export const loadDoubtsFromStorage = async (): Promise<Doubt[]> => {
  const { user } = useAuthStore.getState();

  if (user) {
    try {
      const response = await doubtsService.getHistory();
      return response.data || [];
    } catch (err) {
      console.error("❌ Error loading doubts from backend:", err);
      return [];
    }
  }

  // Guest: Local storage
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
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

  // Logged-in users: Backend already saved, skip frontend save
  if (user) {
    console.log("☁️ Doubt already saved by backend");
    return;
  }

  // Guest: Local save
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
    console.log("🏠 Saved doubt locally");
  } catch (err) {
    console.error("❌ Error saving doubt to local storage:", err);
  }
};

export const deleteDoubtFromStorage = async (id: string): Promise<void> => {
  const { user } = useAuthStore.getState();
  
  if (user) {
    console.log("⚠️ Delete via backend not implemented yet");
    return;
  }

  // Guest: Local delete
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const existing: Doubt[] = JSON.parse(stored);
    const updated = existing.filter((d) => d.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log("🏠 Deleted doubt locally");
  } catch (err) {
    console.error("❌ Error deleting doubt from local storage:", err);
  }
};
