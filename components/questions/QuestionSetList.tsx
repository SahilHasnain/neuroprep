import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { BookOpen, Trash2, ChevronRight } from "lucide-react-native";
import type { StoredQuestionSet } from "@/lib/types";

interface QuestionSetListProps {
  sets: StoredQuestionSet[];
  onSelect: (set: StoredQuestionSet) => void;
  onDelete: (id: string, label: string) => void;
  loading: boolean;
}

export default function QuestionSetList({ sets, onSelect, onDelete, loading }: QuestionSetListProps) {
  const handleDelete = (id: string, label: string) => {
    Alert.alert(
      "Delete Question Set",
      `Delete "${label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(id, label),
        },
      ]
    );
  };

  if (loading) {
    return <Text className="text-center text-gray-500 mt-8">Loading...</Text>;
  }

  if (sets.length === 0) {
    return (
      <View className="items-center justify-center mt-16">
        <BookOpen size={64} color="#d1d5db" />
        <Text className="mt-4 text-lg font-semibold text-gray-400">No saved question sets</Text>
        <Text className="mt-2 text-sm text-gray-400 text-center">
          Generate your first set to get started
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      {sets.map((set) => (
        <TouchableOpacity
          key={set.id}
          onPress={() => onSelect(set)}
          className="mb-3 p-4 bg-white rounded-xl border-[1px] border-gray-200"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {set.label}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {new Date(set.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handleDelete(set.id, set.label)}
                className="p-2"
              >
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
              <ChevronRight size={20} color="#9ca3af" />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
