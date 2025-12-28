import clsx from "clsx";
import { Text, View, TouchableOpacity } from "react-native";
import MathMarkdown from "@/components/shared/MathMarkdown";
import type { DoubtContext, DoubtToNoteContext } from "@/lib/types";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timeStamp?: string;
  doubtContext?: DoubtContext;
  onGenerateQuestions?: (context: DoubtContext) => void;
  onGenerateNotes?: (context: DoubtToNoteContext) => void;
}

export default function ChatBubble({
  message,
  isUser,
  timeStamp,
  doubtContext,
  onGenerateQuestions,
  onGenerateNotes,
}: ChatBubbleProps) {
  const showGenerateQuestionsButton =
    !isUser && doubtContext && onGenerateQuestions;
  const showGenerateNotesButton = !isUser && doubtContext && onGenerateNotes;

  const handleGenerateNotes = () => {
    if (doubtContext && onGenerateNotes) {
      const noteContext: DoubtToNoteContext = {
        doubtId: doubtContext.doubtId,
        doubtText: doubtContext.doubtText,
        subject: doubtContext.subject,
        topic: doubtContext.topic,
      };
      onGenerateNotes(noteContext);
    }
  };

  return (
    <View className={clsx("mb-4", isUser ? "items-end" : "items-start")}>
      <View
        className={clsx(
          "max-w-[80%] px-4 py-3 rounded-xl",
          isUser
            ? "bg-blue-500 rounded-tr-sm"
            : "bg-gray-100 rounded-tl-sm border-[1px] border-gray-200"
        )}
      >
        {isUser ? (
          <Text className="text-base text-white">{message}</Text>
        ) : (
          <MathMarkdown
            style={{
              body: { color: "#111827", fontSize: 15, lineHeight: 22 },
              strong: { color: "#1f2937", fontWeight: "bold" },
              em: { color: "#374151", fontStyle: "italic" },
              code_inline: {
                backgroundColor: "#e5e7eb",
                color: "#dc2626",
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 14,
              },
              blockquote: {
                backgroundColor: "#dbeafe",
                borderLeftColor: "#3b82f6",
                borderLeftWidth: 3,
                paddingLeft: 10,
                paddingVertical: 6,
                marginVertical: 6,
                borderRadius: 4,
              },
              paragraph: {
                marginVertical: 2,
                color: "#111827",
                lineHeight: 20,
              },
            }}
          >
            {message}
          </MathMarkdown>
        )}

        {showGenerateQuestionsButton && (
          <TouchableOpacity
            onPress={() => onGenerateQuestions(doubtContext)}
            className="mt-3 pt-3 border-t border-gray-200"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
              <Text className="text-blue-600 font-medium text-sm mr-1">📝</Text>
              <Text className="text-blue-600 font-medium text-sm">
                Generate Questions on this topic
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {showGenerateNotesButton && (
          <TouchableOpacity
            onPress={handleGenerateNotes}
            className="mt-2"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center py-2 px-3 bg-green-50 rounded-lg border border-green-200">
              <Text className="text-green-600 font-medium text-sm mr-1">
                📚
              </Text>
              <Text className="text-green-600 font-medium text-sm">
                Generate Notes on this topic
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {timeStamp && (
        <Text className="px-1 mt-1 text-xs text-gray-400">{timeStamp}</Text>
      )}
    </View>
  );
}
