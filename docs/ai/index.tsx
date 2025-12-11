import { router } from "expo-router";
import {
  FileQuestion,
  FileText,
  MessageCircleQuestion,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          {/* Greeting Section */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900">
              Welcome back
            </Text>
            <Text className="mt-1 text-lg text-gray-600">
              Ready to ace your exam?
            </Text>
          </View>

          {/* Quick Action Buttons Grid */}
          <View className="mb-8">
            <Text className="mb-4 text-xl font-semibold text-gray-900">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {/* Ask Doubt Button */}
              <TouchableOpacity
                onPress={() => router.push("/ask-doubt")}
                className="w-[48%] rounded-xl border-[1px] border-gray-200 bg-white shadow-sm p-4 mb-4"
              >
                <View className="items-center">
                  <View className="items-center justify-center w-12 h-12 mb-3 bg-blue-100 rounded-full">
                    <MessageCircleQuestion size={24} color="#3b82f6" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">
                    Ask Doubt
                  </Text>
                  <Text className="mt-1 text-xs text-center text-gray-500">
                    Get instant help
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Generate Questions Button */}
              <TouchableOpacity
                onPress={() => router.push("/generate-questions")}
                className="w-[48%] rounded-xl border-[1px] border-gray-200 bg-white shadow-sm p-4 mb-4"
              >
                <View className="items-center">
                  <View className="items-center justify-center w-12 h-12 mb-3 bg-green-100 rounded-full">
                    <FileQuestion size={24} color="#22c55e" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">
                    Generate Questions
                  </Text>
                  <Text className="mt-1 text-xs text-center text-gray-500">
                    Practice smarter
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Convert Notes Button */}
              <TouchableOpacity
                onPress={() => router.push("/notes")}
                className="w-[48%] rounded-xl border-[1px] border-gray-200 bg-white shadow-sm p-4 mb-4"
              >
                <View className="items-center">
                  <View className="items-center justify-center w-12 h-12 mb-3 bg-purple-100 rounded-full">
                    <FileText size={24} color="#a855f7" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">
                    Convert Notes
                  </Text>
                  <Text className="mt-1 text-xs text-center text-gray-500">
                    Transform notes
                  </Text>
                </View>
              </TouchableOpacity>

              {/* View Progress Button */}
              <TouchableOpacity
                onPress={() => console.log("View Progress")}
                className="w-[48%] rounded-xl border-[1px] border-gray-200 bg-white shadow-sm p-4 mb-4"
              >
                <View className="items-center">
                  <View className="items-center justify-center w-12 h-12 mb-3 bg-orange-100 rounded-full">
                    <TrendingUp size={24} color="#f97316" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">
                    View Progress
                  </Text>
                  <Text className="mt-1 text-xs text-center text-gray-500">
                    Track growth
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Stats Section */}
          <View>
            <Text className="mb-4 text-xl font-semibold text-gray-900">
              Today&apos;s Stats
            </Text>
            <View className="rounded-xl border-[1px] border-gray-200 bg-white shadow-sm p-6">
              <View className="flex-row items-center justify-between">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-blue-600">24</Text>
                  <Text className="mt-1 text-sm text-gray-600">Questions</Text>
                  <Text className="text-xs text-gray-400">Solved</Text>
                </View>
                <View className="w-[1px] h-12 bg-gray-200" />
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-green-600">87%</Text>
                  <Text className="mt-1 text-sm text-gray-600">Accuracy</Text>
                  <Text className="text-xs text-gray-400">Rate</Text>
                </View>
                <View className="w-[1px] h-12 bg-gray-200" />
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-orange-600">15</Text>
                  <Text className="mt-1 text-sm text-gray-600">Day Streak</Text>
                  <Text className="text-xs text-gray-400">Keep going!</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
