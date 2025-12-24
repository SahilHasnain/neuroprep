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
      <View className="items-center justify-center flex-1 px-6 bg-black/50">
        <View className="w-full max-w-md overflow-hidden bg-white rounded-3xl">
          {/* Header */}
          <View className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <Pressable
              onPress={onClose}
              className="absolute z-10 top-4 right-4"
            >
              <X size={24} color="#1e40af" />
            </Pressable>
            <View className="items-center pt-2">
              <View className="items-center justify-center w-16 h-16 mb-3 rounded-full bg-blue-100">
                <FeatureIcon size={32} color={config.color} />
              </View>
              <Text className="text-xl font-bold text-blue-900">
                Daily Limit Reached
              </Text>
            </View>
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            <Text className="mb-4 text-base text-center text-gray-600">
              You&apos;ve used all your {config.name.toLowerCase()} for today.
            </Text>

            {/* Coming Soon Card */}
            <View className="p-4 mb-6 border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <View className="flex-row items-center justify-center mb-2">
                <Sparkles size={20} color="#9333ea" />
                <Text className="ml-2 text-base font-bold text-purple-900">
                  Pro Plan Coming Soon!
                </Text>
              </View>
              <Text className="text-sm text-center text-purple-700">
                We&apos;re working on bringing you unlimited access and premium
                features.
              </Text>
            </View>

            {/* Try Again Message */}
            <View className="flex-row items-center justify-center p-4 mb-6 bg-gray-50 rounded-xl">
              <Clock size={20} color="#6b7280" />
              <Text className="ml-2 text-sm text-gray-600">
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
