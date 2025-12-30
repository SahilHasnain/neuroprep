// MVP_BYPASS: Simplified hook - removed auth checks, treat all as guests, use ComingSoonModal for limits
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
import { usePlanStore } from "@/store/planStore";
import type { PlanLimits } from "@/types/plan";
import { parseApiError, type ApiError } from "@/utils/errorHandler";
import {
  checkGuestLimit,
  incrementGuestUsage,
  getGuestUsage,
  getGuestLimits,
} from "@/utils/guestUsageTracker";

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  // MVP_BYPASS: Added state for coming soon modal
  const [showComingSoon, setShowComingSoon] = useState(false);

  const [generateConfig, setGenerateConfig] = useState({
    subject: "",
    topic: "",
    noteLength: "brief",
  });

  // MVP_BYPASS: Removed userPlan state, no free/pro badge logic
  const { usage, limits } = usePlanStore();
  const dailyLimit = limits?.notes || 20;
  const quota = { used: usage?.notes || 0, limit: dailyLimit };

  // MVP_BYPASS: Always load as guest, no auth checks
  useEffect(() => {
    loadNotes();
    loadGuestUsage();
  }, []);

  const loadGuestUsage = async () => {
    const usage = await getGuestUsage();
    // quota is already calculated from planStore.usage
    // This ensures it's loaded on mount
  };

  const loadNotes = async () => {
    const storedNotes = await loadNotesFromStorage();
    setNotes(storedNotes);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject
      ? note.subject === filterSubject
      : true;
    return matchesSearch && matchesSubject;
  });

  const generateNotes = async (documentContext?: {
    documentId: string;
    documentTitle: string;
    ocrText: string;
  }) => {
    if (!generateConfig.subject || !generateConfig.topic.trim()) {
      Alert.alert("Error", "Please select subject and enter topic");
      return;
    }

    // MVP_BYPASS: Always check guest limit, no auth user checks
    const canUse = await checkGuestLimit("notes");
    if (!canUse) {
      // MVP_BYPASS: Show coming soon modal instead of upgrade prompt
      setShowComingSoon(true);
      setError({
        errorCode: "DAILY_LIMIT_REACHED",
        message: "Daily limit reached. More features coming soon!",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await notesService.generateNotes({
        subject: generateConfig.subject,
        topic: generateConfig.topic,
        noteLength: generateConfig.noteLength,
        documentContext,
      });

      if (!response.success) {
        const apiError = parseApiError(response);
        if (apiError) {
          setError(apiError);
          // Show friendly error message based on error type
          const errorMessage =
            apiError.errorCode === "RATE_LIMIT_EXCEEDED"
              ? "You've reached your daily limit. Please try again tomorrow."
              : apiError.errorCode === "INVALID_INPUT"
                ? "Please check your input and try again."
                : apiError.message ||
                  "We couldn't generate your notes right now. Please try again.";
          Alert.alert("Generation Failed", errorMessage);
          return;
        }
        throw new Error(response.message || "Invalid response from server");
      }

      if (!response.data) {
        throw new Error("No content received from server");
      }

      setError(null);

      const apiNotes = (response.data as any)?.content || response.data;

      // Validate that we received meaningful content
      if (
        !apiNotes ||
        (typeof apiNotes === "object" && Object.keys(apiNotes).length === 0)
      ) {
        throw new Error("Received empty content from server");
      }

      const content = formatNotesContent(apiNotes);

      // Additional validation for formatted content
      if (!content || content.trim() === "" || content === "{}") {
        throw new Error("Generated content is empty or invalid");
      }

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

      // MVP_BYPASS: Always increment guest usage, no auth checks
      await incrementGuestUsage("notes");
      // Sync planStore for cross-screen consistency
      await usePlanStore.getState().fetchPlanStatus();

      setNotes([note, ...notes]);
      setGenerateConfig({ subject: "", topic: "", noteLength: "brief" });
      setIsModalVisible(false);
      Alert.alert("Success", "AI notes generated and saved!");
    } catch (err) {
      console.error("Error generating notes:", err);

      // Provide user-friendly error messages
      let errorMessage =
        "We couldn't generate your notes right now. Please try again.";

      if (err instanceof Error) {
        if (err.message.includes("network") || err.message.includes("fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (
          err.message.includes("empty") ||
          err.message.includes("invalid")
        ) {
          errorMessage =
            "The generated content was incomplete. Please try again.";
        } else if (error?.message) {
          errorMessage = error.message;
        }
      }

      setError({
        errorCode: "GENERATION_FAILED",
        message: errorMessage,
      });

      Alert.alert(
        "Generation Failed",
        errorMessage +
          "\n\nIf this problem persists, please try a different topic or contact support."
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

  const isNoteLengthLocked = (noteLength: string) => {
    if (!limits) return false;
    return !limits.allowedNoteLengths.includes(noteLength);
  };

  // MVP_BYPASS: Return showComingSoon state for modal control
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
    quota,
    error,
    isNoteLengthLocked,
    showComingSoon,
    setShowComingSoon,
  };
};
