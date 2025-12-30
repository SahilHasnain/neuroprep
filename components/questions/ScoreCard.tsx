import { View, Text, Pressable } from "react-native";
import { Trophy, Star, TrendingUp, RotateCcw, Home } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  BounceIn,
} from "react-native-reanimated";

interface ScoreCardProps {
  score: number;
  totalQuestions: number;
  onRetry: () => void;
  onExit: () => void;
}

export default function ScoreCard({
  score,
  totalQuestions,
  onRetry,
  onExit,
}: ScoreCardProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  // Determine performance level
  const getPerformanceData = () => {
    if (percentage >= 90) {
      return {
        title: "Outstanding! 🎉",
        message: "You're crushing it!",
        color: "bg-green-500",
        textColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        emoji: "🏆",
      };
    } else if (percentage >= 75) {
      return {
        title: "Great Job! 🌟",
        message: "Keep up the good work!",
        color: "bg-blue-500",
        textColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        emoji: "⭐",
      };
    } else if (percentage >= 60) {
      return {
        title: "Good Effort! 💪",
        message: "You're making progress!",
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        emoji: "📈",
      };
    } else {
      return {
        title: "Keep Practicing! 🎯",
        message: "Every attempt makes you better!",
        color: "bg-orange-500",
        textColor: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        emoji: "💡",
      };
    }
  };

  const performance = getPerformanceData();

  return (
    <View className="flex-1 items-center justify-center px-6 bg-[#121212]">
      {/* Trophy Icon */}
      <Animated.View entering={BounceIn.delay(200).duration(600)}>
        <View
          className={`w-24 h-24 rounded-full ${performance.bgColor} items-center justify-center mb-6 border-4 ${performance.borderColor}`}
        >
          <Text className="text-5xl">{performance.emoji}</Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInUp.delay(400).duration(500)}>
        <Text className="text-3xl font-bold text-gray-100 text-center mb-2">
          {performance.title}
        </Text>
        <Text className="text-base text-gray-400 text-center mb-8">
          {performance.message}
        </Text>
      </Animated.View>

      {/* Score Display */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(500)}
        className="w-full"
      >
        <View
          className={`rounded-2xl p-6 mb-6 border-2 ${performance.borderColor} bg-[#1e1e1e]`}
        >
          {/* Main Score */}
          <View className="items-center mb-4">
            <Text className={`text-6xl font-bold ${performance.textColor}`}>
              {score}/{totalQuestions}
            </Text>
            <Text className="text-lg text-gray-400 mt-2">Correct Answers</Text>
          </View>

          {/* Percentage */}
          <View className="items-center py-4 border-t border-gray-700">
            <Text className={`text-4xl font-bold ${performance.textColor}`}>
              {percentage}%
            </Text>
            <Text className="text-sm text-gray-400 mt-1">Accuracy</Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-around mt-4 pt-4 border-t border-gray-700">
            <View className="items-center">
              <View className="flex-row items-center mb-1">
                <Star size={16} color="#10b981" fill="#10b981" />
                <Text className="text-xl font-bold text-gray-100 ml-1">
                  {score}
                </Text>
              </View>
              <Text className="text-xs text-gray-400">Correct</Text>
            </View>

            <View className="items-center">
              <View className="flex-row items-center mb-1">
                <TrendingUp size={16} color="#60a5fa" />
                <Text className="text-xl font-bold text-gray-100 ml-1">
                  {percentage}%
                </Text>
              </View>
              <Text className="text-xs text-gray-400">Score</Text>
            </View>

            <View className="items-center">
              <View className="flex-row items-center mb-1">
                <Trophy size={16} color="#f59e0b" />
                <Text className="text-xl font-bold text-gray-100 ml-1">
                  {totalQuestions - score}
                </Text>
              </View>
              <Text className="text-xs text-gray-400">Missed</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInUp.delay(800).duration(500)}
        className="w-full gap-3"
      >
        <Pressable
          onPress={onRetry}
          className="rounded-xl overflow-hidden active:opacity-80"
        >
          <LinearGradient
            colors={["#2563eb", "#1d4ed8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center px-6 py-4"
          >
            <RotateCcw size={20} color="#ffffff" />
            <Text className="ml-2 text-base font-semibold text-white">
              Try Again
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onExit}
          className="flex-row items-center justify-center px-6 py-4 rounded-xl bg-gray-700 active:bg-gray-600"
        >
          <Home size={20} color="#e5e5e5" />
          <Text className="ml-2 text-base font-semibold text-gray-200">
            Back to Home
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
