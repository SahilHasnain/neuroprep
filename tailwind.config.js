/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        dark: {
          bg: {
            primary: "#0a0a0a", // Main app background
            secondary: "#121212", // Secondary surfaces
            tertiary: "#1a1a1a", // Elevated surfaces
          },
          surface: {
            100: "#1e1e1e", // Card backgrounds
            200: "#252525", // Elevated cards
            300: "#2a2a2a", // Hover states
          },
        },

        // Text colors
        text: {
          primary: "#f5f5f5", // Main text
          secondary: "#e5e5e5", // Secondary text
          tertiary: "#9ca3af", // Muted text
          disabled: "#6b7280", // Disabled text
        },

        // Accent colors (calming palette)
        accent: {
          blue: {
            light: "#60a5fa", // Lighter blue for highlights
            DEFAULT: "#3b82f6", // Primary blue
            dark: "#2563eb", // Darker blue for depth
          },
          purple: {
            light: "#c084fc",
            DEFAULT: "#a855f7",
            dark: "#9333ea",
          },
          green: {
            light: "#4ade80",
            DEFAULT: "#22c55e",
            dark: "#16a34a",
          },
          orange: {
            light: "#fb923c",
            DEFAULT: "#f97316",
            dark: "#ea580c",
          },
        },

        // Semantic colors
        success: {
          bg: "#064e3b",
          text: "#6ee7b7",
          border: "#10b981",
        },
        error: {
          bg: "#7f1d1d",
          text: "#fca5a5",
          border: "#ef4444",
        },
        warning: {
          bg: "#78350f",
          text: "#fcd34d",
          border: "#f59e0b",
        },
        info: {
          bg: "#1e3a8a",
          text: "#93c5fd",
          border: "#3b82f6",
        },
      },
      backgroundImage: {
        // Primary gradients
        "gradient-blue": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        "gradient-purple": "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
        "gradient-green": "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        "gradient-orange": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",

        // Multi-color gradients
        "gradient-primary": "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        "gradient-success": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-warm": "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",

        // Subtle background gradients
        "gradient-dark": "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)",
        "gradient-surface": "linear-gradient(135deg, #1e1e1e 0%, #252525 100%)",
      },
    },
  },
  plugins: [],
};
