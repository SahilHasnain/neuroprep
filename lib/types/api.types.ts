/**
 * API Request & Response Types
 */

// Generic API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  plan?: string;
  quota?: {
    used: number;
    limit: number;
    allowed: boolean;
  };
  limitInfo?: {
    used: number;
    limit: number;
    allowed: boolean;
  };
  errorCode?: string;
}

// Doubts API
export interface DoubtHistoryEntry {
  id: string;
  doubtText: string;
  subject: string;
  topic: string;
  aiAnswer: {
    explanation: string[];
    intuition: string;
    revisionTip: string;
  };
  timestamp: string;
  questionContext?: {
    questionId: string;
    questionText: string;
    correctAnswer: string;
  };
}

export interface AskDoubtRequest {
  doubtText: string;
  historyContext?: Array<{
    doubtText: string;
    subject: string;
    topic: string;
    aiAnswer?: string; // JSON stringified
  }>;
  questionContext?: {
    questionId: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    subject: string;
    topic: string;
    difficulty: string;
  };
  documentContext?: {
    documentId: string;
    documentTitle: string;
    ocrText: string;
  };
}

export interface AskDoubtResponse {
  answer: {
    explanation: string[];
    intuition: string;
    revisionTip: string;
  };
}

// Questions API
export interface GenerateQuestionsRequest {
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: string;
  documentContext?: {
    documentId: string;
    documentTitle: string;
    ocrText: string;
  };
}

export interface QuestionResponse {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
}

export type GenerateQuestionsResponse = QuestionResponse[];

// Notes API
export interface GenerateNotesRequest {
  subject: string;
  topic: string;
  noteLength: string;
  documentContext?: {
    documentId: string;
    documentTitle: string;
    ocrText: string;
  };
}

export interface NoteSection {
  heading: string;
  content: string;
  keyPoints?: string[];
  examples?: string[];
}

export interface NoteFormula {
  name: string;
  formula: string;
  explanation: string;
}

export interface NoteMisconception {
  misconception: string;
  correction: string;
}

export interface GenerateNotesResponse {
  id?: string;
  title: string;
  subject: string;
  topic: string;
  sections: NoteSection[];
  importantFormulas?: NoteFormula[];
  commonMisconceptions?: NoteMisconception[];
  examTips?: string[];
  summary?: string;
}

// Subscription API
export interface CreateSubscriptionRequest {
  name: string;
  email: string;
  phone: string;
}

export interface SubscriptionData {
  subscriptionId: string;
  planId: string;
  status: string;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

export interface PlanStatusResponse {
  planType: "free" | "pro";
  status?: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  usage: {
    doubts: number;
    questions: number;
    notes: number;
    lastResetDate: string;
  };
}
