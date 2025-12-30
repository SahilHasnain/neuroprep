import { create } from "zustand";
import { documentsService } from "@/services/api/documents.service";
import type { Document, UploadStatus } from "@/types/document";

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  uploadStatus: UploadStatus;
  error: string | null;

  fetchDocuments: () => Promise<void>;
  uploadDocument: (
    file: File | Blob,
    title: string,
    type: string
  ) => Promise<boolean>;
  getDocumentById: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<boolean>;
  setCurrentDocument: (document: Document | null) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  uploadStatus: "idle",
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await documentsService.getDocuments();
      if (result.success) {
        set({ documents: result.data, isLoading: false });
      } else {
        set({
          error: result.message || "Failed to fetch documents",
          isLoading: false,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false });
    }
  },

  uploadDocument: async (file: File | Blob, title: string, type: string) => {
    set({ uploadStatus: "uploading", error: null });
    try {
      const result = await documentsService.uploadDocument(file, title, type);
      if (result.success) {
        set({ uploadStatus: "success" });
        // Refresh documents list
        await get().fetchDocuments();
        // Reset status after a delay
        setTimeout(() => set({ uploadStatus: "idle" }), 2000);
        return true;
      } else {
        set({
          uploadStatus: "error",
          error: result.message || "Upload failed",
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ uploadStatus: "error", error: errorMessage });
      return false;
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
        // Remove from local state
        set((state) => ({
          documents: state.documents.filter((doc) => doc.$id !== id),
          isLoading: false,
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

  setCurrentDocument: (document: Document | null) => {
    set({ currentDocument: document });
  },
}));
