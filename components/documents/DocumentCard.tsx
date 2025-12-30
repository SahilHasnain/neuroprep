import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { FileText, Image as ImageIcon } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { Document, DocumentType } from "@/types/document";

interface DocumentCardProps {
  document: Document;
  onPress: (document: Document) => void;
  isLoading?: boolean;
}

export default function DocumentCard({
  document,
  onPress,
  isLoading = false,
}: DocumentCardProps) {
  const isImage = document.type === DocumentType.IMAGE;
  const Icon = isImage ? ImageIcon : FileText;
  const relativeDate = getRelativeDate(document.$createdAt);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={[styles.thumbnail, styles.loadingThumbnail]} />
        <View style={styles.cardInfo}>
          <View style={[styles.loadingText, { width: "80%" }]} />
          <View style={[styles.loadingText, { width: "50%", height: 12 }]} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(document)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {document.thumbnailUrl ? (
          <Image
            source={{ uri: document.thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.thumbnail}>
            <Icon size={40} color={COLORS.primary.blue} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {document.title}
          </Text>
          <View style={styles.cardMeta}>
            <Icon size={14} color={COLORS.text.tertiary} />
            <Text style={styles.cardDate}>{relativeDate}</Text>
          </View>
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  thumbnail: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.border.default,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingThumbnail: {
    backgroundColor: COLORS.border.default,
  },
  cardInfo: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  loadingText: {
    height: 16,
    backgroundColor: COLORS.border.default,
    borderRadius: 4,
  },
});
