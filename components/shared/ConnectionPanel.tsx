import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  FileQuestion,
  BookOpen,
  Layers,
  Sparkles,
  ChevronRight,
  MessageCircleQuestion,
} from "lucide-react-native";
import { THEME } from "@/constants/theme";
import type {
  ConnectionContextData,
  ConnectionAction,
} from "@/hooks/useConnectionContext";
import { useModalVisibility } from "@/hooks/useModalVisibility";

interface ConnectionPanelProps {
  visible: boolean;
  context: ConnectionContextData | null;
  onClose: () => void;
  onActionSelect: (action: ConnectionAction) => void;
  loading?: boolean;
}

export default function ConnectionPanel({
  visible,
  context,
  onClose,
  onActionSelect,
  loading = false,
}: ConnectionPanelProps) {
  // Register visibility to control tab bar via global store
  useModalVisibility("connection-panel", visible);
  const [selectedAction, setSelectedAction] = useState<ConnectionAction | null>(
    null
  );

  if (!context) return null;

  const handleActionPress = (action: ConnectionAction) => {
    setSelectedAction(action);
    onActionSelect(action);
  };

  const getSourceLabel = () => {
    switch (context.source) {
      case "doubt":
        return "Doubt Resolution";
      case "question":
        return "Practice Question";
      case "note":
        return "Study Note";
      case "document":
        return "Document";
      default:
        return "Content";
    }
  };

  const actions = [
    {
      id: "questions" as ConnectionAction,
      title: "Generate Questions",
      description: "Create practice questions on this topic",
      icon: FileQuestion,
      gradient: ["#2563eb", "#1d4ed8"],
      iconColor: "#60a5fa",
    },
    {
      id: "notes" as ConnectionAction,
      title: "Create Notes",
      description: "Generate structured study notes",
      icon: BookOpen,
      gradient: ["#059669", "#047857"],
      iconColor: "#34d399",
    },
    {
      id: "flashcards" as ConnectionAction,
      title: "Make Flashcards",
      description: "Build flashcard deck for quick revision",
      icon: Layers,
      gradient: ["#9333ea", "#7e22ce"],
      iconColor: "#c084fc",
    },
    {
      id: "doubt" as ConnectionAction,
      title: "Ask a Doubt",
      description: "Get AI help with your questions",
      icon: MessageCircleQuestion,
      gradient: ["#dc2626", "#b91c1c"],
      iconColor: "#f87171",
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/70" onPress={onClose}>
        <View className="flex-1" />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: THEME.colors.background.secondary }}
          className="rounded-t-3xl"
        >
          {/* Handle Bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-12 h-1 rounded-full bg-gray-600" />
          </View>

          {/* Header with Context */}
          <View className="px-6 pt-2 pb-4 border-b border-gray-700">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Connected from
                </Text>
                <Text className="text-xl font-bold text-white">
                  {getSourceLabel()}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center active:bg-gray-700"
              >
                <X size={18} color="#9ca3af" />
              </Pressable>
            </View>

            {/* Context Info */}
            <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Sparkles size={14} color="#60a5fa" />
              <Text className="text-sm text-blue-300 flex-1" numberOfLines={1}>
                {context.topic || context.subject || "Related content"}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="px-6 py-6">
            <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Quick Actions
            </Text>

            <View className="gap-3">
              {actions.map((action) => {
                const Icon = action.icon;
                const isSelected = selectedAction === action.id;
                const isLoading = loading && isSelected;

                return (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => handleActionPress(action.id)}
                    disabled={loading}
                    activeOpacity={0.7}
                    className={`rounded-xl border overflow-hidden ${
                      isSelected ? "border-blue-500" : "border-gray-700"
                    }`}
                  >
                    <View
                      style={{ backgroundColor: THEME.colors.background.card }}
                      className="flex-row items-center p-4"
                    >
                      {/* Icon */}
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                        style={{ backgroundColor: action.iconColor + "20" }}
                      >
                        {isLoading ? (
                          <ActivityIndicator
                            size="small"
                            color={action.iconColor}
                          />
                        ) : (
                          <Icon size={24} color={action.iconColor} />
                        )}
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-white mb-1">
                          {action.title}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          {action.description}
                        </Text>
                      </View>

                      {/* Arrow */}
                      {!isLoading && <ChevronRight size={20} color="#6b7280" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Helper Text */}
            <View className="mt-6 px-3 py-2.5 rounded-lg bg-gray-800/50">
              <Text className="text-xs text-gray-400 text-center">
                💡 Subject and topic will be auto-filled from your{" "}
                {getSourceLabel().toLowerCase()}
              </Text>
            </View>
          </View>

          {/* Bottom Padding for safe area */}
          <View className="h-8" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
