import clsx from "clsx";
import { Text, View } from "react-native";
import MathMarkdown from "@/components/shared/MathMarkdown";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timeStamp?: string;
}

export default function ChatBubble({
  message,
  isUser,
  timeStamp,
}: ChatBubbleProps) {
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
      </View>

      {timeStamp && (
        <Text className="px-1 mt-1 text-xs text-gray-400">{timeStamp}</Text>
      )}
    </View>
  );
}
