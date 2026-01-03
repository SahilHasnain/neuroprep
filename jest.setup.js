// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock identity utility
jest.mock("@/utils/identity", () => ({
  getIdentity: jest.fn().mockResolvedValue({
    type: "user",
    id: "test-user-id",
  }),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const View = require("react-native").View;
  return {
    default: {
      createAnimatedComponent: (component) => component,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    interpolate: jest.fn((value, input, output) => output[0]),
    Easing: {
      bezier: jest.fn(),
    },
  };
});

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
