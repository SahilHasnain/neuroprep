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
  createdAt?: string;
  // Optional doubt reference
  doubtContext?: {
    doubtId: string;
    doubtText: string;
  };
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
  // Optional source context
  sourceContext?: {
    type: "question" | "doubt";
    id: string;
    text?: string;
  };
}

// Context Bridge Types for Doubts-Questions Integration

// Question context passed from question generator to doubt system
export interface QuestionContext {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subject: string;
  topic: string;
  difficulty: string;
}

// Doubt context passed from doubt system to question generator
export interface DoubtContext {
  doubtId: string;
  doubtText: string;
  subject: string;
  topic: string;
  difficulty?: string;
}

// Navigation params for ask-doubt screen
export interface AskDoubtScreenParams {
  questionContext?: QuestionContext;
}

// Navigation params for generate-questions modal
export interface GenerateQuestionsParams {
  doubtContext?: DoubtContext;
}

// Context Bridge Types for Notes Integration

// Note context passed from notes to questions/doubts
export interface NoteContext {
  noteId: string;
  noteTitle: string;
  subject: string;
  topic: string;
  noteLength: string;
}

// Question context passed to notes (for generating notes from questions)
export interface QuestionToNoteContext {
  questionSetId?: string;
  subject: string;
  topic: string;
  difficulty: string;
}

// Doubt context passed to notes (for generating notes from doubts)
export interface DoubtToNoteContext {
  doubtId: string;
  doubtText: string;
  subject: string;
  topic: string;
}
