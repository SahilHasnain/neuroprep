import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Layers, Calendar, Trash2 } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { FlashcardDeck } from "@/types/flashcard";

interface DeckCardProps {
  deck: FlashcardDeck;
  onPress: () => void;
  onDelete: () => void;
}

function DeckCard({ deck, onPress, onDelete }: DeckCardProps) {
  const relativeDate = getRelativeDate(deck.$createdAt);
  const lastStudiedText = deck.lastStudied
    ? getRelativeDate(deck.lastStudied)
    : "Not studied yet";

  const handleLongPress = () => {
    Alert.alert(
      "Delete Deck",
      `Are you sure you want to delete "${deck.name}"? This will remove all ${deck.cardCount} flashcards.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  // Get subject color
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      physics: "#3b82f6",
      chemistry: "#8b5cf6",
      biology: "#10b981",
      mathematics: "#f59e0b",
    };
    return colors[subject.toLowerCase()] || "#6b7280";
  };

  const subjectColor = getSubjectColor(deck.subject);

  return (
    <TouchableOpacity
      className="flex-1 m-2 bg-[#1e1e1e] rounded-2xl border border-gray-700 overflow-hidden active:scale-[0.98]"
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.9}
    >
      <View className="p-4">
        {/* Header with icon */}
        <View className="flex-row items-start justify-between mb-3">
          <View
            className="w-12 h-12 rounded-xl justify-center items-center"
            style={{ backgroundColor: `${subjectColor}20` }}
          >
            <Layers size={24} color={subjectColor} />
          </View>
          <View className="flex-row items-center gap-1">
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: `${subjectColor}20` }}
            >
              <Text
                className="text-xs font-semibold capitalize"
                style={{ color: subjectColor }}
              >
                {deck.subject}
              </Text>
            </View>
          </View>
        </View>

        {/* Deck Info */}
        <View className="gap-2">
          {/* Deck Name */}
          <Text
            className="text-base font-semibold text-white leading-5"
            numberOfLines={2}
          >
            {deck.name}
          </Text>

          {/* Topic */}
          <Text className="text-sm text-gray-400" numberOfLines={1}>
            {deck.topic}
          </Text>

          {/* Card Count */}
          <View className="flex-row items-center gap-1.5">
            <Layers size={12} color={COLORS.text.tertiary} />
            <Text className="text-xs text-gray-400">
              {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
            </Text>
          </View>

          {/* Last Studied */}
          <View className="flex-row items-center gap-1.5">
            <Calendar size={12} color={COLORS.text.tertiary} />
            <Text className="text-xs text-gray-400">{lastStudiedText}</Text>
          </View>

          {/* Source Badge */}
          {deck.sourceType !== "manual" && (
            <View className="mt-1">
              <View className="inline-flex self-start px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg">
                <Text className="text-[10px] text-gray-400 font-medium capitalize">
                  From {deck.sourceType}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default React.memo(DeckCard);
