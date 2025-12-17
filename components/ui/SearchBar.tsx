import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <View className="flex-row items-center px-4 py-3 mb-4 bg-white border border-gray-300 rounded-xl">
      <Search size={20} color="#9ca3af" />
      <TextInput
        className="flex-1 ml-2 text-base text-gray-900"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}
