import { View, Text } from "react-native";
import { BookOpen } from "lucide-react-native";
import QuestionSetCard from "./QuestionSetCard";
import type { StoredQuestionSet } from "@/lib/types";

interface QuestionSetListProps {
  sets: StoredQuestionSet[];
  onSelect: (set: StoredQuestionSet) => void;
  onDelete: (id: string, label: string) => void;
  loading: boolean;
}

export default function QuestionSetList({
  sets,
  onSelect,
  onDelete,
  loading,
}: QuestionSetListProps) {
  if (loading) {
    return <Text className="mt-8 text-center text-gray-500">Loading...</Text>;
  }

  if (sets.length === 0) {
    return null;
  }

  return (
    <View>
      {sets.map((set) => (
        <QuestionSetCard
          key={set.id}
          set={set}
          onPress={() => onSelect(set)}
          onDelete={() => onDelete(set.id, set.label)}
        />
      ))}
    </View>
  );
}
