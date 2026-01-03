module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|zustand)/)",
  ],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  collectCoverageFrom: [
    "store/**/*.ts",
    "services/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};
