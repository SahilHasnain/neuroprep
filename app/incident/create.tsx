import { View, Text, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import IncidentForm from "../../src/components/IncidentForm";
import { useIncidents, FREE_TIER_LIMIT } from "../../src/hooks/useIncidents";
import { useMode } from "../../src/hooks/useMode";
import { demoService } from "../../src/services/demo";
import { appwriteService } from "../../src/services/appwrite";
import type { Incident } from "../../src/types";

export default function CreateIncidentScreen() {
  const { mode } = useMode();
  const { incidents, create } = useIncidents();

  const handleSubmit = async (data: Omit<Incident, "id" | "createdAt" | "updatedAt">) => {
    if (mode === "appwrite" && incidents.length >= FREE_TIER_LIMIT) {
      Alert.alert("Free tier limit", `You've reached the limit of ${FREE_TIER_LIMIT} incidents. Upgrade to create more.`);
      return;
    }
    const created = await create(data);
    if (created) {
      const timelineData = {
        incidentId: created.id,
        action: "Incident Created",
        description: `Incident reported by ${created.reporter}`,
      };
      if (mode === "demo") {
        await demoService.addTimelineEvent(timelineData);
      } else {
        await appwriteService.addTimelineEvent(timelineData);
      }
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-4 pb-8 pt-4">
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-white/20 p-2">
            <Ionicons name="shield-checkmark" size={24} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white">Report an Incident</Text>
        </View>
        <Text className="mt-2 text-sm text-blue-100">
          Help us keep things in check — every report makes a difference.
        </Text>
      </View>
      <IncidentForm onSubmit={handleSubmit} />
    </View>
  );
}
