import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse } from "@/lib/types";
import type { Document } from "@/types/document";
import { getIdentity } from "@/utils/identity";

export const documentsService = {
  async uploadDocument(
    file: File | Blob,
    title: string,
    type: string
  ): Promise<ApiResponse<Document>> {
    try {
      const identity = await getIdentity();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("type", type);

      const response = await fetch(API_ENDPOINTS.DOCUMENTS_UPLOAD, {
        method: "POST",
        headers: {
          "x-identity-type": identity.type,
          "x-identity-id": identity.id,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Upload Error:", error);
      return {
        success: false,
        data: {} as Document,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  },

  async getDocuments(): Promise<ApiResponse<Document[]>> {
    return apiClient.get<Document[]>(API_ENDPOINTS.DOCUMENTS);
  },

  async getDocumentById(id: string): Promise<ApiResponse<Document>> {
    return apiClient.get<Document>(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
  },

  async deleteDocument(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const identity = await getIdentity();
      const response = await fetch(`${API_ENDPOINTS.DOCUMENTS}/${id}`, {
        method: "DELETE",
        headers: {
          "x-identity-type": identity.type,
          "x-identity-id": identity.id,
        },
      });

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
};
