import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatBubble from "../../components/shared/ChatBubble";
import Input from "../../components/ui/Input";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export default function AskDoubtScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI tutor. Ask me any doubt related to NEET/JEE and I'll help you understand it.",
      isUser: false,
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand your question. Let me help you with that. This is a placeholder response. In production, this would connect to an AI service.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Ask Doubt</Text>
          <Text className="mt-1 text-sm text-gray-600">
            Get instant help with your queries
          </Text>
        </View>

        {/* Chat Messages */}
        <ScrollView className="flex-1 px-6 py-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timeStamp={message.timestamp}
            />
          ))}
        </ScrollView>

        {/* Input Section */}
        <Input
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          placeholder="Type your doubt here..."
          multiline
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}




import { Send } from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  multiline?: boolean;
}

export function Input({
  value,
  onChangeText,
  onSend,
  placeholder = "Type your message...",
  multiline = false,
}: InputProps) {
  return (
    <View className="flex-row items-end border-t-[1px] border-gray-200 bg-white px-4 py-3">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline={multiline}
        className="flex-1 px-4 py-3 text-base text-gray-900 bg-gray-50 rounded-2xl max-h-24"
        style={{ textAlignVertical: multiline ? "top" : "center" }}
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!value.trim()}
        className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
          value.trim() ? "bg-blue-500" : "bg-gray-200"
        }`}
      >
        <Send size={18} color={value.trim() ? "#ffffff" : "#9ca3af"} />
      </TouchableOpacity>
    </View>
  );
}





