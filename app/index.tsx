import { Redirect } from "expo-router";
import { useMode } from "../src/hooks/useMode";

export default function Index() {
  const { mode } = useMode();

  if (mode === "appwrite") {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
