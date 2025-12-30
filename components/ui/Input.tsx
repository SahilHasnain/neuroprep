import clsx from "clsx";
import { Send } from "lucide-react-native";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
    <View className="bg-dark-surface-100 border-t-[1px] border-dark-surface-300 px-4 py-3 flex-row items-end">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        multiline={multiline}
        className="flex-1 px-4 py-3 text-base text-text-secondary bg-dark-surface-200 border border-dark-surface-300 rounded-2xl max-h-24"
        style={{
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
      {value.trim() ? (
        <TouchableOpacity
          onPress={onSend}
          className="ml-2 overflow-hidden rounded-full"
        >
          <LinearGradient
            colors={["#3b82f6", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="items-center justify-center w-10 h-10"
          >
            <Send size={18} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onSend}
          className="items-center justify-center w-10 h-10 ml-2 rounded-full bg-dark-surface-300"
        >
          <Send size={18} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}
