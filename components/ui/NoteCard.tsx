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
  const subjectColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    physics: {
      bg: "bg-accent-blue/20",
      text: "text-accent-blue-light",
      border: "border-accent-blue/30",
    },
    chemistry: {
      bg: "bg-accent-purple/20",
      text: "text-accent-purple-light",
      border: "border-accent-purple/30",
    },
    biology: {
      bg: "bg-accent-green/20",
      text: "text-accent-green-light",
      border: "border-accent-green/30",
    },
    mathematics: {
      bg: "bg-accent-orange/20",
      text: "text-accent-orange-light",
      border: "border-accent-orange/30",
    },
  };

  const colors = subjectColors[subject.toLowerCase()] || {
    bg: "bg-dark-surface-300",
    text: "text-text-tertiary",
    border: "border-dark-surface-300",
  };

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 overflow-hidden bg-dark-surface-100 border border-dark-surface-300 rounded-2xl active:opacity-70"
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text
              className="mb-1 text-lg font-bold text-text-primary"
              numberOfLines={1}
            >
              {title}
            </Text>
            <View
              className={`self-start px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}
            >
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
            className="p-2 rounded-full active:bg-error-bg"
          >
            <Trash2 size={20} color="#ef4444" />
          </Pressable>
        </View>

        <Text
          className="mb-3 text-sm leading-5 text-text-secondary"
          numberOfLines={3}
        >
          {content}
        </Text>

        <View className="flex-row items-center pt-2 border-t border-dark-surface-300">
          <Calendar size={14} color="#9ca3af" />
          <Text className="ml-1.5 text-xs text-text-tertiary">{date}</Text>
        </View>
      </View>
    </Pressable>
  );
}
