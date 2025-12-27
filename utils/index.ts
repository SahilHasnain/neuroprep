/**
 * Central exports for all utility functions
 * Import from "@/utils" in screens/components
 */

// Identity utilities
export * from "./identity";

// Storage utilities (re-export from services)
export * from "@/services/storage/questions.storage";
export * from "@/services/storage/notes.storage";
export * from "@/services/storage/doubts.storage";

// Helper functions
export * from "./helpers";

// Formatters
export * from "./formatters";

// Doubt history manager
export * from "./doubtHistoryManager";
