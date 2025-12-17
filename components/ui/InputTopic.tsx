import { Text, TextInput, View } from "react-native";

interface InputTopicProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function InputTopic({
  label,
  value,
  onChangeText,
  placeholder = "",
}: InputTopicProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-gray-700">{label}</Text>
      <TextInput
        className="px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-xl"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}
