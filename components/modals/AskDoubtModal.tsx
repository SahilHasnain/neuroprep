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
import type {
  QuestionContext,
  NoteContext,
  DoubtContext,
  DoubtToNoteContext,
} from "@/lib/types";

interface AskDoubtModalProps {
  visible: boolean;
  onClose: () => void;
  questionContext?: QuestionContext;
  noteContext?: NoteContext;
  onGenerateQuestions?: (context: DoubtContext) => void;
  onGenerateNotes?: (context: DoubtToNoteContext) => void;
}

export default function AskDoubtModal({
  visible,
  onClose,
  questionContext,
  noteContext,
  onGenerateQuestions,
  onGenerateNotes,
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
    await askDoubt(doubtText, questionContext || undefined);
  };

  const handleGenerateQuestions = (context: DoubtContext) => {
    if (onGenerateQuestions) {
      onClose();
      onGenerateQuestions(context);
    }
  };

  const handleGenerateNotes = (context: DoubtToNoteContext) => {
    if (onGenerateNotes) {
      onClose();
      onGenerateNotes(context);
    }
  };

  const handleClose = () => {
    setInputText("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/85">
        <View className="flex-1 mt-20 bg-dark-bg-secondary rounded-t-3xl">
          {/* Header */}
          <View className="px-6 py-4 bg-gradient-to-r from-accent-blue to-accent-purple border-b border-dark-surface-300">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <HelpCircle size={24} color="#60a5fa" />
                <View className="flex-1 ml-3">
                  <Text className="text-xl font-bold text-white">
                    Ask Doubt
                  </Text>
                  <Text className="text-sm text-white/80">
                    Get instant help with this{" "}
                    {questionContext ? "question" : "note"}
                  </Text>
                </View>
              </View>
              <Pressable onPress={handleClose} className="p-2">
                <X size={24} color="#e5e5e5" />
              </Pressable>
            </View>

            {/* Input Area in Header */}
            <View className="flex-row items-end p-3 bg-dark-surface-100 border border-dark-surface-300 rounded-2xl">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your doubt here..."
                placeholderTextColor="#6b7280"
                multiline
                className="flex-1 text-base text-text-secondary max-h-32"
                style={{ minHeight: 40 }}
                onSubmitEditing={handleSend}
                editable={!loading}
              />
              <Pressable
                onPress={handleSend}
                disabled={!inputText.trim() || loading}
                className={`ml-3 p-2.5 rounded-full ${
                  inputText.trim() && !loading
                    ? "bg-gradient-to-r from-accent-blue to-accent-purple"
                    : "bg-dark-surface-300"
                }`}
              >
                <Send size={20} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Messages Area */}
          <ScrollView
            className="flex-1 px-6 py-4 bg-dark-surface-100"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {loading && messages.length === 0 && (
              <View className="items-center justify-center py-8">
                <Text className="text-base text-text-tertiary">
                  Thinking...
                </Text>
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
        </View>
      </View>
    </Modal>
  );
}
