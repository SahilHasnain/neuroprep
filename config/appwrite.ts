/**
 * Appwrite Configuration
 * Environment variables for Appwrite SDK
 */

export const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
export const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
export const APPWRITE_DATABASE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
export const APPWRITE_NOTES_TABLE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_NOTES_TABLE_ID;
export const APPWRITE_QUESTIONS_TABLE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_QUESTIONS_TABLE_ID;
export const APPWRITE_DOUBTS_TABLE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DOUBTS_TABLE_ID;

// Add more config as needed
export const APPWRITE_CONFIG = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: APPWRITE_DATABASE_ID,
  notesTableId: APPWRITE_NOTES_TABLE_ID,
  questionsTableId: APPWRITE_QUESTIONS_TABLE_ID,
  doubtsTableId: APPWRITE_DOUBTS_TABLE_ID,
} as const;
