import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DocumentContentProps {
  fileUrl: string;
  isPDF: boolean;
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    backgroundColor: COLORS.background.primary,
  },
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
  touchableContainer: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
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
  zoomedScrollContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  textTertiary: {
    color: COLORS.text.tertiary,
  },
  resetButton: {
    backgroundColor: COLORS.primary.blue,
    borderColor: COLORS.primary.blue,
  },
});

export default function DocumentContent({
  fileUrl,
  isPDF,
}: DocumentContentProps) {
  const [imageError, setImageError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(1);

  // Image viewer state
  const [imageZoom, setImageZoom] = useState(1);
  const pinchScale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  const lastScale = useRef(1);
  const outerScrollRef = useRef<ScrollView>(null);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const clampScale = (value: number) => Math.min(Math.max(value, 1), 3);

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const nextScale = clampScale(lastScale.current * event.nativeEvent.scale);
      lastScale.current = nextScale;
      baseScale.setValue(nextScale);
      pinchScale.setValue(1);
      setImageZoom(nextScale);
    }
  };

  const handleDoubleTap = () => {
    const newZoom = imageZoom === 1 ? 2 : 1;
    setImageZoom(newZoom);
    lastScale.current = newZoom;
    Animated.spring(baseScale, {
      toValue: newZoom,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleZoomIn = () => {
    if (isPDF) {
      setPdfZoom((prev) => Math.min(prev + 0.25, 3));
    } else {
      const newZoom = Math.min(imageZoom + 0.5, 3);
      setImageZoom(newZoom);
      lastScale.current = newZoom;
      Animated.spring(baseScale, {
        toValue: newZoom,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleZoomOut = () => {
    if (isPDF) {
      setPdfZoom((prev) => Math.max(prev - 0.25, 0.5));
    } else {
      const newZoom = Math.max(imageZoom - 0.5, 1);
      setImageZoom(newZoom);
      lastScale.current = newZoom;
      Animated.spring(baseScale, {
        toValue: newZoom,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleResetZoom = () => {
    if (isPDF) {
      setPdfZoom(1);
    } else {
      setImageZoom(1);
      lastScale.current = 1;
      Animated.spring(baseScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      // Note: Actual PDF page navigation requires PDF.js integration
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      // Note: Actual PDF page navigation requires PDF.js integration
    }
  };

  if (isPDF) {
    return (
      <View className="flex-1">
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={{
            minWidth: pdfZoom > 1 ? SCREEN_WIDTH * pdfZoom : SCREEN_WIDTH,
            minHeight: pdfZoom > 1 ? SCREEN_HEIGHT * pdfZoom : SCREEN_HEIGHT,
          }}
          horizontal
          scrollEnabled={pdfZoom > 1}
          showsHorizontalScrollIndicator={pdfZoom > 1}
          showsVerticalScrollIndicator={false}
          bounces={pdfZoom > 1}
        >
          <ScrollView
            contentContainerStyle={{
              minWidth: pdfZoom > 1 ? SCREEN_WIDTH * pdfZoom : SCREEN_WIDTH,
              minHeight: pdfZoom > 1 ? SCREEN_HEIGHT * pdfZoom : SCREEN_HEIGHT,
            }}
            scrollEnabled={pdfZoom > 1}
            showsVerticalScrollIndicator={pdfZoom > 1}
            bounces={pdfZoom > 1}
          >
            <View style={{ transform: [{ scale: pdfZoom }] }}>
              <WebView
                source={{ uri: fileUrl }}
                style={styles.webView}
                startInLoadingState
                renderLoading={() => (
                  <View
                    className="absolute inset-0 items-center justify-center"
                    style={styles.loadingContainer}
                  >
                    <ActivityIndicator
                      size="large"
                      color={COLORS.primary.blue}
                    />
                  </View>
                )}
                onError={() => {
                  Alert.alert(
                    "Error",
                    "Failed to load PDF. Please try again later."
                  );
                }}
              />
            </View>
          </ScrollView>
        </ScrollView>

        {/* PDF Controls */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-center gap-2 bottom-4"
          style={styles.controlsContainer}
        >
          {/* Page Navigation */}
          <View
            className="flex-row items-center gap-2 px-4 py-2 border rounded-full"
            style={styles.controlButton}
          >
            <TouchableOpacity
              onPress={handlePrevPage}
              disabled={currentPage === 1}
              className="active:scale-90"
            >
              <ChevronLeft
                size={20}
                color={
                  currentPage === 1 ? COLORS.text.tertiary : COLORS.text.primary
                }
              />
            </TouchableOpacity>
            <Text className="text-sm font-medium" style={styles.textPrimary}>
              {currentPage} / {totalPages}
            </Text>
            <TouchableOpacity
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
              className="active:scale-90"
            >
              <ChevronRight
                size={20}
                color={
                  currentPage === totalPages
                    ? COLORS.text.tertiary
                    : COLORS.text.primary
                }
              />
            </TouchableOpacity>
          </View>

          {/* Zoom Controls */}
          <View
            className="flex-row items-center gap-2 px-3 py-2 border rounded-full"
            style={styles.controlButton}
          >
            <TouchableOpacity
              onPress={handleZoomOut}
              disabled={pdfZoom <= 0.5}
              className="active:scale-90"
            >
              <ZoomOut
                size={18}
                color={
                  pdfZoom <= 0.5 ? COLORS.text.tertiary : COLORS.text.primary
                }
              />
            </TouchableOpacity>
            <Text
              className="text-xs font-medium min-w-[40px] text-center"
              style={styles.textPrimary}
            >
              {Math.round(pdfZoom * 100)}%
            </Text>
            <TouchableOpacity
              onPress={handleZoomIn}
              disabled={pdfZoom >= 3}
              className="active:scale-90"
            >
              <ZoomIn
                size={18}
                color={
                  pdfZoom >= 3 ? COLORS.text.tertiary : COLORS.text.primary
                }
              />
            </TouchableOpacity>
          </View>

          {/* Download Button */}
          <TouchableOpacity
            className="p-2 border rounded-full active:scale-90"
            style={styles.controlButton}
            onPress={() =>
              Alert.alert("Coming Soon", "Download functionality coming soon!")
            }
          >
            <Download size={18} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDoubleTap}
        style={styles.touchableContainer}
      >
        <ScrollView
          ref={outerScrollRef}
          style={styles.scrollViewContainer}
          contentContainerStyle={{
            minWidth: imageZoom > 1 ? SCREEN_WIDTH * imageZoom : SCREEN_WIDTH,
            minHeight:
              imageZoom > 1
                ? (SCREEN_HEIGHT - 200) * imageZoom
                : SCREEN_HEIGHT - 200,
          }}
          horizontal
          scrollEnabled={imageZoom > 1}
          showsHorizontalScrollIndicator={imageZoom > 1}
          showsVerticalScrollIndicator={false}
          bounces={imageZoom > 1}
        >
          <ScrollView
            contentContainerStyle={{
              minWidth: imageZoom > 1 ? SCREEN_WIDTH * imageZoom : SCREEN_WIDTH,
              minHeight:
                imageZoom > 1
                  ? (SCREEN_HEIGHT - 200) * imageZoom
                  : SCREEN_HEIGHT - 200,
            }}
            scrollEnabled={imageZoom > 1}
            showsVerticalScrollIndicator={imageZoom > 1}
            bounces={imageZoom > 1}
          >
            <PinchGestureHandler
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={onPinchStateChange}
            >
              <Animated.View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale }],
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
              </Animated.View>
            </PinchGestureHandler>
          </ScrollView>
        </ScrollView>
      </TouchableOpacity>

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
