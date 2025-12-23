import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateUniqueId } from "@/utils/helpers";
import { notesService } from "@/services/api/notes.service";
import { useAuthStore } from "@/store/authStore";
import { formatNotesContent } from "@/utils/formatters";
import type { Note, StoredNoteSet } from "@/lib/types";

const STORAGE_KEY = "@neuroprep_notes";

export const loadNotesFromStorage = async (): Promise<Note[]> => {
  const { user } = useAuthStore.getState();

  if (user) {
    try {
      const response = await notesService.getHistory();
      const notes = response.data || [];
      
      // Format content for each note
      return notes.map((note: any) => ({
        ...note,
        content: formatNotesContent(note.content),
        date: note.createdAt ? new Date(note.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) : new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));
    } catch (err) {
      console.error("❌ Error loading notes from backend:", err);
      return [];
    }
  }

  // Guest: Local storage
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const noteSets: StoredNoteSet[] = JSON.parse(stored);
      return noteSets.map((set) => set.note);
    }
    return [];
  } catch (err) {
    console.error("❌ Error loading notes from local storage:", err);
    return [];
  }
};

export const saveNoteToStorage = async (
  note: Note,
  metadata: {
    subject: string;
    topic: string;
    noteLength: string;
  }
): Promise<void> => {
  const { user } = useAuthStore.getState();

  // Logged-in users: Backend already saved, skip frontend save
  if (user) {
    console.log("☁️ Note already saved by backend");
    return;
  }

  // Guest: Local save
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const existingSets: StoredNoteSet[] = stored ? JSON.parse(stored) : [];

    const uniqueId = generateUniqueId("note");
    const label = `${metadata.subject} - ${metadata.topic} (${metadata.noteLength})`;

    const newSet: StoredNoteSet = {
      id: uniqueId,
      label: label,
      subject: metadata.subject,
      topic: metadata.topic,
      noteLength: metadata.noteLength,
      note: { ...note, id: uniqueId },
    };

    const updatedSets = [newSet, ...existingSets].slice(0, 20);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
    console.log("🏠 Saved note locally");
  } catch (err) {
    console.error("❌ Error saving note to local storage:", err);
  }
};

export const deleteNoteFromStorage = async (noteId: string): Promise<void> => {
  const { user } = useAuthStore.getState();

  if (user) {
    console.log("⚠️ Delete via backend not implemented yet");
    return;
  }

  // Guest: Local delete
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const existingSets: StoredNoteSet[] = JSON.parse(stored);
      const updatedSets = existingSets.filter((set) => set.note.id !== noteId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
      console.log("🏠 Deleted note locally");
    }
  } catch (err) {
    console.error("❌ Error deleting note from local storage:", err);
  }
};
