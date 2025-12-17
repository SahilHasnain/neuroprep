import { BookOpen, Calendar, Trash2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface NoteCardProps {
  title: string;
  subject: string;
  content: string;
  date: string;
  onPress: () => void;
  onDelete: () => void;
}

export default function NoteCard({
  title,
  subject,
  content,
  date,
  onPress,
  onDelete,
}: NoteCardProps) {
  const subjectColors: Record<string, { bg: string; text: string }> = {
    physics: { bg: "bg-blue-100", text: "text-blue-700" },
    chemistry: { bg: "bg-purple-100", text: "text-purple-700" },
    biology: { bg: "bg-green-100", text: "text-green-700" },
    mathematics: { bg: "bg-orange-100", text: "text-orange-700" },
  };

  const colors = subjectColors[subject.toLowerCase()] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 overflow-hidden bg-white border border-gray-200 rounded-2xl active:opacity-70"
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text
              className="mb-1 text-lg font-bold text-gray-900"
              numberOfLines={1}
            >
              {title}
            </Text>
            <View className={`self-start px-3 py-1 rounded-full ${colors.bg}`}>
              <Text className={`text-xs font-semibold ${colors.text}`}>
                {subject}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-full active:bg-red-50"
          >
            <Trash2 size={20} color="#ef4444" />
          </Pressable>
        </View>

        <Text
          className="mb-3 text-sm leading-5 text-gray-600"
          numberOfLines={3}
        >
          {content}
        </Text>

        <View className="flex-row items-center pt-2 border-t border-gray-100">
          <Calendar size={14} color="#9ca3af" />
          <Text className="ml-1.5 text-xs text-gray-500">{date}</Text>
        </View>
      </View>
    </Pressable>
  );
}
