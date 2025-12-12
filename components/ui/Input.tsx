import clsx from "clsx";
import { Send } from "lucide-react-native";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface InputProps {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  multiline?: boolean;
}

export default function Input({
  value,
  placeholder = "Type your message",
  onChangeText,
  multiline = false,
  onSend,
}: InputProps) {
  return (
    <View className="bg-white border-t-[1px] border-gray-200 px-4 py-3 flex-row items-end">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline={multiline}
        className="flex-1 px-4 py-3 text-base text-gray-900 bg-gray-50 rounded-2xl max-h-24"
        style={{
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
      <TouchableOpacity
        onPress={onSend}
        className={clsx(
          "items-center justify-center w-10 h-10 rounded-full ml-2",
          value.trim() ? "bg-blue-500" : "bg-gray-200"
        )}
      >
        <Send size={18} color={value.trim() ? "#ffffff" : "#9ca3af"} />
      </TouchableOpacity>
    </View>
  );
}
