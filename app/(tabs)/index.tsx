import { FileQuestion, FileText, MessageCircleQuestion, TrendingUp } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="px-6 py-8">
      <View className="mb-8">
        <Text className="mb-1 text-3xl font-bold text-gray-900">Welcome back</Text>
        <Text className="text-lg text-gray-600">Ready to ace your exam?</Text>
      </View>

      <View className="mb-8">
        <Text className="mb-4 text-xl font-semibold text-gray-900">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity className="w-[48%] border-[1px] border-gray-200 p-4 rounded-xl items-center justify-center bg-white shadow-sm mb-4">
            <View className="items-center justify-center w-12 h-12 mb-3 bg-blue-100 rounded-full">
              <MessageCircleQuestion size={24} color="#3b82f6" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              Ask Doubt
            </Text>
            <Text className="mt-1 text-xs text-center">Get instant help</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white w-[48%] border-[1px] border-gray-200 rounded-xl shadow-sm justify-center items-center p-4 mb-4">
            <View className="items-center justify-center w-12 h-12 mb-3 bg-green-100 rounded-full">
              <FileQuestion size={24} color="#22c55e" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              Generate Questions
            </Text>
            <Text className="mt-1 text-xs text-gray-500">Practice smarter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white w-[48%] border-[1px] border-gray-200 rounded-xl shadow-sm justify-center items-center p-4">
            <View className="items-center justify-center w-12 h-12 mb-3 bg-purple-100 rounded-full">
              <FileText size={24} color="#a855f7" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              Convert Notes
            </Text>
            <Text className="mt-1 text-xs text-gray-500">Transform Notes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white w-[48%] border-[1px] border-gray-200 rounded-xl shadow-sm justify-center items-center p-4">
            <View className="items-center justify-center w-12 h-12 mb-3 bg-orange-100 rounded-full">
              <TrendingUp size={24} color="#f97316" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              View Progress
            </Text>
            <Text className="mt-1 text-xs text-gray-500">Track Growth</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text className="mb-4 text-xl font-semibold text-gray-900">
          Today&apos;s Stats
        </Text>

        <View className="flex flex-row p-6 border-gray-200 border-[1px] shadow-sm rounded-xl bg-white justify-between items-center">
          <View className="items-center flex-1">
            <Text className="mb-1 text-2xl font-bold text-blue-600">
              24
            </Text>
            <Text className="mb-1 text-sm text-gray-600">
              Questions
            </Text>
            <Text className="text-xs text-gray-400">
              Solved
            </Text>
          </View>

           <View className="w-[1px] h-12 bg-gray-200" />
           
          <View className="items-center flex-1">
            <Text className="mb-3 text-2xl font-bold text-green-600">
              87%
            </Text>
            <Text className="mb-1 text-sm text-gray-600">
              Accuracy
            </Text>
            <Text className="text-xs text-gray-400">
              Rate
            </Text>
          </View>

           <View className="w-[1px] h-12 bg-gray-200" />
           
          <View className="items-center flex-1">
            <Text className="mb-1 text-2xl font-bold text-orange-600">
              15
            </Text>
            <Text className="mb-1 text-sm text-gray-600">
              Day Streak
            </Text>
            <Text className="text-xs text-gray-400">
              Keep going!
            </Text>
          </View>
          
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
