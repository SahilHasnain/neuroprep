import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const styles = StyleSheet.create({
  textPrimary: {
    color: COLORS.text.primary,
  },
  closeButton: {
    backgroundColor: COLORS.background.secondary,
  },
});

export default function Toast({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={20} color={COLORS.status.success} />;
      case "error":
        return <XCircle size={20} color={COLORS.status.error} />;
      case "warning":
        return <AlertCircle size={20} color={COLORS.status.warning} />;
      default:
        return <Info size={20} color={COLORS.primary.blue} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return COLORS.status.success;
      case "error":
        return COLORS.status.error;
      case "warning":
        return COLORS.status.warning;
      default:
        return COLORS.primary.blue;
    }
  };

  const backgroundColor = getBackgroundColor();

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute top-16 left-4 right-4 z-50"
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        className="flex-row items-center justify-between gap-3 px-4 py-3 border rounded-2xl shadow-lg"
        style={{
          backgroundColor: COLORS.background.card,
          borderColor: backgroundColor,
          shadowColor: backgroundColor,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View
          className="items-center justify-center w-10 h-10 rounded-full"
          style={{ backgroundColor: `${backgroundColor}20` }}
        >
          {getIcon()}
        </View>
        <Text className="flex-1 text-sm font-medium" style={styles.textPrimary}>
          {message}
        </Text>
        <TouchableOpacity
          onPress={hideToast}
          className="items-center justify-center w-8 h-8 rounded-full active:scale-90"
          style={styles.closeButton}
        >
          <X size={16} color={COLORS.text.tertiary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
