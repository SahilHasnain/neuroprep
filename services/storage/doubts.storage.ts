import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";
import { doubtsService } from "@/services/api/doubts.service";
import { ID } from "react-native-appwrite";
import type { Doubt } from "@/lib/types";

const STORAGE_KEY = "@neuroprep_doubts";

export const loadDoubtsFromStorage = async (): Promise<Doubt[]> => {
  const { user } = useAuthStore.getState();

  if (!user) return [];

  try {
    const response = await doubtsService.getHistory();
    return response.data || [];
  } catch (err) {
    console.error("❌ Error loading doubts from backend:", err);
    return [];
  }
};

export const saveDoubtToStorage = async (
  text: string,
  answer: string
): Promise<void> => {
  const { user } = useAuthStore.getState();

  if (!user) return;

  console.log("☁️ Doubt already saved by backend");
};

export const deleteDoubtFromStorage = async (id: string): Promise<void> => {
  const { user } = useAuthStore.getState();
  
  if (!user) return;

  console.log("⚠️ Delete via backend not implemented yet");
};
