import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChecklist } from "../hooks/useChecklist";
import type { IncidentCategory } from "../types";

interface Props {
  incidentId: string;
  category: IncidentCategory;
}

export default function Checklist({ incidentId, category }: Props) {
  const { items, loading, toggle } = useChecklist(incidentId, category);

  if (loading) {
    return <ActivityIndicator size="small" color="#2563eb" className="py-4" />;
  }

  if (items.length === 0) return null;

  return (
    <View>
      <Text className="mb-2 text-base font-semibold text-gray-900">Checklist</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => toggle(item.id)}
          className="mb-2 flex-row items-center rounded-lg bg-gray-50 p-3"
        >
          <Ionicons
            name={item.completed ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={item.completed ? "#10b981" : "#9ca3af"}
          />
          <Text
            className={`ml-3 text-sm ${item.completed ? "text-gray-400 line-through" : "text-gray-900"}`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
