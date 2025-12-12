import React from "react";
import { Text, View } from "react-native";

interface StatItem {
  value: string;
  label: string;
  sublabel: string;
  color: string;
}

interface StatsCardProps {
  stats: StatItem[];
}

export default function StatsCard({ stats }: StatsCardProps) {
  return (
    <View className="rounded-xl border-[1px] border-gray-200 bg-white shadow-sm p-6 flex-row items-center justify-between">
      {stats.map((stat, index) => (
        <View key={`stat-${index}`} className="items-center flex-1">
          <Text className={`text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </Text>
          <Text className="mt-1 mb-1 text-sm text-gray-600">{stat.label}</Text>
          <Text className="text-xs text-gray-400">{stat.sublabel}</Text>
          {index < stats.length - 1 && (
            <View className="absolute right-0 w-[1px] h-12 bg-gray-200" />
          )}
        </View>
      ))}
    </View>
  );
}
