import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  generateUniqueId,
  capitalizeFirstLetter,
  truncateText,
  getNoteLengthLabel,
  formatDate,
} from "../helpers";
import { tablesDB } from "@/lib/appwrite";
import { useAuthStore } from "@/store/authStore";
import { APPWRITE_CONFIG } from "@/config/appwrite";
import { ID, Query } from "react-native-appwrite";

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  date: string;
}

export interface StoredNoteSet {
  id: string; // Unique identifier
  label: string; // Human-readable label for clarity
  subject: string;
  topic: string;
  noteLength: string;
  note: Note;
}

const STORAGE_KEY = "@neuroprep_notes";

/**
 * Generate a clear, human-readable label for a note set
 * Format: "Physics - Thermodynamics (Detailed)"
 */
export const generateNoteSetLabel = (
  subject: string,
  topic: string,
  noteLength: string
): string => {
  const capitalizedSubject = capitalizeFirstLetter(subject);
  const formattedLength = getNoteLengthLabel(noteLength);
  const truncatedTopic = truncateText(topic, 25);

  return `${capitalizedSubject} - ${truncatedTopic} (${formattedLength})`;
};

/**
 * Load all notes from Storage (Hybrid: Cloud if logged in, Local if guest)
 */
export const loadNotesFromStorage = async (): Promise<Note[]> => {
  const { user } = useAuthStore.getState();

  if (user) {
    // ☁️ Cloud Load
    try {
      const response = await tablesDB.listRows({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.notesTableId!,
        queries: [
          Query.equal("userId", user.$id),
          Query.orderDesc("createdAt"),
        ],
      });

      const notes: Note[] = response.rows.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        subject: doc.subject,
        content: doc.content,
        date: formatDate(doc.createdAt),
      }));

      console.log(`☁️ Loaded ${notes.length} notes from Appwrite`);
      return notes;
    } catch (err) {
      console.error("❌ Error loading notes from Appwrite:", err);
      return [];
    }
  } else {
    // 🏠 Local Load
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const noteSets: StoredNoteSet[] = JSON.parse(stored);
        const notes = noteSets.map((set) => set.note);
        console.log(`🏠 Loaded ${notes.length} notes from local storage`);
        return notes;
      }
      return [];
    } catch (err) {
      console.error("❌ Error loading notes from local storage:", err);
      return [];
    }
  }
};

/**
 * Save a new note to Storage (Hybrid: Cloud if logged in, Local if guest)
 */
export const saveNoteToStorage = async (
  note: Note,
  metadata: {
    subject: string;
    topic: string;
    noteLength: string;
  }
): Promise<void> => {
  const { user } = useAuthStore.getState();

  if (user) {
    // ☁️ Cloud Save
    try {
      await tablesDB.createRow({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.notesTableId!,
        rowId: ID.unique(),
        data: {
          userId: user.$id,
          title: note.title,
          subject: metadata.subject,
          content: note.content,
          topic: metadata.topic,
          noteLength: metadata.noteLength,
        },
      });
      console.log(`☁️ Saved note to Appwrite: ${note.title}`);
    } catch (err) {
      console.error("❌ Error saving note to Appwrite:", err);
      throw err;
    }
  } else {
    // 🏠 Local Save
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const existingSets: StoredNoteSet[] = stored ? JSON.parse(stored) : [];

      const uniqueId = generateUniqueId("note");
      const label = generateNoteSetLabel(
        metadata.subject,
        metadata.topic,
        metadata.noteLength
      );

      const newSet: StoredNoteSet = {
        id: uniqueId,
        label: label,
        subject: metadata.subject,
        topic: metadata.topic,
        noteLength: metadata.noteLength,
        note: { ...note, id: uniqueId }, // Ensure ID matches set ID for local
      };

      // Keep only last 20 note sets to avoid storage bloat
      const updatedSets = [newSet, ...existingSets].slice(0, 20);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));

      console.log(`🏠 Saved note locally: ${label}`);
    } catch (err) {
      console.error("❌ Error saving note to local storage:", err);
    }
  }
};

/**
 * Delete a note from Storage (Hybrid: Cloud if logged in, Local if guest)
 */
export const deleteNoteFromStorage = async (noteId: string): Promise<void> => {
  const { user } = useAuthStore.getState();

  if (user) {
    // ☁️ Cloud Delete
    try {
      await tablesDB.deleteRow({
        databaseId: APPWRITE_CONFIG.databaseId!,
        tableId: APPWRITE_CONFIG.notesTableId!,
        rowId: noteId,
      });
      console.log(`☁️ Deleted note from Appwrite: ${noteId}`);
    } catch (err) {
      console.error("❌ Error deleting note from Appwrite:", err);
    }
  } else {
    // 🏠 Local Delete
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const existingSets: StoredNoteSet[] = JSON.parse(stored);
        const updatedSets = existingSets.filter(
          (set) => set.note.id !== noteId
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
        console.log(`🏠 Deleted note locally: ${noteId}`);
      }
    } catch (err) {
      console.error("❌ Error deleting note from local storage:", err);
    }
  }
};
