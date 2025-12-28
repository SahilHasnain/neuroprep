import ChatBubble from "@/components/shared/ChatBubble";
import AuthModal from "@/components/ui/AuthModal";
import LimitReachedModal from "@/components/ui/LimitReachedModal";
import { useAuthStore } from "@/store/authStore";
import { useDoubts } from "@/hooks/useDoubts";
import { LAUNCH_V1_BYPASS } from "@/constants";
import { useState, useEffect } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Send, Info } from "lucide-react-native";
import type { QuestionContext, NoteContext } from "@/lib/types";
import {
  validateQuestionContext,
  validateNoteContext,
} from "@/utils/contextValidation";

export default function AskDoubtScreen() {
  const { user, checkSession } = useAuthStore();
  const { messages, loading, askDoubt, limitInfo, error, currentDoubtContext } =
    useDoubts();
  const [inputText, setInputText] = useState("");
  const [authVisible, setAuthVisible] = useState(false);
  const [questionContext, setQuestionContext] =
    useState<QuestionContext | null>(null);
  const [noteContext, setNoteContext] = useState<NoteContext | null>(null);

  // Get route params
  const params = useLocalSearchParams();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Handle question context from navigation params
  useEffect(() => {
    if (params.questionContext) {
      try {
        const parsedContext = JSON.parse(params.questionContext as string);

        // Validate context before using it
        if (validateQuestionContext(parsedContext)) {
          setQuestionContext(parsedContext);

          // Format question context into natural doubt query
          const formattedDoubt = `I have a doubt about this question:

Question: ${parsedContext.questionText}

Options:
${parsedContext.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join("\n")}

Correct Answer: ${parsedContext.correctAnswer}

`;
          setInputText(formattedDoubt);
        } else {
          console.error(
            "Invalid question context received, continuing without context"
          );
        }
      } catch (err) {
        console.error("Error parsing question context:", err);
        // Graceful degradation - continue without context
      }
    }
  }, [params.questionContext]);

  // Handle note context from navigation params
  useEffect(() => {
    if (params.noteContext) {
      try {
        const parsedContext = JSON.parse(params.noteContext as string);

        // Validate context before using it
        if (validateNoteContext(parsedContext)) {
          setNoteContext(parsedContext);

          // Pre-fill input with note reference
          setInputText(
            `I have a doubt about the note "${parsedContext.noteTitle}":\n\n`
          );
        } else {
          console.error(
            "Invalid note context received, continuing without context"
          );
        }
      } catch (err) {
        console.error("Error parsing note context:", err);
        // Graceful degradation - continue without context
      }
    }
  }, [params.noteContext]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    const doubtText = inputText.trim();
    setInputText("");
    await askDoubt(doubtText, questionContext || undefined);
    // Clear contexts after sending
    setQuestionContext(null);
    setNoteContext(null);
  };

  const handleGenerateQuestions = (
    context: import("@/lib/types").DoubtContext
  ) => {
    // Navigate to generate-questions tab with doubt context
    router.push({
      pathname: "/(tabs)/generate-questions",
      params: {
        doubtContext: JSON.stringify(context),
      },
    });
  };

  const handleGenerateNotes = (
    context: import("@/lib/types").DoubtToNoteContext
  ) => {
    // Navigate to notes tab with doubt context
    router.push({
      pathname: "/(tabs)/notes",
      params: {
        doubtContext: JSON.stringify(context),
      },
    });
  };

  // MVP_BYPASS: Removed plan-related logic
  const showLimit = limitInfo;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Ask Doubt</Text>
            <Text className="mt-1 text-base text-gray-600">
              Get instant help with your queries
            </Text>
          </View>

          {/* MVP_BYPASS: Login/User Badge Button hidden */}
          {!LAUNCH_V1_BYPASS && (
            <Pressable
              onPress={() => {
                if (!user) {
                  setAuthVisible(true);
                } else {
                  router.push("/subscription");
                }
              }}
              className={`px-4 py-2 rounded-full ${
                user
                  ? "bg-amber-100 border-[1px] border-amber-400"
                  : "bg-gray-100 border-[1px] border-blue-500"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  user ? "text-amber-700" : "text-blue-600"
                }`}
              >
                {user ? "Free" : "Login"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Note Context Indicator */}
        {noteContext && (
          <View className="p-3 mb-3 rounded-lg bg-blue-50 border border-blue-200">
            <View className="flex-row items-center">
              <Info size={16} color="#3b82f6" />
              <Text className="ml-2 text-sm text-blue-700">
                Related to note: {noteContext.noteTitle}
              </Text>
            </View>
          </View>
        )}

        {/* Input Area */}
        <View className="flex-row items-end p-3 mb-3 bg-gray-100 rounded-2xl">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your doubt here..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="flex-1 text-base text-gray-900 max-h-32"
            style={{ minHeight: 40 }}
            onSubmitEditing={handleSend}
            editable={!loading}
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

        {/* Usage Indicator */}
        {!LAUNCH_V1_BYPASS && showLimit && (
          <View className="px-3 py-2 border rounded-lg bg-amber-50 border-amber-200">
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
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {loading && messages.length === 0 && (
          <View className="items-center justify-center py-8">
            <Text className="text-base text-gray-500">Thinking...</Text>
          </View>
        )}
        {messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timeStamp={message.timeStamp}
            doubtContext={
              !message.isUser && index === messages.length - 1
                ? currentDoubtContext || undefined
                : undefined
            }
            onGenerateQuestions={handleGenerateQuestions}
            onGenerateNotes={handleGenerateNotes}
          />
        ))}
      </ScrollView>

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
