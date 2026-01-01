import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse } from "@/lib/types";
import type { Document, UploadProgress } from "@/types/document";
import { getIdentity } from "@/utils/identity";

// Chunked upload configuration
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
const MAX_CHUNK_RETRIES = 3;

// Generate unique upload ID
const generateUploadId = (): string => {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const documentsService = {
  async uploadDocument(
    file: File | Blob | { uri: string; name: string; type: string },
    title: string,
    type: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<Document>> {
    try {
      const identity = await getIdentity();

      const fileName = "uri" in file ? file.name : (file as File).name;
      const fileType = "uri" in file ? file.type : (file as File).type;

      // Ensure we always send a real Blob (fetching from uri when needed)
      const fileBlob =
        "uri" in file ? await (await fetch(file.uri)).blob() : (file as Blob);

      // Check file size and decide upload strategy
      if (fileBlob.size > LARGE_FILE_THRESHOLD) {
        console.log(
          `📦 Large file detected (${(fileBlob.size / 1024 / 1024).toFixed(2)}MB), using chunked upload`
        );
        return await documentsService.uploadDocumentChunked(
          fileBlob,
          fileName,
          fileType,
          title,
          type,
          identity,
          onProgress
        );
      }

      // Use standard upload for files <= 5MB
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();
        let lastLoaded = 0;
        let lastTime = startTime;

        // Track upload progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && onProgress) {
            const currentTime = Date.now();
            const timeDiff = (currentTime - lastTime) / 1000; // seconds
            const loadedDiff = e.loaded - lastLoaded;

            // Calculate speed (bytes per second)
            const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;

            // Calculate estimated time remaining
            const remainingBytes = e.total - e.loaded;
            const estimatedTimeRemaining =
              speed > 0 ? remainingBytes / speed : 0;

            const progress: UploadProgress = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
              speed: Math.round(speed),
              estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
            };

            onProgress(progress);

            lastLoaded = e.loaded;
            lastTime = currentTime;
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);

              // Log OCR status
              if (data.ocrStatus) {
                console.log("📊 OCR Status:", data.ocrStatus.status);
                if (data.ocrStatus.status === "pending") {
                  console.log(
                    "⏳ Text extraction will happen automatically when you generate questions or notes"
                  );
                } else if (data.ocrStatus.status === "completed") {
                  console.log(
                    "✅ Text extraction completed:",
                    data.ocrStatus.textLength,
                    "chars"
                  );
                } else if (data.ocrStatus.status === "failed") {
                  console.warn("⚠️ Text extraction failed");
                }
              }

              resolve(data);
            } catch (error) {
              reject(new Error("Failed to parse response"));
            }
          } else {
            reject(
              new Error(`Upload failed: ${xhr.status} - ${xhr.statusText}`)
            );
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        // Setup request
        xhr.open("POST", API_ENDPOINTS.DOCUMENTS_UPLOAD);
        xhr.setRequestHeader("Content-Type", fileType);
        xhr.setRequestHeader("x-identity-type", identity.type);
        xhr.setRequestHeader("x-identity-id", identity.id);
        xhr.setRequestHeader("x-file-name", fileName);
        xhr.setRequestHeader("x-file-title", title);
        xhr.setRequestHeader("x-file-type", type);

        // Send request
        xhr.send(fileBlob);
      });
    } catch (error) {
      console.error("Upload Error:", error);
      return {
        success: false,
        data: {} as Document,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  },

  async uploadDocumentChunked(
    fileBlob: Blob,
    fileName: string,
    fileType: string,
    title: string,
    type: string,
    identity: { type: string; id: string },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<Document>> {
    const uploadId = generateUploadId();
    const totalChunks = Math.ceil(fileBlob.size / CHUNK_SIZE);
    const startTime = Date.now();
    let totalUploaded = 0;

    console.log(
      `🚀 Starting chunked upload: ${totalChunks} chunks, ${(fileBlob.size / 1024 / 1024).toFixed(2)}MB total`
    );

    try {
      // Upload chunks sequentially
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileBlob.size);
        const chunk = fileBlob.slice(start, end);

        console.log(
          `📤 Uploading chunk ${chunkIndex + 1}/${totalChunks} (${(chunk.size / 1024).toFixed(2)}KB)`
        );

        // Retry logic for each chunk
        let retries = 0;
        let chunkUploaded = false;

        while (retries < MAX_CHUNK_RETRIES && !chunkUploaded) {
          try {
            const result = await documentsService.uploadChunk(
              chunk,
              uploadId,
              chunkIndex,
              totalChunks,
              fileName,
              fileType,
              title,
              type,
              fileBlob.size,
              identity
            );

            chunkUploaded = true;
            totalUploaded += chunk.size;

            // Update progress
            if (onProgress) {
              const currentTime = Date.now();
              const elapsedTime = (currentTime - startTime) / 1000; // seconds
              const speed = elapsedTime > 0 ? totalUploaded / elapsedTime : 0;
              const remainingBytes = fileBlob.size - totalUploaded;
              const estimatedTimeRemaining =
                speed > 0 ? remainingBytes / speed : 0;

              const progress: UploadProgress = {
                loaded: totalUploaded,
                total: fileBlob.size,
                percentage: Math.round((totalUploaded / fileBlob.size) * 100),
                speed: Math.round(speed),
                estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
              };

              onProgress(progress);
            }

            // If this was the last chunk, return the result
            if (result.complete) {
              console.log("✅ Chunked upload completed successfully");
              return result;
            }
          } catch (error) {
            retries++;
            console.warn(
              `⚠️ Chunk ${chunkIndex + 1} failed (attempt ${retries}/${MAX_CHUNK_RETRIES}):`,
              error
            );

            if (retries >= MAX_CHUNK_RETRIES) {
              throw new Error(
                `Failed to upload chunk ${chunkIndex + 1} after ${MAX_CHUNK_RETRIES} retries`
              );
            }

            // Exponential backoff: 1s, 2s, 4s
            await sleep(Math.pow(2, retries - 1) * 1000);
          }
        }
      }

      // Should not reach here, but handle gracefully
      throw new Error("Upload completed but no response received");
    } catch (error) {
      console.error("Chunked Upload Error:", error);
      return {
        success: false,
        data: {} as Document,
        message:
          error instanceof Error ? error.message : "Chunked upload failed",
      };
    }
  },

  async uploadChunk(
    chunk: Blob,
    uploadId: string,
    chunkIndex: number,
    totalChunks: number,
    fileName: string,
    fileType: string,
    title: string,
    type: string,
    fileSize: number,
    identity: { type: string; id: string }
  ): Promise<ApiResponse<Document>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (error) {
            reject(new Error("Failed to parse chunk response"));
          }
        } else {
          reject(
            new Error(`Chunk upload failed: ${xhr.status} - ${xhr.statusText}`)
          );
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during chunk upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Chunk upload cancelled"));
      });

      // Setup request
      xhr.open("POST", API_ENDPOINTS.DOCUMENTS_CHUNKED_UPLOAD);
      xhr.setRequestHeader("Content-Type", fileType);
      xhr.setRequestHeader("x-identity-type", identity.type);
      xhr.setRequestHeader("x-identity-id", identity.id);
      xhr.setRequestHeader("x-upload-id", uploadId);
      xhr.setRequestHeader("x-chunk-index", chunkIndex.toString());
      xhr.setRequestHeader("x-total-chunks", totalChunks.toString());
      xhr.setRequestHeader("x-file-name", fileName);
      xhr.setRequestHeader("x-file-title", title);
      xhr.setRequestHeader("x-file-type", type);
      xhr.setRequestHeader("x-file-size", fileSize.toString());

      // Send chunk
      xhr.send(chunk);
    });
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
    console.log("🔍 [generateQuestions] Starting generation");
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
      console.error("❌ [generateQuestions] No OCR text available");
      return {
        success: false,
        data: null,
        message:
          "Unable to generate questions. The document text could not be extracted. Please try uploading a clearer image or a text-based PDF.",
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
          "Unable to generate notes. The document text could not be extracted. Please try uploading a clearer image or a text-based PDF.",
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
