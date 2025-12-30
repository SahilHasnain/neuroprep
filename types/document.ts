/**
 * Document Types
 */

export enum DocumentType {
  PDF = "pdf",
  IMAGE = "image",
}

export interface Document {
  $id: string;
  title: string;
  type: DocumentType;
  fileUrl: string;
  thumbnailUrl?: string;
  ocrText?: string;
  identityType: "guest" | "user";
  identityId: string;
  userId?: string;
  fileSize: number;
  pageCount?: number;
  mimeType: string;
  $createdAt: string;
  $updatedAt: string;
}

export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";
