/**
 * Domain Types - Business Entities
 */

// Doubt Domain
export interface Doubt {
  id: string;
  text: string;
  answer?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timeStamp: string;
}

// Question Domain
export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface StoredQuestionSet {
  id: string;
  label: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  questions: Question[];
  createdAt: string;
}

// Note Domain
export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  date: string;
}

export interface StoredNoteSet {
  id: string;
  label: string;
  subject: string;
  topic: string;
  noteLength: string;
  note: Note;
}

// Re-export from plan.ts to avoid duplication
export type { PlanType, SubscriptionStatus, FeatureType } from "./plan";
export type { PlanLimits as Limits, PlanUsage as Usage } from "./plan";
