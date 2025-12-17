import ChatBubble from "@/components/shared/ChatBubble";
import Input from "@/components/ui/Input";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timeStamp: string;
}

export default function AskDoubtScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI tutor. Ask me any doubt related to NEET/JEE and I'll help you understand it.",
      isUser: false,
      timeStamp: "Just Now",
    },
  ]);

  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timeStamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: "I understand your question. Let me help you with that. This is a placeholder response. In production, this would connect to an AI service.",
      isUser: false,
      timeStamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Ask Doubt</Text>
          <Text className="mt-1 text-base text-gray-600">
            Get instant help with your queries
          </Text>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
