import { clsx } from "clsx";
import { Text, View } from "react-native";

interface statItem {
  value: string;
  label: string;
  sublabel: string;
  color: string;
}

interface statsCardProps {
  stats: statItem[];
}

export default function StatsCard({ stats }: statsCardProps) {
  return (
    <View className="flex flex-row p-6 bg-white rounded-xl border-[1px] border-gray-200">
      {stats.map((stat, index) => (
        <View key={`stat-${index}`} className="items-center flex-1">
          <Text className={clsx("mb-1 text-2xl font-bold", stat.color)}>
            {stat.value}
          </Text>
          <Text className="text-sm text-gray-600">{stat.label}</Text>
          <Text className="text-xs text-gray-400">{stat.sublabel}</Text>

          {index < stats.length - 1 && (
            <View className="w-[1px] h-12 bg-gray-200 absolute right-0 top-2" />
          )}
        </View>
      ))}
    </View>
  );
}
