/**
 * Common helper utilities used across the app
 */

/**
 * Generate a unique ID
 * Format: "[prefix]_[timestamp]_[random]"
 */
export const generateUniqueId = (prefix: string = "id"): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Capitalize first letter of a string
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format timestamp to time string
 */
export const formatTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Generate difficulty label map
 */
export const getDifficultyLabel = (difficulty: string): string => {
  const map: Record<string, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };
  return map[difficulty] || "Medium";
};

/**
 * Generate note length label map
 */
export const getNoteLengthLabel = (length: string): string => {
  const map: Record<string, string> = {
    brief: "Brief",
    detailed: "Detailed",
    exam: "Exam Focus",
  };
  return map[length] || "Standard";
};
