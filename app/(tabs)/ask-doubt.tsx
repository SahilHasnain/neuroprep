import ChatBubble from "@/components/shared/ChatBubble";
import Input from "@/components/ui/Input";
import AuthModal from "@/components/ui/AuthModal";
import { useAuthStore } from "@/store/authStore";
import { useDoubts } from "@/hooks/useDoubts";
import { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function AskDoubtScreen() {
  const { user, checkSession } = useAuthStore();
  const { messages, loading, askDoubt, limitInfo, plan } = useDoubts();
  const [inputText, setInputText] = useState("");
  const [authVisible, setAuthVisible] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const doubtText = inputText.trim();
    setInputText("");
    await askDoubt(doubtText);
  };

  const isPro = plan === "student_pro";
  const showLimit = !isPro && limitInfo;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                Ask Doubt
              </Text>
              <Text className="mt-1 text-base text-gray-600">
                Get instant help with your queries
              </Text>
            </View>

            {/* Login/User Badge Button */}
            <Pressable
              onPress={() => {
                if (!user) {
                  setAuthVisible(true);
                } else if (!isPro) {
                  router.push("/subscription");
                }
              }}
              className={`px-4 py-2 rounded-full ${
                isPro
                  ? "bg-blue-100"
                  : user
                  ? "bg-amber-100 border-[1px] border-amber-400"
                  : "bg-gray-100 border-[1px] border-blue-500"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isPro
                    ? "text-blue-700"
                    : user
                    ? "text-amber-700"
                    : "text-blue-600"
                }`}
              >
                {isPro ? "Pro" : user ? "Free" : "Login"}
              </Text>
            </Pressable>
          </View>

          {/* Usage Indicator */}
          {showLimit && (
            <View className="px-3 py-2 mt-3 border rounded-lg bg-amber-50 border-amber-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-amber-800">
                  {limitInfo.used}/{limitInfo.limit} doubts used today
                </Text>
                {limitInfo.used >= limitInfo.limit * 0.8 && (
                  <Pressable onPress={() => user ? router.push("/subscription") : setAuthVisible(true)}>
                    <Text className="text-xs font-semibold text-blue-600">
                      Upgrade
                    </Text>
                  </Pressable>
                )}
              </View>
              {/* Progress Bar */}
              <View className="mt-2 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${(limitInfo.used / limitInfo.limit) * 100}%` }}
                />
              </View>
            </View>
          )}
        </View>

        <ScrollView
          className="flex-1 px-6 py-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timeStamp={message.timeStamp}
            />
          ))}
        </ScrollView>

        <Input
          value={inputText}
          onSend={handleSend}
          onChangeText={setInputText}
          placeholder="Type your doubt here..."
          multiline
        />

        {/* Auth Modal for Paid Upgrade */}
        <AuthModal
          visible={authVisible}
          onClose={() => setAuthVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
