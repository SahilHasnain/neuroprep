import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  PanResponder,
} from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MIN_HEIGHT = 80;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

interface DismissibleBottomSheetProps {
  children: React.ReactNode;
  isVisible: boolean;
  onToggle: () => void;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});

export default function DismissibleBottomSheet({
  children,
  isVisible,
  onToggle,
}: DismissibleBottomSheetProps) {
  const translateY = useRef(
    new Animated.Value(MAX_HEIGHT - MIN_HEIGHT)
  ).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isVisible ? 0 : MAX_HEIGHT - MIN_HEIGHT,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [isVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          onToggle();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: MAX_HEIGHT,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Drag Handle */}
      <View {...panResponder.panHandlers}>
        <View style={styles.handle} />

        {/* Header */}
        <TouchableOpacity
          style={styles.headerContainer}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.headerText}>
            {isVisible ? "Actions & Status" : "Tap to expand"}
          </Text>
          {isVisible ? (
            <ChevronDown size={20} color={COLORS.text.secondary} />
          ) : (
            <ChevronUp size={20} color={COLORS.text.secondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isVisible && <View style={styles.contentContainer}>{children}</View>}
    </Animated.View>
  );
}
