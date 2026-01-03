import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Sparkles, Layers } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import Dropdown from "@/components/ui/Dropdown";
import { SUBJECTS } from "@/constants";
import { THEME } from "@/constants/theme";
import type {
  FlashcardGenerationConfig,
  DocumentContext,
  NoteContext,
  DoubtContext,
} from "@/types/flashcard";

interface GenerateFlashcardsModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (config: FlashcardGenerationConfig) => Promise<{
    success: boolean;
    deckId?: string;
    error?: string;
  }>;
  documentContext?: DocumentContext;
  noteContext?: NoteContext;
  doubtContext?: DoubtContext;
}

const MOTIVATIONAL_MESSAGES = [
  "Creating your flashcards...",
  "Analyzing content...",
  "Generating questions...",
  "Almost there...",
  "Finalizing your deck...",
];

export default function GenerateFlashcardsModal({
  visible,
  onClose,
  onGenerate,
  documentContext,
  noteContext,
  doubtContext,
}: GenerateFlashcardsModalProps) {
  const [deckName, setDeckName] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [cardCount, setCardCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState(
    MOTIVATIONAL_MESSAGES[0]
  );
  const [errors, setErrors] = useState<{
    deckName?: string;
    subject?: string;
    topic?: string;
  }>({});

  // Context indicator
  const contextSource = documentContext
    ? `Document: ${documentContext.documentTitle}`
    : noteContext
      ? `Note: ${noteContext.topic}`
      : doubtContext
        ? `Doubt: ${doubtContext.doubtText.substring(0, 50)}...`
        : null;

  // Auto-fill fields based on context
  useEffect(() => {
    if (visible) {
      if (documentContext) {
        setDeckName(
          `${documentContext.documentTitle.substring(0, 40)}${documentContext.documentTitle.length > 40 ? "..." : ""}`
        );
        // Try to infer subject from document title or leave empty
        setSubject("");
        setTopic(documentContext.documentTitle);
      } else if (noteContext) {
        setDeckName(`${noteContext.topic} - Flashcards`);
        setSubject(noteContext.subject);
        setTopic(noteContext.topic);
      } else if (doubtContext) {
        setDeckName(
          `Doubt: ${doubtContext.doubtText.substring(0, 30)}${doubtContext.doubtText.length > 30 ? "..." : ""}`
        );
        setSubject(doubtContext.subject);
        setTopic(doubtContext.topic);
      }
    }
  }, [visible, documentContext, noteContext, doubtContext]);

  // Rotate motivational messages during loading
  useEffect(() => {
    if (loading) {
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % MOTIVATIONAL_MESSAGES.length;
        setMotivationalMessage(MOTIVATIONAL_MESSAGES[index]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const validateInputs = (): boolean => {
    const newErrors: typeof errors = {};

    if (!deckName.trim()) {
      newErrors.deckName = "Deck name is required";
    } else if (deckName.length > 100) {
      newErrors.deckName = "Deck name must be less than 100 characters";
    }

    if (!subject) {
      newErrors.subject = "Subject is required";
    }

    if (!topic.trim()) {
      newErrors.topic = "Topic is required";
    } else if (topic.length > 100) {
      newErrors.topic = "Topic must be less than 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setMotivationalMessage(MOTIVATIONAL_MESSAGES[0]);

    const config: FlashcardGenerationConfig = {
      deckName: deckName.trim(),
      subject,
      topic: topic.trim(),
      cardCount,
      documentContext,
      noteContext,
      doubtContext,
    };

    try {
      const result = await onGenerate(config);

      if (result.success) {
        Alert.alert(
          "Success! 🎉",
          `Created ${cardCount} flashcards in "${deckName}"`,
          [
            {
              text: "OK",
              onPress: () => {
                handleClose();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Generation Failed",
          result.error || "Failed to generate flashcards. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDeckName("");
      setSubject("");
      setTopic("");
      setCardCount(10);
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="justify-end flex-1 bg-black/85">
        <SafeAreaView
          style={{
            backgroundColor: THEME.colors.background.primary,
            maxHeight: "90%",
          }}
          className="rounded-t-3xl"
          edges={["bottom"]}
        >
          {/* Header */}
          <LinearGradient
            colors={["#2563eb", "#9333ea"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-4 border-b-2 border-gray-700 rounded-t-3xl"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Sparkles size={24} color="#ffffff" />
                <View className="flex-1 ml-3">
                  <Text className="text-xl font-bold text-white">
                    Generate Flashcards
                  </Text>
                  {contextSource && (
                    <View className="mt-1 px-2 py-1 bg-white/20 rounded-full self-start">
                      <Text className="text-xs text-white font-medium">
                        {contextSource}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={loading}
                className="p-2 rounded-full active:bg-white/10"
              >
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Form Content */}
          <ScrollView
            style={{ backgroundColor: THEME.colors.background.primary }}
            className="px-6 py-6"
          >
            {/* Deck Name Input */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-300">
                Deck Name
              </Text>
              <TextInput
                className={`px-4 py-3 text-base text-gray-100 bg-[#1e1e1e] border ${
                  errors.deckName ? "border-red-500" : "border-gray-700"
                } rounded-xl`}
                value={deckName}
                onChangeText={(text) => {
                  setDeckName(text);
                  if (errors.deckName) {
                    setErrors({ ...errors, deckName: undefined });
                  }
                }}
                placeholder="e.g., Physics - Mechanics"
                placeholderTextColor="#6b7280"
                editable={!loading}
                maxLength={100}
              />
              {errors.deckName && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.deckName}
                </Text>
              )}
            </View>

            {/* Subject Dropdown */}
            <View className="mb-4">
              <Dropdown
                label="Subject"
                value={subject}
                options={SUBJECTS}
                onSelect={(value) => {
                  setSubject(value);
                  if (errors.subject) {
                    setErrors({ ...errors, subject: undefined });
                  }
                }}
                placeholder="Select a subject"
              />
              {errors.subject && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.subject}
                </Text>
              )}
            </View>

            {/* Topic Input */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-300">
                Topic
              </Text>
              <TextInput
                className={`px-4 py-3 text-base text-gray-100 bg-[#1e1e1e] border ${
                  errors.topic ? "border-red-500" : "border-gray-700"
                } rounded-xl`}
                value={topic}
                onChangeText={(text) => {
                  setTopic(text);
                  if (errors.topic) {
                    setErrors({ ...errors, topic: undefined });
                  }
                }}
                placeholder="e.g., Newton's Laws of Motion"
                placeholderTextColor="#6b7280"
                editable={!loading}
                maxLength={100}
              />
              {errors.topic && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.topic}
                </Text>
              )}
            </View>

            {/* Card Count Slider */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-medium text-gray-300">
                  Number of Cards
                </Text>
                <View className="px-3 py-1 bg-blue-600 rounded-full">
                  <Text className="text-sm font-bold text-white">
                    {cardCount}
                  </Text>
                </View>
              </View>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={5}
                maximumValue={15}
                step={1}
                value={cardCount}
                onValueChange={setCardCount}
                minimumTrackTintColor="#2563eb"
                maximumTrackTintColor="#374151"
                thumbTintColor="#2563eb"
                disabled={loading}
              />
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-gray-500">5 cards</Text>
                <Text className="text-xs text-gray-500">15 cards</Text>
              </View>
            </View>

            {/* Info Box */}
            <View className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl mb-4">
              <View className="flex-row items-start">
                <Layers size={18} color="#60a5fa" className="mt-0.5" />
                <Text className="flex-1 ml-3 text-sm text-gray-300 leading-5">
                  AI will generate {cardCount} flashcards based on{" "}
                  {contextSource ? "the provided content" : "your topic"}. Each
                  card will have a question on the front and answer on the back.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={{ backgroundColor: THEME.colors.background.secondary }}
            className="px-6 py-4 border-t-2 border-gray-700"
          >
            {loading ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-3 text-base text-gray-300 font-medium">
                  {motivationalMessage}
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 px-4 py-3 border-2 border-gray-700 rounded-xl bg-transparent active:bg-gray-800"
                >
                  <Text className="text-center font-semibold text-gray-300">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGenerate}
                  className="flex-1 rounded-xl overflow-hidden active:opacity-80"
                >
                  <LinearGradient
                    colors={["#2563eb", "#1d4ed8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-center px-4 py-3"
                  >
                    <Sparkles size={20} color="#fff" />
                    <Text className="ml-2 font-semibold text-white">
                      Generate
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
