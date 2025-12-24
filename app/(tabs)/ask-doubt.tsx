// MVP_BYPASS: Removed auth and upgrade prompts, using ComingSoonModal for limits
import ChatBubble from "@/components/shared/ChatBubble";
import ComingSoonModal from "@/components/modals/ComingSoonModal";
import { useDoubts } from "@/hooks/useDoubts";
import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AskDoubtScreen() {
  // MVP_BYPASS: Removed auth checks and plan state
  const { messages, askDoubt, limitInfo, showComingSoon, setShowComingSoon } =
    useDoubts();
  const [inputText, setInputText] = useState("");
  const [inputModalVisible, setInputModalVisible] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const doubtText = inputText.trim();
    setInputText("");
    setInputModalVisible(false);
    await askDoubt(doubtText);
  };

  // MVP_BYPASS: Always show limit info, no pro/free distinction
  const showLimit = limitInfo;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-1">
        {/* MVP_BYPASS: Removed login/user badge and upgrade prompts */}
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
          </View>

          {/* MVP_BYPASS: Simplified usage indicator without upgrade prompts */}
          {/* {showLimit && (
            <View className="px-3 py-2 mt-3 border rounded-lg bg-blue-50 border-blue-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-blue-800">
                  {limitInfo.used}/{limitInfo.limit} doubts used today
                </Text>
              </View> */}
              {/* Progress Bar */}
              {/* <View className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${(limitInfo.used / limitInfo.limit) * 100}%`,
                  }}
                />
              </View>
            </View>
          )}  */}

        </View>

        <ScrollView
          className="flex-1 px-6 py-4"
          contentContainerStyle={{ paddingBottom: 80 }}
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

        {/* Fixed Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t-[1px] border-gray-200 px-4 py-3">
          <TouchableOpacity
            onPress={() => setInputModalVisible(true)}
            className="bg-blue-500 py-4 rounded-full items-center"
          >
            <Text className="text-white font-semibold text-base">
              Ask Your Doubt
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Modal */}
        <Modal
          visible={inputModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setInputModalVisible(false)}
        >
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
              {/* Header */}
              <View className="px-6 py-4 border-b-[1px] border-gray-200 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  Type Your Doubt
                </Text>
                <TouchableOpacity onPress={() => setInputModalVisible(false)}>
                  <Text className="text-blue-500 font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>

              {/* Text Input */}
              <View className="flex-1 px-6 py-4">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your doubt here..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  autoFocus
                  className="flex-1 text-base text-gray-900 p-4 bg-gray-50 rounded-2xl"
                  style={{ textAlignVertical: "top" }}
                />
              </View>

              {/* Send Button */}
              <View className="px-6 py-4 border-t-[1px] border-gray-200">
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!inputText.trim()}
                  className={`py-4 rounded-full items-center ${
                    inputText.trim() ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`font-semibold text-base ${
                      inputText.trim() ? "text-white" : "text-gray-400"
                    }`}
                  >
                    Send Doubt
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {/* MVP_BYPASS: Using ComingSoonModal instead of LimitReachedModal */}
        <ComingSoonModal
          visible={showComingSoon}
          onClose={() => setShowComingSoon(false)}
          feature="doubts"
        />
      </View>
    </SafeAreaView>
  );
}
