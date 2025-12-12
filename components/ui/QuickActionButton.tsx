import { Text, TouchableOpacity, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { clsx } from "clsx";

interface QuickActionButtonProps {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  label: string;
  description: string;
  onPress: () => void;
}

export default function QuickActionButton({
  icon: Icon,
  bgColor,
  iconColor,
  label,
  description,
  onPress,
}: QuickActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] rounded-xl border-[1px] border-gray-200 p-4 items-center justify-center bg-white mb-4 shadow-sm"
    >
      <View
        className={clsx(
          "w-12 h-12 rounded-full justify-center items-center mb-3",
          bgColor
        )}
      >
        <Icon size={24} color={iconColor} />
      </View>

      <Text className="mb-1 text-base font-semibold text-gray-900">{label}</Text>
      <Text className="text-xs text-gray-500">{description}</Text>
    </TouchableOpacity>
  );
}
