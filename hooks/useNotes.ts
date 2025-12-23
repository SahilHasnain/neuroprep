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
import { checkGuestLimit, incrementGuestUsage, getGuestUsage, getGuestLimits } from "@/utils/guestUsageTracker";
import { useAuthStore } from "@/store/authStore";

type UserPlan = "free" | "student_pro";

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const [generateConfig, setGenerateConfig] = useState({
    subject: "",
    topic: "",
    noteLength: "brief",
  });

  const { planType, usage, limits } = usePlanStore();
  const userPlan: UserPlan = planType === "pro" ? "student_pro" : "free";
  const dailyLimit = limits?.notes || 1;
  const quota = { used: usage?.notes || 0, limit: dailyLimit };

  useEffect(() => {
    loadNotes();
    loadGuestUsage();
  }, []);

  const loadGuestUsage = async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      const usage = await getGuestUsage();
      // quota is already calculated from planStore.usage
      // This ensures it's loaded on mount
    }
  };

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

    const { user } = useAuthStore.getState();

    // Guest limit check
    if (!user) {
      const canUse = await checkGuestLimit("notes");
      if (!canUse) {
        setError({
          errorCode: "DAILY_LIMIT_REACHED",
          message: "Daily limit reached. Sign up to continue!",
        });
        return;
      }
    } else if (usage?.notes >= dailyLimit) {
      Alert.alert(
        "Daily Limit Reached",
        `You've reached your daily limit of ${dailyLimit} notes. Upgrade to Pro for unlimited notes!`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await notesService.generateNotes({
        subject: generateConfig.subject,
        topic: generateConfig.topic,
        noteLength: generateConfig.noteLength,
      });

      if (!response.success) {
        const apiError = parseApiError(response);
        if (apiError) {
          setError(apiError);
        }
        throw new Error(response.message || "Invalid response from server");
      }

      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      setError(null);

      const apiNotes = (response.data as any)?.content || response.data;
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

      // Update usage
      if (!user) {
        // Guest: Increment AsyncStorage
        await incrementGuestUsage("notes");
      } else {
        // Logged-in: Refresh from backend
        await usePlanStore.getState().fetchPlanStatus();
      }
      
      setNotes([note, ...notes]);
      setGenerateConfig({ subject: "", topic: "", noteLength: "brief" });
      setIsModalVisible(false);
      Alert.alert("Success", "AI notes generated and saved!");
    } catch (err) {
      console.error("Error generating notes:", err);
      const errorMessage = error?.message || (err instanceof Error ? err.message : "Failed to generate notes. Please try again.");
      Alert.alert("Error", errorMessage);
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
    if (userPlan === "student_pro") return false;
    if (!limits) return false;
    return !limits.allowedNoteLengths.includes(noteLength);
  };

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
    userPlan,
    quota,
    error,
    isNoteLengthLocked,
  };
};
