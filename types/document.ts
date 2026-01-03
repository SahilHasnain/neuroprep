/**
 * Document Types
 */

export enum DocumentType {
  IMAGE = "image",
}

export interface ProcessingMetadata {
  ocrStartedAt?: string;
  ocrCompletedAt?: string;
  ocrFailedAt?: string;
  ocrDuration?: number;
  ocrTextLength?: number;
  ocrError?: string;
  thumbnailStartedAt?: string;
  thumbnailCompletedAt?: string;
  thumbnailFailedAt?: string;
  thumbnailDuration?: number;
  thumbnailError?: string;
}

export interface Document {
  $id: string;
  title: string;
  type: "image";
  fileUrl: string;
  thumbnailUrl?: string;
  ocrText?: string;
  ocrStatus?: "pending" | "processing" | "completed" | "failed";
  thumbnailStatus?: "placeholder" | "processing" | "completed" | "failed";
  identityType: "guest" | "user";
  identityId: string;
  userId?: string;
  fileSize: number;
  pageCount?: number;
  mimeType: string;
  processingMetadata?: ProcessingMetadata | string;
  $createdAt: string;
  $updatedAt: string;
}

export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";

// Upload Progress Types
export interface UploadProgress {
  loaded: number; // Bytes uploaded
  total: number; // Total bytes
  percentage: number; // 0-100
  speed?: number; // Bytes per second
  estimatedTimeRemaining?: number; // Seconds
}

// Generation Status Types
export type GenerationStatus = "idle" | "generating" | "success" | "error";

export interface GenerationState {
  status: GenerationStatus;
  progress: number;
  error?: string;
  data?: any;
}

export interface DocumentGenerationState {
  questions: GenerationState;
  notes: GenerationState;
}

// Upload Options
export interface UploadOptions {
  generateQuestions: boolean;
  generateNotes: boolean;
  questionSettings?: {
    difficulty: "easy" | "medium" | "hard";
    count: number;
  };
  noteSettings?: {
    length: "brief" | "detailed" | "exam";
  };
}

// Generated Content Preview
export interface QuestionPreview {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface NotesPreview {
  title: string;
  summary: string;
  keyPoints: string[];
}
