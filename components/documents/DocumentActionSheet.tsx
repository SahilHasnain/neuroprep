import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import {
  MessageCircleQuestion,
  FileQuestion,
  NotebookPen,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onActionSelect: (
    action: "generate-questions" | "ask-doubt" | "create-notes"
  ) => void;
}

export default function DocumentActionSheet({
  visible,
  onClose,
  onActionSelect,
}: ActionSheetProps) {
  const handleActionPress = (
    action: "generate-questions" | "ask-doubt" | "create-notes"
  ) => {
    onActionSelect(action);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Title */}
          <Text style={styles.title}>AI Actions</Text>
          <Text style={styles.subtitle}>
            Choose an action to perform with this document
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            {/* Generate Questions */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleActionPress("generate-questions")}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <FileQuestion size={24} color={COLORS.primary.blue} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Generate Questions</Text>
                <Text style={styles.actionDescription}>
                  Create practice questions from this document
                </Text>
              </View>
            </TouchableOpacity>

            {/* Ask a Doubt */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleActionPress("ask-doubt")}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <MessageCircleQuestion
                  size={24}
                  color={COLORS.primary.purple}
                />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Ask a Doubt</Text>
                <Text style={styles.actionDescription}>
                  Get AI help with questions about this content
                </Text>
              </View>
            </TouchableOpacity>

            {/* Create Notes */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleActionPress("create-notes")}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <NotebookPen size={24} color={COLORS.accent.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Create Notes</Text>
                <Text style={styles.actionDescription}>
                  Generate structured notes from this document
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    lineHeight: 18,
  },
  cancelButton: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
});
