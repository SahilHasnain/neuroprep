import { Tabs } from "expo-router";
import {
  House,
  MessageCircleQuestion,
  FileText,
  PencilRuler,
  Crown,
} from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          height: 100,
          paddingBottom: 6,
          paddingTop: 6,
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
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

      <Tabs.Screen
        name="subscription"
        options={{
          title: "Pro",
          tabBarIcon: ({ color, size }) => <Crown size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
