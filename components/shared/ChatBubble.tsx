import clsx from "clsx";
import { Text, View } from "react-native";

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
        <Text
          className={clsx("text-base", isUser ? "text-white" : "text-gray-900")}
        >
          {message}
        </Text>
      </View>

      {timeStamp && (
        <Text className="px-1 mt-1 text-xs text-gray-400">{timeStamp}</Text>
      )}
    </View>
  );
}
