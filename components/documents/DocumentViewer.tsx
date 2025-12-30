import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import { ArrowLeft, MoreVertical, Sparkles, Trash2 } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { Document, DocumentType } from "@/types/document";
import { getDocumentSuggestion } from "@/utils/documentSuggestions";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DocumentViewerProps {
  document: Document;
  onBack: () => void;
  onDelete: () => void;
  onAIAction: () => void;
  isLoading?: boolean;
}

export default function DocumentViewer({
  document,
  onBack,
  onDelete,
  onAIAction,
  isLoading = false,
}: DocumentViewerProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isPDF = document.type === DocumentType.PDF;
  const suggestion = getDocumentSuggestion();

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title} numberOfLines={1}>
              Loading...
            </Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.blue} />
          <Text style={styles.loadingText}>Loading document...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title} numberOfLines={1}>
            {document.title}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setMenuVisible(!menuVisible)}
          activeOpacity={0.7}
        >
          <MoreVertical size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={COLORS.status.error} />
            <Text style={[styles.menuText, { color: COLORS.status.error }]}>
              Delete Document
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Document Content */}
      <View style={styles.content}>
        {isPDF ? (
          <WebView
            source={{ uri: document.fileUrl }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color={COLORS.primary.blue} />
              </View>
            )}
            onError={() => {
              Alert.alert(
                "Error",
                "Failed to load PDF. Please try again later."
              );
            }}
          />
        ) : (
          <ScrollView
            style={styles.imageScroll}
            contentContainerStyle={styles.imageScrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
          >
            {!imageError ? (
              <Image
                source={{ uri: document.fileUrl }}
                style={styles.image}
                contentFit="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load image</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* AI Suggestion Banner */}
      <TouchableOpacity
        style={styles.suggestionBanner}
        onPress={onAIAction}
        activeOpacity={0.8}
      >
        <View style={styles.suggestionContent}>
          <View style={styles.suggestionIcon}>
            <Sparkles size={20} color={COLORS.primary.blue} />
          </View>
          <View style={styles.suggestionText}>
            <Text style={styles.suggestionTitle}>{suggestion.text}</Text>
            <Text style={styles.suggestionDescription}>
              {suggestion.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onAIAction}
        activeOpacity={0.8}
      >
        <Sparkles size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  menu: {
    position: "absolute",
    top: 110,
    right: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  webviewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.primary,
  },
  imageScroll: {
    flex: 1,
  },
  imageScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: "100%",
    minHeight: 400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.tertiary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    textAlign: "center",
  },
  suggestionBanner: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.blue,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary.blue,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
