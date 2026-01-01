import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Info, Share2, Trash2, Plus, X } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

interface FloatingActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onInfo: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export default function FloatingActionMenu({
  isOpen,
  onToggle,
  onInfo,
  onShare,
  onDelete,
}: FloatingActionMenuProps) {
  return (
    <View className="absolute z-50 bottom-6 right-6">
      {/* Menu Options (show when open) */}
      {isOpen && (
        <View className="gap-3 mb-3">
          <TouchableOpacity
            className="flex-row items-center gap-3 p-3 rounded-full shadow-lg active:scale-95"
            style={{
              backgroundColor: COLORS.background.card,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={onInfo}
            activeOpacity={0.8}
          >
            <View
              className="items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: COLORS.primary.blue + "20" }}
            >
              <Info size={20} color={COLORS.primary.blue} />
            </View>
            <Text
              className="pr-2 text-sm font-medium"
              style={{ color: COLORS.text.primary }}
            >
              Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-3 p-3 rounded-full shadow-lg active:scale-95"
            style={{
              backgroundColor: COLORS.background.card,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={onShare}
            activeOpacity={0.8}
          >
            <View
              className="items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: COLORS.primary.blue + "20" }}
            >
              <Share2 size={20} color={COLORS.primary.blue} />
            </View>
            <Text
              className="pr-2 text-sm font-medium"
              style={{ color: COLORS.text.primary }}
            >
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-3 p-3 rounded-full shadow-lg active:scale-95"
            style={{
              backgroundColor: COLORS.background.card,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={onDelete}
            activeOpacity={0.8}
          >
            <View
              className="items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: COLORS.status.error + "20" }}
            >
              <Trash2 size={20} color={COLORS.status.error} />
            </View>
            <Text
              className="pr-2 text-sm font-medium"
              style={{ color: COLORS.status.error }}
            >
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main FAB Button */}
      <TouchableOpacity
        className="items-center justify-center rounded-full shadow-lg w-14 h-14 active:scale-95"
        style={{
          backgroundColor: COLORS.primary.blue,
          shadowColor: COLORS.primary.blue,
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        }}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        {isOpen ? (
          <X size={24} color={COLORS.text.primary} />
        ) : (
          <Plus size={24} color={COLORS.text.primary} />
        )}
      </TouchableOpacity>
    </View>
  );
}
