import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DocumentContentProps {
  fileUrl: string;
}

const styles = StyleSheet.create({
  controlsContainer: {
    paddingHorizontal: 16,
  },
  controlButton: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.border.default,
  },
  textPrimary: {
    color: COLORS.text.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageStyle: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    minHeight: 400,
  },
  scrollViewContainer: {
    flex: 1,
  },
  textTertiary: {
    color: COLORS.text.tertiary,
  },
  resetButton: {
    backgroundColor: COLORS.primary.blue,
    borderColor: COLORS.primary.blue,
  },
});

export default function DocumentContent({ fileUrl }: DocumentContentProps) {
  const [imageError, setImageError] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  const handleZoomIn = () => {
    setImageZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setImageZoom(1);
  };

  return (
    <View className="flex-1">
      {/* Horizontal ScrollView (outer) - only active when zoomed */}
      <ScrollView
        horizontal
        style={styles.scrollViewContainer}
        contentContainerStyle={
          imageZoom > 1
            ? {
                minWidth: SCREEN_WIDTH * imageZoom,
                justifyContent: "center",
              }
            : undefined
        }
        scrollEnabled={imageZoom > 1}
        showsHorizontalScrollIndicator={imageZoom > 1}
        showsVerticalScrollIndicator={false}
        bounces={imageZoom > 1}
      >
        {/* Vertical ScrollView (inner) - only active when zoomed */}
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={
            imageZoom > 1
              ? {
                  minHeight: (SCREEN_HEIGHT - 200) * imageZoom,
                  alignItems: "center",
                  justifyContent: "center",
                }
              : styles.scrollContent
          }
          scrollEnabled={imageZoom > 1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={imageZoom > 1}
          bounces={imageZoom > 1}
        >
          <View
            style={{
              transform: [{ scale: imageZoom }],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!imageError ? (
              <Image
                source={{ uri: fileUrl }}
                style={styles.imageStyle}
                contentFit="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <View className="items-center justify-center flex-1 p-10">
                <Text
                  className="text-base text-center"
                  style={styles.textTertiary}
                >
                  Failed to load image
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Image Controls */}
      <View
        className="absolute left-0 right-0 flex-row items-center justify-center gap-2 bottom-4"
        style={styles.controlsContainer}
      >
        {/* Zoom Controls */}
        <View
          className="flex-row items-center gap-2 px-3 py-2 border rounded-full"
          style={styles.controlButton}
        >
          <TouchableOpacity
            onPress={handleZoomOut}
            disabled={imageZoom <= 1}
            className="active:scale-90"
          >
            <ZoomOut
              size={18}
              color={
                imageZoom <= 1 ? COLORS.text.tertiary : COLORS.text.primary
              }
            />
          </TouchableOpacity>
          <Text
            className="text-xs font-medium min-w-[40px] text-center"
            style={styles.textPrimary}
          >
            {Math.round(imageZoom * 100)}%
          </Text>
          <TouchableOpacity
            onPress={handleZoomIn}
            disabled={imageZoom >= 3}
            className="active:scale-90"
          >
            <ZoomIn
              size={18}
              color={
                imageZoom >= 3 ? COLORS.text.tertiary : COLORS.text.primary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Reset Zoom Button */}
        {imageZoom > 1 && (
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 border rounded-full active:scale-90"
            style={styles.resetButton}
            onPress={handleResetZoom}
          >
            <Maximize2 size={16} color={COLORS.text.primary} />
            <Text className="text-xs font-medium" style={styles.textPrimary}>
              Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
