/**
 * Appwrite Configuration
 * Environment variables for Appwrite SDK
 */

export const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = "YOUR_PROJECT_ID"; // Replace with actual project ID
export const APPWRITE_DATABASE_ID = "YOUR_DATABASE_ID"; // Replace with actual database ID

// Add more config as needed
export const APPWRITE_CONFIG = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: APPWRITE_DATABASE_ID,
} as const;
