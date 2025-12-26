import ChatBubble from "@/components/shared/ChatBubble";
import AuthModal from "@/components/ui/AuthModal";
import LimitReachedModal from "@/components/ui/LimitReachedModal";
import { useAuthStore } from "@/store/authStore";
import { useDoubts } from "@/hooks/useDoubts";
import { LAUNCH_V1_BYPASS } from "@/constants";
import { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Send, X } from "lucide-react-native";

export default function AskDoubtScreen() {
  const { user, checkSession } = useAuthStore();
  const { messages, loading, askDoubt, limitInfo, plan, error } = useDoubts();
  const [inputText, setInputText] = useState("");
  const [authVisible, setAuthVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const doubtText = inputText.trim();
    setInputText("");
    setModalVisible(false);
    await askDoubt(doubtText);
  };

  const isPro = plan === "pro";
  const showLimit = !isPro && limitInfo;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Ask Doubt</Text>
            <Text className="mt-1 text-base text-gray-600">
              Get instant help with your queries
            </Text>
          </View>

          {/* Login/User Badge Button */}
          {!LAUNCH_V1_BYPASS && (
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
          )}
        </View>

        {/* Usage Indicator */}
        {!LAUNCH_V1_BYPASS && showLimit && (
          <View className="px-3 py-2 mt-3 border rounded-lg bg-amber-50 border-amber-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-amber-800">
                {limitInfo.used}/{limitInfo.limit} doubts used today
              </Text>
              {limitInfo.used >= limitInfo.limit * 0.8 && (
                <Pressable onPress={() => router.push("/subscription")}>
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
                style={{
                  width: `${(limitInfo.used / limitInfo.limit) * 100}%`,
                }}
              />
            </View>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-6 py-4"
        contentContainerStyle={{ paddingBottom: 100 }}
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

      {/* Ask Doubt Button */}
      <View className="absolute bottom-6 left-6 right-6">
        <Pressable
          onPress={() => setModalVisible(true)}
          disabled={loading}
          className={`flex-row items-center justify-center px-6 py-4 bg-blue-600 rounded-2xl shadow-lg ${
            loading ? "opacity-50" : "active:opacity-80"
          }`}
        >
          <Text className="text-lg font-semibold text-white">
            {loading ? "Thinking..." : "Ask a Doubt"}
          </Text>
        </Pressable>
      </View>

      {/* Input Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setModalVisible(false)}
        >
          <View className="flex-1" />
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="px-6 py-6 bg-white shadow-2xl rounded-t-3xl">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  What's your doubt?
                </Text>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  className="p-2"
                >
                  <X size={24} color="#6B7280" />
                </Pressable>
              </View>

              {/* Input Area */}
              <View className="flex-row items-end p-3 bg-gray-100 rounded-2xl">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your doubt here..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  className="flex-1 text-base text-gray-900 max-h-32"
                  style={{ minHeight: 40 }}
                  autoFocus
                />
                <Pressable
                  onPress={handleSend}
                  disabled={!inputText.trim() || loading}
                  className={`ml-3 p-2.5 rounded-full ${
                    inputText.trim() && !loading ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <Send size={20} color="white" />
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Auth Modal */}
      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />

      {/* Limit Reached Modal */}
      {!LAUNCH_V1_BYPASS && (
        <LimitReachedModal
          visible={error?.errorCode === "DAILY_LIMIT_REACHED"}
          feature="doubts"
          quota={limitInfo || { used: 0, limit: 0 }}
          onUpgrade={() => {
            router.push("/subscription");
          }}
          onClose={() => {}}
        />
      )}
    </SafeAreaView>
  );
}
