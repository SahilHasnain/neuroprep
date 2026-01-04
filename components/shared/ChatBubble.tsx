import clsx from "clsx";
import { Text, View, TouchableOpacity } from "react-native";
import { Sparkles } from "lucide-react-native";
import MathMarkdown from "@/components/shared/MathMarkdown";
import type { DoubtContext } from "@/lib/types";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timeStamp?: string;
  doubtContext?: DoubtContext;
  onOpenConnectionPanel?: (context: DoubtContext) => void;
}

export default function ChatBubble({
  message,
  isUser,
  timeStamp,
  doubtContext,
  onOpenConnectionPanel,
}: ChatBubbleProps) {
  const showConnectionPanel = !isUser && doubtContext && onOpenConnectionPanel;

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

        {/* Connection Panel Button */}
        {showConnectionPanel && (
          <TouchableOpacity
            onPress={() => onOpenConnectionPanel(doubtContext)}
            className="mt-3 pt-3 border-t border-dark-surface-300"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center py-2.5 px-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/40">
              <Sparkles size={16} color="#60a5fa" />
              <Text className="text-blue-300 font-semibold text-sm ml-2">
                Connect & Create More
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
