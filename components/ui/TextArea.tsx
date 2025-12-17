import { Text, TextInput, View } from "react-native";

interface TextAreaProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  numberOfLines?: number;
}

export default function TextArea({
  label,
  value,
  onChangeText,
  placeholder = "",
  numberOfLines = 6,
}: TextAreaProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-gray-700">{label}</Text>
      <TextInput
        className="px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-xl"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        style={{ minHeight: numberOfLines * 24 }}
      />
    </View>
  );
}
