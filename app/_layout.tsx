import { Stack, useRouter, useSegments } from "expo-router";
import { useCallback, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { usePlanStore } from "@/store/planStore";
import { isMVPBypassMode } from "@/config/featureFlags";
import "./globals.css";

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fetchPlanStatus } = usePlanStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    fetchPlanStatus();
  }, []);

  // MVP_BYPASS: START - Redirect subscription deep links to home
  // To restore: Remove this useEffect when MVP_BYPASS_MODE is disabled
  useEffect(() => {
    if (isMVPBypassMode()) {
      const currentPath = segments.join("/");
      if (currentPath.includes("subscription")) {
        router.replace("/");
      }
    }
  }, [segments]);
  // MVP_BYPASS: END
  // // Load custom fonts
  // const [fontsLoaded] = useFonts({
  //   InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
  //   InterMedium: require("../assets/fonts/Inter-Medium.ttf"),
  //   InterSemiBold: require("../assets/fonts/Inter-SemiBold.ttf"),
  //   InterBold: require("../assets/fonts/Inter-Bold.ttf"),
  // });

  // const onLayoutRootView = useCallback( async () => {
  //   if(fontsLoaded)
  //     await SplashScreen.hideAsync();
  // }, [fontsLoaded])

  // useEffect(() => {
  //   if(fontsLoaded)
  //     onLayoutRootView();
  // }, [fontsLoaded, onLayoutRootView])

  // if(!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#121212" },
            animation: "fade",
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
