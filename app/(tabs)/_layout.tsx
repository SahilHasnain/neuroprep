import { Tabs } from "expo-router";
import {
  House,
  MessageCircleQuestion,
  FileText,
  PencilRuler,
  Crown,
  FolderOpen,
  Layers,
} from "lucide-react-native";
import { isMVPBypassMode } from "@/config/featureFlags";
import { useModalStore } from "@/store/modalStore";

export default function TabsLayout() {
  // Select directly from state to ensure reactivity on modal open/close
  const isAnyModalOpen = useModalStore((state) => state.openModals.size > 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#60a5fa",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          height: 100,
          paddingBottom: 6,
          paddingTop: 6,
          backgroundColor: "#1e1e1e",
          borderTopColor: "#374151",
          display: isAnyModalOpen ? "none" : "flex",
        },
      }}
    >
      {/* Home/ Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />

      {/* Ask doubt */}
      <Tabs.Screen
        name="ask-doubt"
        options={{
          title: "Doubt",
          tabBarIcon: ({ size, color }) => (
            <MessageCircleQuestion size={size} color={color} />
          ),
        }}
      />

      {/* Generate Questions */}
      <Tabs.Screen
        name="generate-questions"
        options={{
          title: "Questions",
          tabBarIcon: ({ size, color }) => (
            <PencilRuler size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />

      {/* Flashcards Tab */}
      <Tabs.Screen
        name="flashcards"
        options={{
          title: "Flashcards",
          tabBarIcon: ({ color, size }) => <Layers size={size} color={color} />,
        }}
      />

      {/* Documents Tab */}
      <Tabs.Screen
        name="documents"
        options={{
          title: "Documents",
          tabBarIcon: ({ color, size }) => (
            <FolderOpen size={size} color={color} />
          ),
        }}
      />

      {/* MVP_BYPASS: START - Subscription tab hidden for MVP launch */}
      {/* To restore: set FEATURE_FLAGS.MVP_BYPASS_MODE = false in config/featureFlags.ts */}
      <Tabs.Screen
        name="subscription"
        options={{
          title: "Pro",
          tabBarIcon: ({ color, size }) => <Crown size={size} color={color} />,
          href: isMVPBypassMode() ? null : undefined,
        }}
      />
      {/* MVP_BYPASS: END */}
    </Tabs>
  );
}
