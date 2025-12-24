/**
 * Feature Flags Configuration
 *
 * MVP_BYPASS_MODE: Controls whether the app operates in MVP bypass mode
 * - When true: All users are treated as guests, auth/subscription UI hidden, generous limits applied
 * - When false: Full auth and subscription functionality enabled
 *
 * To restore full functionality post-MVP launch:
 * 1. Set MVP_BYPASS_MODE to false
 * 2. Rebuild the app
 * 3. All hidden features will automatically reappear
 */

export const FEATURE_FLAGS = {
  MVP_BYPASS_MODE: true, // Set to false to restore full functionality
};

/**
 * MVP Limits Configuration
 *
 * Generous daily limits for MVP launch to attract users and showcase features
 * These limits apply to all users when MVP_BYPASS_MODE is enabled
 */
export const MVP_LIMITS = {
  doubts: 1000,
  questions: 1000,
  notes: 1000,
  maxQuestions: 1000,
  allowedDifficulties: ["easy", "medium", "hard"] as const,
  allowedNoteLengths: ["brief", "detailed", "exam"] as const,
};

/**
 * Helper function to check if app is in MVP bypass mode
 * @returns {boolean} True if MVP bypass mode is enabled
 */
export const isMVPBypassMode = (): boolean => {
  return FEATURE_FLAGS.MVP_BYPASS_MODE;
};

/**
 * Helper function to get MVP limits configuration
 * @returns {typeof MVP_LIMITS} MVP limits object
 */
export const getMVPLimits = () => {
  return MVP_LIMITS;
};

/**
 * Type definitions for better TypeScript support
 */
export type MVPLimitsType = typeof MVP_LIMITS;
export type DifficultyLevel = (typeof MVP_LIMITS.allowedDifficulties)[number];
export type NoteLength = (typeof MVP_LIMITS.allowedNoteLengths)[number];
