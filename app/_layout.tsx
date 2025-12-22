import { Stack } from "expo-router";
import { useCallback, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { usePlanStore } from "@/store/planStore";
import "./globals.css";

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fetchPlanStatus } = usePlanStore();

  useEffect(() => {
    fetchPlanStatus();
  }, []);
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
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
          animation: "fade",
        }}
      />
    </SafeAreaProvider>
  );
}
