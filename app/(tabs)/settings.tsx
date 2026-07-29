import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMode } from "../../src/hooks/useMode";
import { useAuth } from "../../src/hooks/useAuth";
import { useIncidents, FREE_TIER_LIMIT } from "../../src/hooks/useIncidents";

export default function SettingsScreen() {
  const { mode } = useMode();
  const { user, logout } = useAuth();
  const { incidents } = useIncidents();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e.message);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-4 pb-4 pt-4">
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-white/20 p-2">
            <Ionicons name="settings-outline" size={24} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white">Settings</Text>
        </View>
        <Text className="mt-2 text-sm text-blue-100">
          App preferences and account management.
        </Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        {user && (
          <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Text className="text-base font-bold text-blue-600">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-900">{user.name || "User"}</Text>
                <Text className="text-xs text-gray-500">{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <Text className="mb-2 text-lg font-semibold text-gray-900">Plan</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Free Tier</Text>
            <View className="rounded-full bg-blue-100 px-3 py-0.5">
              <Text className="text-xs font-medium text-blue-700">
                {incidents.length} / {FREE_TIER_LIMIT} incidents
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <Text className="mb-2 text-lg font-semibold text-gray-900">About</Text>
          <Text className="text-sm text-gray-500">complyDesk v1.0.0</Text>
          <Text className="text-sm text-gray-500">Compliance Incident Tracker</Text>
          {mode === "demo" && (
            <Text className="mt-2 text-xs text-gray-400">Mode: Demo (offline data)</Text>
          )}
        </View>

        <View className="flex-1" />

        <TouchableOpacity
          onPress={handleLogout}
          className="mb-6 rounded-lg bg-red-500 py-3"
        >
          <Text className="text-center font-semibold text-white">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
