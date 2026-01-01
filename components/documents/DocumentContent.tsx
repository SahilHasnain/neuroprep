import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import { COLORS } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DocumentContentProps {
  fileUrl: string;
  isPDF: boolean;
}

export default function DocumentContent({
  fileUrl,
  isPDF,
}: DocumentContentProps) {
  const [imageError, setImageError] = useState(false);

  if (isPDF) {
    return (
      <View className="flex-1">
        <WebView
          source={{ uri: fileUrl }}
          style={{ flex: 1, backgroundColor: COLORS.background.primary }}
          startInLoadingState
          renderLoading={() => (
            <View
              className="absolute inset-0 items-center justify-center"
              style={{ backgroundColor: COLORS.background.primary }}
            >
              <ActivityIndicator size="large" color={COLORS.primary.blue} />
            </View>
          )}
          onError={() => {
            Alert.alert("Error", "Failed to load PDF. Please try again later.");
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      maximumZoomScale={3}
      minimumZoomScale={1}
      showsVerticalScrollIndicator={false}
    >
      {!imageError ? (
        <Image
          source={{ uri: fileUrl }}
          style={{ width: SCREEN_WIDTH, height: "100%", minHeight: 400 }}
          contentFit="contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="items-center justify-center flex-1 p-10">
          <Text
            className="text-base text-center"
            style={{ color: COLORS.text.tertiary }}
          >
            Failed to load image
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
