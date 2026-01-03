import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface FlashcardComponentProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function FlashcardComponent({
  front,
  back,
  isFlipped,
  onFlip,
}: FlashcardComponentProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, { duration: 300 });
  }, [isFlipped]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    const opacity = interpolate(rotation.value, [0, 90, 180], [1, 0, 0]);

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    const opacity = interpolate(rotation.value, [0, 90, 180], [0, 0, 1]);

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFlip();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      style={styles.container}
    >
      {/* Front Side */}
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <LinearGradient
          colors={["#2563eb", "#1d4ed8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.label}>Question</Text>
            <Text style={styles.text}>{front}</Text>
            <Text style={styles.hint}>Tap to reveal answer</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Back Side */}
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <LinearGradient
          colors={["#10b981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.label}>Answer</Text>
            <Text style={styles.text}>{back}</Text>
            <Text style={styles.hint}>Tap to see question</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 450,
    position: "relative",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  cardBack: {
    position: "absolute",
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 32,
    flex: 1,
    marginVertical: 16,
  },
  hint: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 16,
  },
});
