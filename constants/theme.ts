/**
 * Centralized Theme Configuration
 * All colors, gradients, and theme-related constants
 */

export const COLORS = {
  // Primary Colors
  primary: {
    blue: "#2563eb",
    purple: "#9333ea",
    darkBlue: "#1d4ed8",
  },

  // Accent Colors
  accent: {
    gold: "#fbbf24",
    orange: "#f59e0b",
    darkOrange: "#d97706",
    green: "#16a34a",
    darkGreen: "#15803d",
  },

  // Background Colors
  background: {
    primary: "#121212",
    secondary: "#1e1e1e",
    tertiary: "#0a0a0a",
    card: "#1e1e1e",
  },

  // Border Colors
  border: {
    default: "#374151", // gray-700
    light: "#4b5563", // gray-600
    blue: "#3b82f6",
  },

  // Text Colors
  text: {
    primary: "#ffffff",
    secondary: "#d1d5db", // gray-300
    tertiary: "#9ca3af", // gray-400
    muted: "#6b7280", // gray-500
  },

  // Status Colors
  status: {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
} as const;

export const GRADIENTS = {
  // Primary Gradients
  primary: ["#2563eb", "#9333ea"],
  primaryButton: ["#2563eb", "#1d4ed8"],

  // Accent Gradients
  gold: ["#fbbf24", "#f59e0b", "#d97706"],
  green: ["#16a34a", "#15803d"],

  // Background Gradients
  darkBackground: ["#0a0a0a", "#1a1a1a"],

  // Progress/Status Gradients
  progress: ["#2563eb", "#3b82f6"],
} as const;

export const GRADIENT_CONFIG = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

export const THEME = {
  colors: COLORS,
  gradients: GRADIENTS,
  gradientConfig: GRADIENT_CONFIG,
} as const;

export default THEME;
