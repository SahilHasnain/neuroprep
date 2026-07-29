import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { categories } from "../data/mock/categories";
import TemplatePicker from "./TemplatePicker";
import KeyboardSpacer from "./KeyboardSpacer";
import type { Incident, IncidentCategory } from "../types";

interface Props {
  onSubmit: (data: Omit<Incident, "id" | "createdAt" | "updatedAt">) => void;
  initial?: Partial<Incident>;
}

export default function IncidentForm({ onSubmit, initial }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<IncidentCategory | null>(initial?.category ?? null);
  const [reporter, setReporter] = useState(initial?.reporter ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [severity, setSeverity] = useState(initial?.severity ?? "medium");
  const [owner, setOwner] = useState(initial?.owner ?? "");

  const handleSubmit = () => {
    if (!title.trim() || !category || !reporter.trim()) return;
    onSubmit({
      title: title.trim(),
      date: new Date().toISOString().split("T")[0],
      category,
      reporter: reporter.trim(),
      description: description.trim(),
      severity,
      status: "open",
      owner: owner.trim(),
    });
  };

  const isValid = title.trim() && category && reporter.trim();

  return (
    <View className="flex-1">
      <ScrollView ref={scrollRef} className="flex-1 bg-transparent p-4" keyboardShouldPersistTaps="handled">
        <Text className="mb-1 text-sm font-medium text-gray-700">Title *</Text>
        <TextInput
          className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-3"
          placeholder="e.g. Email sent to wrong person"
          value={title}
          onChangeText={setTitle}
        />

        <Text className="mb-1 text-sm font-medium text-gray-700">Category *</Text>
        <View className="mb-4 flex-row flex-wrap gap-2">
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 ${category === c ? "bg-blue-600" : "bg-gray-100"}`}
            >
              <Text className={`text-sm ${category === c ? "text-white" : "text-gray-700"}`}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {category && (
          <TemplatePicker
            selectedCategory={category}
            onSelect={(fields) => {
              if (fields.description) setDescription(fields.description);
            }}
          />
        )}

        <Text className="mb-1 text-sm font-medium text-gray-700">Reporter *</Text>
        <TextInput
          className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-3"
          placeholder="Name of person reporting"
          value={reporter}
          onChangeText={setReporter}
        />

        <Text className="mb-1 text-sm font-medium text-gray-700">Description</Text>
        <TextInput
          className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-3"
          placeholder="Describe what happened..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
        />

        <Text className="mb-1 text-sm font-medium text-gray-700">Severity</Text>
        <View className="mb-4 flex-row gap-2">
          {(["low", "medium", "high", "critical"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSeverity(s)}
              className={`flex-1 rounded-lg py-2 ${severity === s ? "bg-blue-600" : "bg-gray-100"}`}
            >
              <Text className={`text-center text-sm capitalize ${severity === s ? "text-white" : "text-gray-700"}`}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mb-1 text-sm font-medium text-gray-700">Owner</Text>
        <TextInput
          className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-3"
          placeholder="Person responsible"
          value={owner}
          onChangeText={setOwner}
          onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isValid}
          className={`mb-8 rounded-lg py-3 ${isValid ? "bg-blue-600" : "bg-gray-300"}`}
        >
          <Text className="text-center font-semibold text-white">
            {initial ? "Update Incident" : "Create Incident"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <KeyboardSpacer topSpacing={80} />
    </View>
  );
}
