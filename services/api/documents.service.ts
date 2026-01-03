import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse } from "@/lib/types";
import type { Document, UploadProgress } from "@/types/document";
import { getIdentity } from "@/utils/identity";
import { storage, ID } from "@/lib/appwrite";
import { APPWRITE_STORAGE_BUCKET_ID } from "@/config/appwrite";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Normalizes React Native file object for Appwrite Storage upload.
 * Ensures size is populated and URI is valid.
 */
async function normalizeFile(file: any, mimeType: string) {
  let { uri, name, size } = file;

  // Get file size if missing
  if (!size && uri) {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      size = (info as any)?.size || (info as any)?.fileSize;
    } catch (err) {
      console.error("[normalizeFile] getInfoAsync error:", err);
    }
  }

  return { uri, name, size, type: mimeType };
}

export const documentsService = {
  async uploadDocument(
    file: any,
    title: string,
    type: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<Document>> {
    try {
      const identity = await getIdentity();

      // Determine MIME type based on file type hint
      const mimeType = file.type || "image/jpeg";

      // Normalize file (ensure size and valid URI)
      const normalizedFile = await normalizeFile(file, mimeType);

      // Upload to Appwrite Storage
      const uploadedFile = await storage.createFile({
        bucketId: APPWRITE_STORAGE_BUCKET_ID || "documents",
        fileId: ID.unique(),
        file: normalizedFile,
      });

      if (!uploadedFile?.$id) {
        throw new Error("Upload failed: no file ID returned");
      }

      // Call backend with file ID
      return await apiClient.post<Document>(API_ENDPOINTS.DOCUMENTS_UPLOAD, {
        fileId: uploadedFile.$id,
        title,
        type,
      });
    } catch (error) {
      return {
        success: false,
        data: {} as Document,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  },

  async getDocuments(): Promise<ApiResponse<Document[]>> {
    return apiClient.get<Document[]>(API_ENDPOINTS.DOCUMENTS_GET_ALL);
  },

  async getDocumentById(id: string): Promise<ApiResponse<Document>> {
    return apiClient.get<Document>(
      `${API_ENDPOINTS.DOCUMENTS_GET_DETAIL}?id=${id}`
    );
  },

  async deleteDocument(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const identity = await getIdentity();
      const response = await fetch(
        `${API_ENDPOINTS.DOCUMENTS_DELETE}?id=${id}`,
        {
          method: "DELETE",
          headers: {
            "x-identity-type": identity.type,
            "x-identity-id": identity.id,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete Error:", error);
      return {
        success: false,
        data: { message: "" },
        message: error instanceof Error ? error.message : "Delete failed",
      };
    }
  },

  async processDocument(id: string): Promise<ApiResponse<Document>> {
    try {
      const identity = await getIdentity();
      const response = await fetch(API_ENDPOINTS.PROCESS_OCR, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-identity-type": identity.type,
          "x-identity-id": identity.id,
        },
        body: JSON.stringify({ documentId: id }),
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Processing Error:", error);
      return {
        success: false,
        data: {} as Document,
        message: error instanceof Error ? error.message : "Processing failed",
      };
    }
  },

  // Generate questions from document
  async generateQuestions(
    document: Document,
    difficulty: string = "easy",
    count: number = 5
  ): Promise<ApiResponse<any>> {
    // Check if document has OCR text
    if (!document.ocrText || document.ocrText.trim().length === 0) {
      return {
        success: false,
        data: null,
        message:
          "Unable to generate questions. The document text could not be extracted. Please try uploading a clearer image.",
      };
    }

    // Check if OCR text is too short
    if (document.ocrText.length < 50) {
      console.warn("⚠️ [generateQuestions] OCR text is very short");
      return {
        success: false,
        data: null,
        message:
          "The document text is too short to generate meaningful questions. Please upload a document with more content.",
      };
    }

    const documentContext = {
      documentId: document.$id,
      documentTitle: document.title,
      documentType: document.type,
      ocrText: document.ocrText,
    };

    console.log("📦 Document Context:", {
      documentId: documentContext.documentId,
      documentTitle: documentContext.documentTitle,
      ocrTextLength: documentContext.ocrText.length,
      ocrTextPreview: documentContext.ocrText.substring(0, 100),
    });

    // For document-based generation, use generic subject/topic
    // The AI will infer actual subject from document content
    const payload = {
      subject: "Document Content",
      topic: document.title,
      difficulty,
      questionCount: count.toString(),
      documentContext,
    };

    console.log("🚀 Sending to API:", {
      ...payload,
      documentContext: {
        ...payload.documentContext,
        ocrText: `${payload.documentContext.ocrText.length} characters`,
      },
    });

    return apiClient.post<any>(API_ENDPOINTS.GENERATE_QUESTIONS, payload);
  },

  // Generate notes from document
  async generateNotes(
    document: Document,
    noteLength: string = "brief"
  ): Promise<ApiResponse<any>> {
    console.log("🔍 [generateNotes] Starting generation");
    console.log("📄 Document ID:", document.$id);
    console.log("📝 Document Title:", document.title);
    console.log("📋 Document Type:", document.type);
    console.log("📊 OCR Text Length:", document.ocrText?.length || 0);
    console.log(
      "📖 OCR Text Preview:",
      document.ocrText?.substring(0, 200) || "NO TEXT"
    );

    // Check if document has OCR text
    if (!document.ocrText || document.ocrText.trim().length === 0) {
      console.error("❌ [generateNotes] No OCR text available");
      return {
        success: false,
        data: null,
        message:
          "Unable to generate notes. The document text could not be extracted. Please try uploading a clearer image.",
      };
    }

    // Check if OCR text is too short
    if (document.ocrText.length < 50) {
      console.warn("⚠️ [generateNotes] OCR text is very short");
      return {
        success: false,
        data: null,
        message:
          "The document text is too short to generate meaningful notes. Please upload a document with more content.",
      };
    }

    const documentContext = {
      documentId: document.$id,
      documentTitle: document.title,
      documentType: document.type,
      ocrText: document.ocrText,
    };

    console.log("📦 Document Context:", {
      documentId: documentContext.documentId,
      documentTitle: documentContext.documentTitle,
      ocrTextLength: documentContext.ocrText.length,
      ocrTextPreview: documentContext.ocrText.substring(0, 100),
    });

    // For document-based generation, use generic subject/topic
    // The AI will infer actual subject from document content
    const payload = {
      subject: "Document Content",
      topic: document.title,
      noteLength,
      documentContext,
    };

    console.log("🚀 Sending to API:", {
      ...payload,
      documentContext: {
        ...payload.documentContext,
        ocrText: `${payload.documentContext.ocrText.length} characters`,
      },
    });

    return apiClient.post<any>(API_ENDPOINTS.NOTES, payload);
  },
};
