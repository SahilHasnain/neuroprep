import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  generateUniqueId,
  capitalizeFirstLetter,
  truncateText,
  getNoteLengthLabel,
} from "../helpers";

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
  createdAt: string;
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
 * Load all notes from AsyncStorage
 */
export const loadNotesFromStorage = async (): Promise<Note[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const noteSets: StoredNoteSet[] = JSON.parse(stored);
      // Extract notes from all stored sets
      const notes = noteSets.map((set) => set.note);
      console.log(`📚 Loaded ${notes.length} notes from storage`);
      return notes;
    }
    return [];
  } catch (err) {
    console.error("❌ Error loading notes from storage:", err);
    return [];
  }
};

/**
 * Save a new note to AsyncStorage with structured format
 */
export const saveNoteToStorage = async (
  note: Note,
  metadata: {
    subject: string;
    topic: string;
    noteLength: string;
  }
): Promise<void> => {
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
      note: note,
      createdAt: new Date().toISOString(),
    };

    // Keep only last 20 note sets to avoid storage bloat
    const updatedSets = [newSet, ...existingSets].slice(0, 20);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));

    console.log(`✅ Saved note: ${label}`);
  } catch (err) {
    console.error("❌ Error saving note to storage:", err);
  }
};

/**
 * Delete a note from AsyncStorage by note ID
 */
export const deleteNoteFromStorage = async (noteId: string): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const existingSets: StoredNoteSet[] = JSON.parse(stored);
      const updatedSets = existingSets.filter((set) => set.note.id !== noteId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSets));
      console.log(`🗑️ Deleted note: ${noteId}`);
    }
  } catch (err) {
    console.error("❌ Error deleting note from storage:", err);
  }
};
