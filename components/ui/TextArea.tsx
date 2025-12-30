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
      <Text className="mb-2 text-sm font-semibold text-gray-300">{label}</Text>
      <TextInput
        className="px-4 py-3 text-base text-text-secondary bg-dark-surface-100 border border-dark-surface-300 rounded-xl"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        style={{ minHeight: numberOfLines * 24 }}
      />
    </View>
  );
}
