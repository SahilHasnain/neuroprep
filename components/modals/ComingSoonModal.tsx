import { Modal, View, Text, Pressable } from "react-native";
import {
  X,
  Clock,
  Sparkles,
  MessageCircle,
  FileQuestion,
  FileText,
} from "lucide-react-native";
import Button from "../ui/Button";
import { useModalVisibility } from "@/hooks/useModalVisibility";

interface ComingSoonModalProps {
  visible: boolean;
  onClose: () => void;
  feature: "doubts" | "questions" | "notes";
}

export default function ComingSoonModal({
  visible,
  onClose,
  feature,
}: ComingSoonModalProps) {
  useModalVisibility("coming-soon-modal", visible);
  const featureConfig = {
    doubts: {
      icon: MessageCircle,
      name: "Doubts",
      color: "#3b82f6", // blue
    },
    questions: {
      icon: FileQuestion,
      name: "Questions",
      color: "#8b5cf6", // purple
    },
    notes: {
      icon: FileText,
      name: "Notes",
      color: "#10b981", // green
    },
  };

  const config = featureConfig[feature];
  const FeatureIcon = config.icon;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="items-center justify-center flex-1 px-6 bg-black/85">
        <View className="w-full max-w-md overflow-hidden bg-dark-bg-secondary rounded-3xl">
          {/* Header */}
          <View className="px-6 py-4 border-b bg-gradient-to-r from-accent-blue to-accent-purple border-dark-surface-300">
            <Pressable
              onPress={onClose}
              className="absolute z-10 top-4 right-4"
            >
              <X size={24} color="#e5e5e5" />
            </Pressable>
            <View className="items-center pt-2">
              <View className="items-center justify-center w-16 h-16 mb-3 rounded-full bg-info-bg">
                <FeatureIcon size={32} color={config.color} />
              </View>
              <Text className="text-xl font-bold text-white">
                Daily Limit Reached
              </Text>
            </View>
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            <Text className="mb-4 text-base text-center text-text-secondary">
              You&apos;ve used all your {config.name.toLowerCase()} for today.
            </Text>

            {/* Coming Soon Card */}
            <View className="p-4 mb-6 border border-accent-purple bg-accent-purple/20 rounded-xl">
              <View className="flex-row items-center justify-center mb-2">
                <Sparkles size={20} color="#c084fc" />
                <Text className="ml-2 text-base font-bold text-accent-purple-light">
                  Pro Plan Coming Soon!
                </Text>
              </View>
              <Text className="text-sm text-center text-accent-purple-light">
                We&apos;re working on bringing you unlimited access and premium
                features.
              </Text>
            </View>

            {/* Try Again Message */}
            <View className="flex-row items-center justify-center p-4 mb-6 bg-dark-surface-100 rounded-xl">
              <Clock size={20} color="#9ca3af" />
              <Text className="ml-2 text-sm text-text-tertiary">
                Your limit resets at midnight IST
              </Text>
            </View>

            {/* Dismiss Button */}
            <Button title="Got it" onPress={onClose} fullWidth />
          </View>
        </View>
      </View>
    </Modal>
  );
}
