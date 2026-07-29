import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTimeline } from "../hooks/useTimeline";

interface Props {
  incidentId: string;
}

const actionIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Incident Created": "add-circle-outline",
  "Investigation Started": "search-outline",
  "Risk Assessment": "analytics-outline",
  "Incident Closed": "checkmark-circle-outline",
  "IT Security Notified": "shield-outline",
  "Access Revoked": "lock-closed-outline",
  "Affected Parties Notified": "people-outline",
  default: "ellipse-outline",
};

export default function Timeline({ incidentId }: Props) {
  const { events, loading } = useTimeline(incidentId);

  if (loading) {
    return <ActivityIndicator size="small" color="#2563eb" className="py-4" />;
  }

  if (events.length === 0) {
    return (
      <View className="py-8">
        <Text className="text-center text-sm text-gray-400">No timeline events yet</Text>
      </View>
    );
  }

  return (
    <View className="py-2">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const icon = actionIcons[event.action] ?? actionIcons.default;
        const time = new Date(event.createdAt).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <View key={event.id} className="flex-row">
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name={icon} size={14} color="#2563eb" />
              </View>
              {!isLast && <View className="w-0.5 flex-1 bg-blue-200" />}
            </View>
            <View className={`ml-3 flex-1 ${isLast ? "" : "mb-6"}`}>
              <Text className="text-sm font-semibold text-gray-900">{event.action}</Text>
              <Text className="text-xs text-gray-500">{event.description}</Text>
              <Text className="mt-0.5 text-xs text-gray-400">{time}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
