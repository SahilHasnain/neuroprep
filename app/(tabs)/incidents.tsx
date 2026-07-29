import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useIncidents, FREE_TIER_LIMIT } from "../../src/hooks/useIncidents";
import SearchBar from "../../src/components/SearchBar";

const severityColors: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

const statusColors: Record<string, string> = {
  open: "#f59e0b",
  investigating: "#3b82f6",
  pending: "#8b5cf6",
  closed: "#10b981",
  archived: "#6b7280",
};

export default function IncidentsScreen() {
  const { incidents, loading, refetch } = useIncidents();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filtered = incidents.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.reporter.toLowerCase().includes(q) ||
      i.owner.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerClassName="pb-24"
        ListHeaderComponent={
          <View>
            <View className="bg-blue-600 pb-4 pt-4">
              <View className="flex-row items-center gap-3 px-4">
                <View className="rounded-full bg-white/20 p-2">
                  <Ionicons name="warning-outline" size={24} color="white" />
                </View>
                <Text className="text-2xl font-bold text-white">Incidents</Text>
              </View>
              <Text className="mt-2 px-4 text-sm text-blue-100">
                Track and manage all reported compliance incidents.
              </Text>
            </View>
            <View className="px-4 pt-3">
              <SearchBar value={search} onChange={setSearch} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/incident/${item.id}`)}
            className="mx-4 mb-3 rounded-xl bg-white p-4 shadow-sm"
          >
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-base font-semibold text-gray-900" numberOfLines={1}>
                {item.title}
              </Text>
              <View
                className="ml-2 rounded-full px-2 py-0.5"
                style={{ backgroundColor: severityColors[item.severity] + "20" }}
              >
                <Text className="text-xs font-medium" style={{ color: severityColors[item.severity] }}>
                  {item.severity}
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-sm text-gray-500" numberOfLines={2}>
              {item.description}
            </Text>
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-xs text-gray-400">{item.date}</Text>
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: statusColors[item.status] + "20" }}
              >
                <Text className="text-xs font-medium" style={{ color: statusColors[item.status] }}>
                  {item.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="mx-4 mt-20 items-center px-6">
            <Ionicons name="shield-checkmark-outline" size={64} color="#d1d5db" />
            <Text className="mt-4 text-lg font-semibold text-gray-500">
              {search ? "No matching incidents" : "No incidents yet"}
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-400">
              {search
                ? "Try a different search term"
                : "Stay ahead of compliance risks. Report your first incident now."}
            </Text>
            {!search && (
              <TouchableOpacity
                onPress={() => router.push("/incident/create")}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-3"
              >
                <Text className="font-semibold text-white">Report an Incident</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => router.push("/incident/create")}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
