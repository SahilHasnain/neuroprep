import { create } from "zustand";
import { documentsService } from "@/services/api/documents.service";
import { saveQuestionsToStorage } from "@/services/storage/questions.storage";
import { saveNoteToStorage } from "@/services/storage/notes.storage";
import { Note } from "@/lib/models";
import { formatNotesContent } from "@/utils/formatters";
import type {
  Document,
  UploadStatus,
  GenerationState,
  DocumentGenerationState,
  UploadOptions,
  UploadProgress,
} from "@/types/document";

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  uploadStatus: UploadStatus;
  error: string | null;

  // Upload progress tracking
  uploadProgress: UploadProgress | null;

  // Generation states per document
  generationStates: Record<string, DocumentGenerationState>;

  // Actions
  fetchDocuments: () => Promise<void>;
  uploadDocument: (
    file: File | Blob | { uri: string; name: string; type: string },
    title: string,
    type: string,
    options?: UploadOptions
  ) => Promise<{ documentId: string | null; ocrStatus?: any }>; // Returns document ID + status
  getDocumentById: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<boolean>;
  processDocument: (id: string) => Promise<boolean>;
  setCurrentDocument: (document: Document | null) => void;

  // Generation actions
  generateQuestions: (
    documentId: string,
    settings?: { difficulty: string; count: number }
  ) => Promise<any>;
  generateNotes: (
    documentId: string,
    settings?: { length: string }
  ) => Promise<any>;
  getGenerationState: (documentId: string) => DocumentGenerationState;
  resetGenerationState: (
    documentId: string,
    type: "questions" | "notes"
  ) => void;
}

const defaultGenerationState: GenerationState = {
  status: "idle",
  progress: 0,
};

const defaultDocumentGenerationState: DocumentGenerationState = {
  questions: { ...defaultGenerationState },
  notes: { ...defaultGenerationState },
};

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  uploadStatus: "idle",
  error: null,
  uploadProgress: null,
  generationStates: {},

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentsService.getDocuments();
      if (result.success) {
        set({ documents: result.data || [], isLoading: false });
      } else {
        set({
          error: result.message || "Failed to fetch documents",
          isLoading: false,
          documents: [],
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false, documents: [] });
    }
  },

  uploadDocument: async (file, title, type, options) => {
    set({ uploadStatus: "uploading", error: null, uploadProgress: null });
    try {
      const result = await documentsService.uploadDocument(
        file,
        title,
        type,
        (progress) => {
          // Update progress state
          set({ uploadProgress: progress });
        }
      );

      if (result.success && result.data) {
        set({ uploadStatus: "success", uploadProgress: null });
        await get().fetchDocuments();

        const documentId = result.data.$id;

        // Check OCR status and set generation state conservatively for better UX
        const ocrStatus = (result as any).ocrStatus;
        if (ocrStatus) {
          console.log("📊 [Store] OCR Status:", ocrStatus);

          const status = ocrStatus.status as
            | "pending"
            | "processing"
            | "completed"
            | "failed";
          const extracted = !!ocrStatus.extracted;
          const textLength = Number(ocrStatus.textLength || 0);

          // Do NOT mark generation as error while OCR is pending/processing.
          // Only mark error on definitive failure. For completed with limited/no text,
          // keep generation state idle and let UI show gentle warnings.
          if (status === "failed") {
            set((state) => ({
              generationStates: {
                ...state.generationStates,
                [documentId]: {
                  questions: {
                    status: "error",
                    progress: 0,
                    error: "Text extraction failed. Cannot generate questions.",
                  },
                  notes: {
                    status: "error",
                    progress: 0,
                    error: "Text extraction failed. Cannot generate notes.",
                  },
                },
              },
            }));
          }
        }

        // Auto-generate if options provided and OCR succeeded
        if (
          options?.generateQuestions &&
          ocrStatus?.status === "completed" &&
          ocrStatus?.extracted &&
          ocrStatus?.textLength >= 50
        ) {
          get().generateQuestions(documentId, options.questionSettings);
        }
        if (
          options?.generateNotes &&
          ocrStatus?.status === "completed" &&
          ocrStatus?.extracted &&
          ocrStatus?.textLength >= 50
        ) {
          get().generateNotes(documentId, options.noteSettings);
        }

        setTimeout(() => set({ uploadStatus: "idle" }), 2000);
        return { documentId, ocrStatus };
      } else {
        set({
          uploadStatus: "error",
          error: result.message || "Upload failed",
          uploadProgress: null,
        });
        return { documentId: null, ocrStatus: null };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ uploadStatus: "error", error: errorMessage, uploadProgress: null });
      return { documentId: null, ocrStatus: null };
    }
  },

  getDocumentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentsService.getDocumentById(id);
      if (result.success) {
        set({ currentDocument: result.data, isLoading: false });
      } else {
        set({
          error: result.message || "Document not found",
          isLoading: false,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentsService.deleteDocument(id);
      if (result.success) {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.$id !== id),
          isLoading: false,
          generationStates: Object.fromEntries(
            Object.entries(state.generationStates).filter(([key]) => key !== id)
          ),
        }));
        return true;
      } else {
        set({ error: result.message || "Delete failed", isLoading: false });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  processDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentsService.processDocument(id);
      if (result.success && result.data) {
        const updatedDoc = result.data;
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.$id === id ? updatedDoc : doc
          ),
          currentDocument:
            state.currentDocument?.$id === id
              ? updatedDoc
              : state.currentDocument,
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: result.message || "Failed to process document",
          isLoading: false,
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  setCurrentDocument: (document: Document | null) => {
    set({ currentDocument: document });
  },

  getGenerationState: (documentId: string) => {
    const state = get().generationStates[documentId];
    return state || { ...defaultDocumentGenerationState };
  },

  resetGenerationState: (documentId: string, type: "questions" | "notes") => {
    set((state) => ({
      generationStates: {
        ...state.generationStates,
        [documentId]: {
          ...state.generationStates[documentId],
          [type]: { ...defaultGenerationState },
        },
      },
    }));
  },

  generateQuestions: async (documentId, settings) => {
    let document = get().documents.find((d) => d.$id === documentId);
    if (!document) return null;

    // Check if OCR is pending
    if (document.ocrStatus === "pending" || !document.ocrText) {
      console.log("⏳ [Store] OCR pending, processing first...");
      // Update state to processing OCR
      set((state) => ({
        generationStates: {
          ...state.generationStates,
          [documentId]: {
            ...(state.generationStates[documentId] ||
              defaultDocumentGenerationState),
            questions: { status: "generating", progress: 5, error: undefined }, // message not in type yet
          },
        },
      }));

      const processed = await get().processDocument(documentId);
      if (!processed) {
        set((state) => ({
          generationStates: {
            ...state.generationStates,
            [documentId]: {
              ...state.generationStates[documentId],
              questions: {
                status: "error",
                progress: 0,
                error: "Document processing failed",
              },
            },
          },
        }));
        return null;
      }
      // Refresh document
      document = get().documents.find((d) => d.$id === documentId);
      if (!document) return null;
    }

    console.log("🎯 [Store] Starting question generation for:", documentId);
    console.log("📄 [Store] Document:", {
      id: document.$id,
      title: document.title,
      hasOcrText: !!document.ocrText,
      ocrTextLength: document.ocrText?.length || 0,
    });

    // Update state to generating
    set((state) => ({
      generationStates: {
        ...state.generationStates,
        [documentId]: {
          ...(state.generationStates[documentId] ||
            defaultDocumentGenerationState),
          questions: { status: "generating", progress: 10 },
        },
      },
    }));

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        set((state) => {
          const current =
            state.generationStates[documentId]?.questions?.progress || 10;
          if (current < 90) {
            return {
              generationStates: {
                ...state.generationStates,
                [documentId]: {
                  ...state.generationStates[documentId],
                  questions: {
                    ...state.generationStates[documentId]?.questions,
                    progress: current + 15,
                  },
                },
              },
            };
          }
          return state;
        });
      }, 800);

      const result = await documentsService.generateQuestions(
        document,
        settings?.difficulty || "easy",
        settings?.count || 5
      );

      clearInterval(progressInterval);

      console.log("✅ [Store] Generation result:", {
        success: result.success,
        hasData: !!result.data,
        dataLength: Array.isArray(result.data) ? result.data.length : 0,
      });

      if (result.success) {
        // Save questions to AsyncStorage
        const questions = result.data || [];
        if (questions.length > 0) {
          try {
            // Infer subject from document title
            const subject = inferSubject(document.title);
            await saveQuestionsToStorage(questions, {
              subject,
              topic: document.title,
              difficulty: settings?.difficulty || "easy",
              questionCount: questions.length,
            });
          } catch (err) {
            console.error("Failed to save questions to storage:", err);
          }
        }

        set((state) => ({
          generationStates: {
            ...state.generationStates,
            [documentId]: {
              ...state.generationStates[documentId],
              questions: {
                status: "success",
                progress: 100,
                data: result.data,
              },
            },
          },
        }));
        return result.data;
      } else {
        set((state) => ({
          generationStates: {
            ...state.generationStates,
            [documentId]: {
              ...state.generationStates[documentId],
              questions: {
                status: "error",
                progress: 0,
                error: result.message,
              },
            },
          },
        }));
        return null;
      }
    } catch (err) {
      set((state) => ({
        generationStates: {
          ...state.generationStates,
          [documentId]: {
            ...state.generationStates[documentId],
            questions: {
              status: "error",
              progress: 0,
              error: err instanceof Error ? err.message : "Generation failed",
            },
          },
        },
      }));
      return null;
    }
  },

  generateNotes: async (documentId, settings) => {
    let document = get().documents.find((d) => d.$id === documentId);
    if (!document) return null;

    // Check if OCR is pending
    if (document.ocrStatus === "pending" || !document.ocrText) {
      console.log("⏳ [Store] OCR pending, processing first...");
      set((state) => ({
        generationStates: {
          ...state.generationStates,
          [documentId]: {
            ...(state.generationStates[documentId] ||
              defaultDocumentGenerationState),
            notes: { status: "generating", progress: 5, error: undefined },
          },
        },
      }));

      const processed = await get().processDocument(documentId);
      if (!processed) {
        set((state) => ({
          generationStates: {
            ...state.generationStates,
            [documentId]: {
              ...state.generationStates[documentId],
              notes: {
                status: "error",
                progress: 0,
                error: "Document processing failed",
              },
            },
          },
        }));
        return null;
      }
      document = get().documents.find((d) => d.$id === documentId);
      if (!document) return null;
    }

    set((state) => ({
      generationStates: {
        ...state.generationStates,
        [documentId]: {
          ...(state.generationStates[documentId] ||
            defaultDocumentGenerationState),
          notes: { status: "generating", progress: 10 },
        },
      },
    }));

    try {
      const progressInterval = setInterval(() => {
        set((state) => {
          const current =
            state.generationStates[documentId]?.notes?.progress || 10;
          if (current < 90) {
            return {
              generationStates: {
                ...state.generationStates,
                [documentId]: {
                  ...state.generationStates[documentId],
                  notes: {
                    ...state.generationStates[documentId]?.notes,
                    progress: current + 15,
                  },
                },
              },
            };
          }
          return state;
        });
      }, 800);

      const result = await documentsService.generateNotes(
        document,
        settings?.length || "brief"
      );

      clearInterval(progressInterval);

      if (result.success) {
        // Save notes to AsyncStorage
        const notesData = result.data?.content || result.data;
        if (notesData) {
          try {
            const subject = inferSubject(document.title);
            const content = formatNotesContent(notesData);

            const note = new Note(
              `doc-${documentId}-${Date.now()}`,
              document.title,
              subject,
              content,
              new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            );

            await saveNoteToStorage(note, {
              subject,
              topic: document.title,
              noteLength: settings?.length || "brief",
            });
          } catch (err) {
            console.error("Failed to save notes to storage:", err);
          }
        }

        set((state) => ({
          generationStates: {
            ...state.generationStates,
            [documentId]: {
              ...state.generationStates[documentId],
              notes: { status: "success", progress: 100, data: result.data },
            },
          },
        }));
        return result.data;
      } else {
        set((state) => ({
          generationStates: {
            ...state.generationStates,
            [documentId]: {
              ...state.generationStates[documentId],
              notes: { status: "error", progress: 0, error: result.message },
            },
          },
        }));
        return null;
      }
    } catch (err) {
      set((state) => ({
        generationStates: {
          ...state.generationStates,
          [documentId]: {
            ...state.generationStates[documentId],
            notes: {
              status: "error",
              progress: 0,
              error: err instanceof Error ? err.message : "Generation failed",
            },
          },
        },
      }));
      return null;
    }
  },
}));

// Helper to infer subject from document title
function inferSubject(title: string): string {
  const titleLower = title.toLowerCase();

  if (
    titleLower.includes("physics") ||
    titleLower.includes("motion") ||
    titleLower.includes("force") ||
    titleLower.includes("energy")
  ) {
    return "physics";
  }
  if (
    titleLower.includes("chemistry") ||
    titleLower.includes("chemical") ||
    titleLower.includes("atom") ||
    titleLower.includes("molecule")
  ) {
    return "chemistry";
  }
  if (
    titleLower.includes("biology") ||
    titleLower.includes("cell") ||
    titleLower.includes("organism") ||
    titleLower.includes("life")
  ) {
    return "biology";
  }
  if (
    titleLower.includes("math") ||
    titleLower.includes("algebra") ||
    titleLower.includes("calculus") ||
    titleLower.includes("geometry")
  ) {
    return "mathematics";
  }

  return "general";
}
