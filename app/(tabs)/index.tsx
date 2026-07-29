import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIncidents } from "../../src/hooks/useIncidents";

export default function DashboardScreen() {
  const { incidents, loading } = useIncidents();

  const counts = {
    open: incidents.filter((i) => i.status === "open").length,
    closed: incidents.filter((i) => i.status === "closed").length,
    sar: incidents.filter((i) => i.category === "SAR").length,
    foi: incidents.filter((i) => i.category === "FOI").length,
    overdue: incidents.filter((i) => i.status !== "closed" && i.status !== "archived").length,
  };

  const cards = [
    { label: "Open Incidents", value: counts.open, color: "#f59e0b" },
    { label: "Closed Incidents", value: counts.closed, color: "#10b981" },
    { label: "SAR Requests", value: counts.sar, color: "#3b82f6" },
    { label: "FOI Requests", value: counts.foi, color: "#8b5cf6" },
    { label: "Overdue", value: counts.overdue, color: "#ef4444" },
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-4 pb-4 pt-4">
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-white/20 p-2">
            <Ionicons name="grid-outline" size={24} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white">Dashboard</Text>
        </View>
        <Text className="mt-2 text-sm text-blue-100">
          Overview of your compliance incidents at a glance.
        </Text>
      </View>
      <View className="flex-row flex-wrap justify-between px-4 pt-4">
        {cards.map((card) => (
          <View
            key={card.label}
            className="mb-4 w-[48%] rounded-xl bg-white p-4 shadow-sm"
            style={{ borderLeftWidth: 4, borderLeftColor: card.color }}
          >
            <Text className="text-sm text-gray-500">{card.label}</Text>
            <Text className="mt-1 text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
