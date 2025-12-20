import React from "react";
import { View, Text } from "react-native";
import { clsx } from "clsx";

interface FeatureItemProps {
  text: string;
  included: boolean;
  highlighted?: boolean;
}

export function FeatureItem({
  text,
  included,
  highlighted = false,
}: FeatureItemProps) {
  return (
    <View className="flex-row items-start mb-3">
      <View
        className={clsx(
          "w-5 h-5 rounded-full items-center justify-center mr-3 mt-0.5",
          included ? "bg-green-100" : "bg-gray-100"
        )}
      >
        <Text className={clsx(included ? "text-green-600" : "text-gray-400")}>
          {included ? "✓" : "✕"}
        </Text>
      </View>
      <Text
        className={clsx(
          "flex-1 text-base",
          highlighted && "font-semibold",
          included ? "text-gray-800" : "text-gray-400"
        )}
      >
        {text}
      </Text>
    </View>
  );
}

interface FeatureListProps {
  features: Array<{
    text: string;
    freeIncluded: boolean;
    proIncluded: boolean;
    highlighted?: boolean;
  }>;
  planType: "free" | "pro";
}

export default function FeatureList({ features, planType }: FeatureListProps) {
  return (
    <View>
      {features.map((feature, index) => (
        <FeatureItem
          key={index}
          text={feature.text}
          included={
            planType === "free" ? feature.freeIncluded : feature.proIncluded
          }
          highlighted={feature.highlighted}
        />
      ))}
    </View>
  );
}
