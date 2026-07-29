import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ModeProvider } from "../src/context/ModeContext";
import ErrorBoundary from "../src/components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ModeProvider>
        <StatusBar style="auto" />
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="incident/create" options={{ presentation: "modal" }} />
            <Stack.Screen name="incident/[id]" />
          </Stack>
        </SafeAreaView>
      </ModeProvider>
    </ErrorBoundary>
  );
}
