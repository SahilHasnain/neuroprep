import ChatBubble from "@/components/shared/ChatBubble";
import AuthModal from "@/components/ui/AuthModal";
import LimitReachedModal from "@/components/ui/LimitReachedModal";
import { useAuthStore } from "@/store/authStore";
import { useDoubts } from "@/hooks/useDoubts";
import { useFlashcardsStore } from "@/store/flashcardsStore";
import { LAUNCH_V1_BYPASS } from "@/constants";
import { useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { Send, Info } from "lucide-react-native";
import type {
  QuestionContext,
  NoteContext,
  DocumentContext,
} from "@/lib/types";
import {
  validateQuestionContext,
  validateNoteContext,
  validateDocumentContext,
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
  const [documentContext, setDocumentContext] =
    useState<DocumentContext | null>(null);

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

  // Handle document context from navigation params
  useEffect(() => {
    if (params.documentContext) {
      try {
        const parsedContext = JSON.parse(params.documentContext as string);

        // Validate context before using it
        if (validateDocumentContext(parsedContext)) {
          setDocumentContext(parsedContext);

          // Pre-fill input with document reference and OCR text
          setInputText(
            `I have a doubt about the document "${parsedContext.documentTitle}":\n\n${parsedContext.ocrText ? `Content:\n${parsedContext.ocrText.substring(0, 500)}${parsedContext.ocrText.length > 500 ? "..." : ""}\n\n` : ""}My question: `
          );
        } else {
          console.error(
            "Invalid document context received, continuing without context"
          );
        }
      } catch (err) {
        console.error("Error parsing document context:", err);
        // Graceful degradation - continue without context
      }
    }
  }, [params.documentContext]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    const doubtText = inputText.trim();
    setInputText("");
    await askDoubt(doubtText, questionContext || undefined);
    // Clear contexts after sending
    setQuestionContext(null);
    setNoteContext(null);
    setDocumentContext(null);
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

  const handleSaveAsFlashcard = async (
    doubtText: string,
    resolution: string,
    subject: string,
    topic: string
  ) => {
    try {
      // Create a single-card deck directly
      const result = await useFlashcardsStore.getState().generateFlashcards({
        deckName: `Doubt: ${doubtText.substring(0, 50)}${doubtText.length > 50 ? "..." : ""}`,
        subject: subject,
        topic: topic,
        cardCount: 1,
        doubtContext: {
          doubtId: Date.now().toString(), // Generate temporary ID
          doubtText: doubtText,
          resolution: resolution,
          subject: subject,
          topic: topic,
        },
      });

      if (result.success) {
        Alert.alert(
          "Success!",
          "Flashcard saved successfully! You can view it in the Flashcards tab.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Failed",
          result.error || "Failed to save flashcard. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error saving flashcard:", error);
      Alert.alert("Error", "An error occurred while saving the flashcard.", [
        { text: "OK" },
      ]);
    }
  };

  // MVP_BYPASS: Removed plan-related logic
  const showLimit = limitInfo;

  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={["top"]}>
      <LinearGradient
        colors={["#2563eb", "#9333ea"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-6 py-4 border-b-[1px] border-gray-700"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Ask Doubt</Text>
            <Text className="mt-1 text-base text-gray-200">
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

        {/* Context Indicators */}
        {noteContext && (
          <View className="p-3 mb-3 border rounded-lg bg-blue-500/10 border-blue-500/30">
            <View className="flex-row items-center">
              <Info size={16} color="#60a5fa" />
              <Text className="ml-2 text-sm text-blue-300">
                Related to note: {noteContext.noteTitle}
              </Text>
            </View>
          </View>
        )}
        {documentContext && (
          <View className="p-3 mb-3 border rounded-lg bg-purple-500/10 border-purple-500/30">
            <View className="flex-row items-center">
              <Info size={16} color="#c084fc" />
              <Text className="ml-2 text-sm text-purple-300">
                Related to document: {documentContext.documentTitle}
              </Text>
            </View>
          </View>
        )}

        {/* Input Area */}
        <View
          style={{ backgroundColor: THEME.colors.background.secondary }}
          className="flex-row items-end p-3 mb-3 border border-gray-700 rounded-2xl"
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your doubt here..."
            placeholderTextColor="#6b7280"
            multiline
            className="flex-1 text-base text-gray-100 max-h-32"
            style={{ minHeight: 40 }}
            onSubmitEditing={handleSend}
            editable={!loading}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            className={`ml-3 w-10 h-10 rounded-full overflow-hidden ${
              inputText.trim() && !loading ? "" : "bg-gray-700"
            }`}
            style={{ alignSelf: "center" }}
          >
            {inputText.trim() && !loading ? (
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="items-center justify-center w-full h-full rounded-full"
              >
                <Send size={20} color="white" />
              </LinearGradient>
            ) : (
              <View className="items-center justify-center w-full h-full">
                <Send size={20} color={THEME.colors.text.primary} />
              </View>
            )}
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
      </LinearGradient>

      <ScrollView
        style={{ backgroundColor: THEME.colors.background.primary }}
        className="flex-1 px-6 py-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {loading && messages.length === 0 && (
          <View className="items-center justify-center py-8">
            <Text className="text-base text-gray-400">Thinking...</Text>
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
            onSaveAsFlashcard={handleSaveAsFlashcard}
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
