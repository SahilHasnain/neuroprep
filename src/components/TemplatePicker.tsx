import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTemplates } from "../hooks/useTemplates";
import type { IncidentCategory } from "../types";

interface Props {
  selectedCategory: IncidentCategory | null;
  onSelect: (fields: { description: string; checklist: string[] }) => void;
}

export default function TemplatePicker({ selectedCategory, onSelect }: Props) {
  const { templates, loading } = useTemplates();
  const [expanded, setExpanded] = useState(false);

  const filtered = templates.filter((t) => t.category === selectedCategory);

  if (loading || filtered.length === 0) return null;

  return (
    <View className="mb-4">
      <TouchableOpacity onPress={() => setExpanded(!expanded)} className="flex-row items-center gap-1">
        <Text className="text-sm font-medium text-blue-600">
          {expanded ? "Hide templates" : "Use a template"}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView horizontal className="mt-2" showsHorizontalScrollIndicator={false}>
          {filtered.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => {
                onSelect({ description: t.defaultDescription, checklist: t.checklistItems });
                setExpanded(false);
              }}
              className="mr-3 rounded-lg border border-blue-200 bg-blue-50 p-3"
            >
              <Text className="text-sm font-semibold text-blue-900">{t.title}</Text>
              <Text className="mt-1 text-xs text-blue-700" numberOfLines={2}>
                {t.riskGuide}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
