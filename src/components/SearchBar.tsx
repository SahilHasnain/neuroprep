import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search incidents..." }: Props) {
  return (
    <View className="mb-4 flex-row items-center rounded-lg border border-gray-300 bg-white px-3 py-2">
      <Ionicons name="search-outline" size={18} color="#9ca3af" />
      <TextInput
        className="ml-2 flex-1 text-sm text-gray-900"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChange}
        clearButtonMode="while-editing"
      />
    </View>
  );
}
