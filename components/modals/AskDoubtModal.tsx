import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { X, Send, HelpCircle } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useDoubts } from "@/hooks/useDoubts";
import ChatBubble from "@/components/shared/ChatBubble";
import type { QuestionContext, NoteContext } from "@/lib/types";
import { router } from "expo-router";

interface AskDoubtModalProps {
  visible: boolean;
  onClose: () => void;
  questionContext?: QuestionContext;
  noteContext?: NoteContext;
}

export default function AskDoubtModal({
  visible,
  onClose,
  questionContext,
  noteContext,
}: AskDoubtModalProps) {
  const { messages, loading, askDoubt, currentDoubtContext } = useDoubts();
  const [inputText, setInputText] = useState("");

  // Pre-fill input with context when modal opens
  useEffect(() => {
    if (visible) {
      if (questionContext) {
        const formattedDoubt = `I have a doubt about this question:

Question: ${questionContext.questionText}

Options:
${questionContext.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join("\n")}

Correct Answer: ${questionContext.correctAnswer}

`;
        setInputText(formattedDoubt);
      } else if (noteContext) {
        setInputText(
          `I have a doubt about the note "${noteContext.noteTitle}":\n\n`
        );
      }
    }
  }, [visible, questionContext, noteContext]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    const doubtText = inputText.trim();
    setInputText("");
    await askDoubt(doubtText, questionContext);
  };

  const handleGenerateQuestions = (
    context: import("@/lib/types").DoubtContext
  ) => {
    onClose();
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
    onClose();
    router.push({
      pathname: "/(tabs)/notes",
      params: {
        doubtContext: JSON.stringify(context),
      },
    });
  };

  const handleClose = () => {
    setInputText("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <HelpCircle size={24} color="#3b82f6" />
                <View className="flex-1 ml-3">
                  <Text className="text-xl font-bold text-gray-900">
                    Ask Doubt
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Get instant help with this{" "}
                    {questionContext ? "question" : "note"}
                  </Text>
                </View>
              </View>
              <Pressable onPress={handleClose} className="p-2">
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>
          </View>

          {/* Messages Area */}
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

          {/* Input Area */}
          <View className="px-6 py-4 border-t border-gray-200 bg-white">
            <View className="flex-row items-end p-3 bg-gray-100 rounded-2xl">
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
          </View>
        </View>
      </View>
    </Modal>
  );
}
