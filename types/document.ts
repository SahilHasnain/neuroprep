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
  type: "pdf" | "image";
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
