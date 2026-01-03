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
  onSaveAsFlashcard?: (
    doubtText: string,
    resolution: string,
    subject: string,
    topic: string
  ) => void;
}

export default function ChatBubble({
  message,
  isUser,
  timeStamp,
  doubtContext,
  onGenerateQuestions,
  onGenerateNotes,
  onSaveAsFlashcard,
}: ChatBubbleProps) {
  const showGenerateQuestionsButton =
    !isUser && doubtContext && onGenerateQuestions;
  const showGenerateNotesButton = !isUser && doubtContext && onGenerateNotes;
  const showSaveAsFlashcardButton =
    !isUser && doubtContext && onSaveAsFlashcard;

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

  const handleSaveAsFlashcard = () => {
    if (doubtContext && onSaveAsFlashcard) {
      onSaveAsFlashcard(
        doubtContext.doubtText,
        message,
        doubtContext.subject,
        doubtContext.topic
      );
    }
  };

  return (
    <View className={clsx("mb-4", isUser ? "items-end" : "items-start")}>
      <View
        className={clsx(
          "max-w-[80%] px-4 py-3 rounded-xl",
          isUser
            ? "bg-gradient-to-r from-accent-blue to-accent-purple rounded-tr-sm"
            : "bg-dark-surface-200 rounded-tl-sm border-[1px] border-dark-surface-300"
        )}
      >
        {isUser ? (
          <Text className="text-base text-white">{message}</Text>
        ) : (
          <MathMarkdown
            style={{
              body: { color: "#e5e5e5", fontSize: 15, lineHeight: 22 },
              strong: { color: "#f5f5f5", fontWeight: "bold" },
              em: { color: "#e5e5e5", fontStyle: "italic" },
              code_inline: {
                backgroundColor: "#2a2a2a",
                color: "#60a5fa",
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
                fontFamily: "monospace",
                fontSize: 14,
              },
              blockquote: {
                backgroundColor: "#1e3a8a",
                borderLeftColor: "#3b82f6",
                borderLeftWidth: 3,
                paddingLeft: 10,
                paddingVertical: 6,
                marginVertical: 6,
                borderRadius: 4,
              },
              paragraph: {
                marginVertical: 2,
                color: "#e5e5e5",
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
            className="mt-3 pt-3 border-t border-dark-surface-300"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center py-2 px-3 bg-info-bg rounded-lg border border-info-border">
              <Text className="text-info-text font-medium text-sm mr-1">
                📝
              </Text>
              <Text className="text-info-text font-medium text-sm">
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
            <View className="flex-row items-center justify-center py-2 px-3 bg-success-bg rounded-lg border border-success-border">
              <Text className="text-success-text font-medium text-sm mr-1">
                📚
              </Text>
              <Text className="text-success-text font-medium text-sm">
                Generate Notes on this topic
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {showSaveAsFlashcardButton && (
          <TouchableOpacity
            onPress={handleSaveAsFlashcard}
            className="mt-2"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center py-2 px-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <Text className="text-purple-300 font-medium text-sm mr-1">
                🗂️
              </Text>
              <Text className="text-purple-300 font-medium text-sm">
                Save as Flashcard
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {timeStamp && (
        <Text className="px-1 mt-1 text-xs text-text-tertiary">
          {timeStamp}
        </Text>
      )}
    </View>
  );
}
