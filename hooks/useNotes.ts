import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { notesService } from "@/services/api/notes.service";
import {
  loadNotesFromStorage,
  saveNoteToStorage,
  deleteNoteFromStorage,
} from "@/services/storage/notes.storage";
import { formatNotesContent } from "@/utils/formatters";
import { Note } from "@/lib/models";
import type { Note as NoteType } from "@/lib/types";

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [loading, setLoading] = useState(false);

  const [generateConfig, setGenerateConfig] = useState({
    subject: "",
    topic: "",
    noteLength: "detailed",
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const storedNotes = await loadNotesFromStorage();
    setNotes(storedNotes);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject ? note.subject === filterSubject : true;
    return matchesSearch && matchesSubject;
  });

  const generateNotes = async () => {
    if (!generateConfig.subject || !generateConfig.topic.trim()) {
      Alert.alert("Error", "Please select subject and enter topic");
      return;
    }

    setLoading(true);

    try {
      const response = await notesService.generateNotes({
        subject: generateConfig.subject,
        topic: generateConfig.topic,
        noteLength: generateConfig.noteLength,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from server");
      }

      const apiNotes = response.data as any;
      const content = formatNotesContent(apiNotes);

      const note = new Note(
        apiNotes?.id || Date.now().toString(),
        generateConfig.topic,
        generateConfig.subject,
        content,
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );

      await saveNoteToStorage(note, {
        subject: generateConfig.subject,
        topic: generateConfig.topic,
        noteLength: generateConfig.noteLength,
      });

      setNotes([note, ...notes]);
      setGenerateConfig({ subject: "", topic: "", noteLength: "detailed" });
      setIsModalVisible(false);
      Alert.alert("Success", "AI notes generated and saved!");
    } catch (err) {
      console.error("Error generating notes:", err);
      Alert.alert(
        "Error",
        err instanceof Error
          ? err.message
          : "Failed to generate notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNoteFromStorage(id);
          setNotes(notes.filter((note) => note.id !== id));
          setIsViewModalVisible(false);
        },
      },
    ]);
  };

  const viewNote = (note: NoteType) => {
    setSelectedNote(note);
    setIsViewModalVisible(true);
  };

  const canGenerate = generateConfig.subject && generateConfig.topic.trim();

  return {
    notes,
    searchQuery,
    setSearchQuery,
    filterSubject,
    setFilterSubject,
    isModalVisible,
    setIsModalVisible,
    isViewModalVisible,
    setIsViewModalVisible,
    selectedNote,
    loading,
    generateConfig,
    setGenerateConfig,
    filteredNotes,
    generateNotes,
    deleteNote,
    viewNote,
    canGenerate,
  };
};
