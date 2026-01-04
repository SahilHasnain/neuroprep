import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import {
  ArrowLeft,
  MoreVertical,
  Info,
  Share2,
  Trash2,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";

interface DocumentHeaderProps {
  title: string;
  createdAt: string;
  onBack: () => void;
  onInfo: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  menuContainer: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    marginTop: 80,
    marginRight: 16,
    minWidth: 200,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  deleteText: {
    color: COLORS.status.error,
  },
});

export default function DocumentHeader({
  title,
  createdAt,
  onBack,
  onInfo,
  onShare,
  onDelete,
}: DocumentHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuItemPress = (action: () => void) => {
    setMenuVisible(false);
    action();
  };

  return (
    <>
      <View
        className="flex-row items-center px-4 pt-12 pb-4 border-b"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderBottomColor: COLORS.border.default,
          minHeight: 80, // Increased height
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          className="items-center justify-center rounded-full w-9 h-9 active:scale-90"
          style={{ backgroundColor: COLORS.background.card }}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={COLORS.text.primary} />
        </TouchableOpacity>

        {/* Title and Date */}
        <View className="flex-1 px-3">
          <Text
            className="text-base font-semibold"
            style={{ color: COLORS.text.primary }}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            className="text-xs mt-0.5"
            style={{ color: COLORS.text.tertiary }}
          >
            {new Date(createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Menu Button */}
        <TouchableOpacity
          className="items-center justify-center rounded-full w-9 h-9 active:scale-90"
          style={{ backgroundColor: COLORS.background.card }}
          onPress={handleMenuToggle}
          activeOpacity={0.7}
        >
          <MoreVertical size={18} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(onInfo)}
              >
                <View
                  className="items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: COLORS.primary.blue + "20" }}
                >
                  <Info size={16} color={COLORS.primary.blue} />
                </View>
                <Text style={styles.menuItemText}>Info</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(onShare)}
              >
                <View
                  className="items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: COLORS.primary.blue + "20" }}
                >
                  <Share2 size={16} color={COLORS.primary.blue} />
                </View>
                <Text style={styles.menuItemText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => handleMenuItemPress(onDelete)}
              >
                <View
                  className="items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: COLORS.status.error + "20" }}
                >
                  <Trash2 size={16} color={COLORS.status.error} />
                </View>
                <Text style={[styles.menuItemText, styles.deleteText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
