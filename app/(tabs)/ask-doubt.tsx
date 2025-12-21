import ChatBubble from "@/components/shared/ChatBubble";
import Input from "@/components/ui/Input";
import AuthModal from "@/components/ui/AuthModal";
import { useAuthStore } from "@/store/authStore";
import { loadDoubtsFromStorage, saveDoubtToStorage } from "@/utils";
import { doubtsService } from "@/services/api/doubts.service";
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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timeStamp: string;
}

export default function AskDoubtScreen() {
  const { user, checkSession } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI tutor. Ask me any doubt related to NEET/JEE and I'll help you understand it.",
      isUser: false,
      timeStamp: "Just Now",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [authVisible, setAuthVisible] = useState(false);

  // Check session on mount and load past doubts
  useEffect(() => {
    checkSession();

    const loadPast = async () => {
      const past = await loadDoubtsFromStorage();
      if (past.length > 0) {
        // we want oldest first so reverse (API returns most recent first)
        const toRender = [...past].reverse();
        const mapped: Message[] = [];
        toRender.forEach((d) => {
          mapped.push({
            id: d.id + "_q",
            text: d.text,
            isUser: true,
            timeStamp: new Date(d.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
          if (d.answer) {
            mapped.push({
              id: d.id + "_a",
              text: d.answer,
              isUser: false,
              timeStamp: new Date(d.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
          }
        });
        setMessages((prev) => [...prev, ...mapped]);
      }
    };

    loadPast();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timeStamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const doubtText = inputText.trim();
    setInputText("");

    // Add loading message
    const loadingMessage: Message = {
      id: "loading",
      text: "Thinking...",
      isUser: false,
      timeStamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await doubtsService.askDoubt(doubtText);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from server");
      }

      const aiData = response.data.answer;

      // Format AI response
      let formattedResponse = "";

      if (aiData.explanation && Array.isArray(aiData.explanation)) {
        aiData.explanation.forEach((step: string, idx: number) => {
          formattedResponse += `**Step ${idx + 1}:**\n${step}\n\n`;
        });
      }

      if (aiData.intuition) {
        formattedResponse += `**💡 Intuition:**\n${aiData.intuition}\n\n`;
      }

      if (aiData.revisionTip) {
        formattedResponse += `**📝 Revision Tip:**\n${aiData.revisionTip}`;
      }

      // Remove loading message and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== "loading");
        const aiResponse: Message = {
          id: Date.now().toString(),
          text: formattedResponse,
          isUser: false,
          timeStamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Save the pair (user question + AI answer) to storage
        saveDoubtToStorage(doubtText, formattedResponse).catch((err) => {
          console.warn("Failed to save doubt:", err);
        });

        return [...filtered, aiResponse];
      });
    } catch (err) {
      console.error("Error sending doubt:", err);

      // Remove loading message and show error
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== "loading");
        const errorResponse: Message = {
          id: Date.now().toString(),
          text: "Sorry, I couldn't process your doubt. Please try again.",
          isUser: false,
          timeStamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return [...filtered, errorResponse];
      });
    }
  };

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
                }
              }}
              className={`px-4 py-2 rounded-full ${
                user
                  ? "bg-blue-100"
                  : "bg-gray-100 border-[1px] border-blue-500"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  user ? "text-blue-700" : "text-blue-600"
                }`}
              >
                {user ? "Pro" : "Login"}
              </Text>
            </Pressable>
          </View>
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
