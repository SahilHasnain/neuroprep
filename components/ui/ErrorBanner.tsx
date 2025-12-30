import { View, Text, Pressable } from "react-native";
import { AlertCircle, X, Lock } from "lucide-react-native";
import type { ApiError } from "@/utils/errorHandler";

interface ErrorBannerProps {
  error: ApiError;
  onAction?: () => void;
  onDismiss: () => void;
}

export default function ErrorBanner({
  error,
  onAction,
  onDismiss,
}: ErrorBannerProps) {
  const isLimitError = error.errorCode === "DAILY_LIMIT_REACHED";
  const isFeatureLocked = error.errorCode === "FEATURE_LOCKED";

  const bgColor =
    isLimitError || isFeatureLocked ? "bg-amber-500/10" : "bg-red-500/10";
  const borderColor =
    isLimitError || isFeatureLocked
      ? "border-amber-500/30"
      : "border-red-500/30";
  const textColor =
    isLimitError || isFeatureLocked ? "text-amber-400" : "text-red-400";
  const iconColor = isLimitError || isFeatureLocked ? "#fbbf24" : "#f87171";

  return (
    <View
      className={`mt-3 p-3 ${bgColor} rounded-xl border-[1px] ${borderColor} flex-row items-start`}
    >
      {isFeatureLocked ? (
        <Lock size={18} color={iconColor} style={{ marginTop: 2 }} />
      ) : (
        <AlertCircle size={18} color={iconColor} style={{ marginTop: 2 }} />
      )}
      <View className="flex-1 ml-2">
        <Text className={`text-sm ${textColor}`}>{error.message}</Text>
        {onAction && (
          <Pressable onPress={onAction} className="mt-2">
            <Text className="text-sm font-semibold text-blue-400">
              Upgrade to Pro →
            </Text>
          </Pressable>
        )}
      </View>
      <Pressable onPress={onDismiss} className="ml-2">
        <X size={18} color={iconColor} />
      </Pressable>
    </View>
  );
}
