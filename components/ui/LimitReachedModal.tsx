import { Modal, View, Text, Pressable } from "react-native";
import { X, AlertCircle, Crown } from "lucide-react-native";
import Button from "./Button";

interface LimitReachedModalProps {
  visible: boolean;
  feature: 'doubts' | 'questions' | 'notes';
  quota: { used: number; limit: number };
  onUpgrade: () => void;
  onClose: () => void;
}

export default function LimitReachedModal({
  visible,
  feature,
  quota,
  onUpgrade,
  onClose,
}: LimitReachedModalProps) {
  const featureNames = {
    doubts: 'Doubts',
    questions: 'Question Sets',
    notes: 'AI Notes'
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="items-center justify-center flex-1 px-6 bg-black/50">
        <View className="w-full max-w-md overflow-hidden bg-white rounded-3xl">
          <View className="px-6 py-4 border-b bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <Pressable onPress={onClose} className="absolute z-10 top-4 right-4">
              <X size={24} color="#92400e" />
            </Pressable>
            <View className="items-center pt-2">
              <View className="items-center justify-center w-16 h-16 mb-3 rounded-full bg-amber-100">
                <AlertCircle size={32} color="#d97706" />
              </View>
              <Text className="text-xl font-bold text-amber-900">Daily Limit Reached</Text>
            </View>
          </View>

          <View className="px-6 py-6">
            <Text className="mb-4 text-center text-gray-600">
              You&apos;ve used all your {featureNames[feature].toLowerCase()} for today
            </Text>

            <View className="p-4 mb-6 bg-gray-50 rounded-xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-600">Today&apos;s Usage</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {quota.used}/{quota.limit}
                </Text>
              </View>
              <View className="h-2 overflow-hidden bg-gray-200 rounded-full">
                <View className="h-full rounded-full bg-amber-500" style={{ width: '100%' }} />
              </View>
            </View>

            <View className="p-4 mb-6 border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Crown size={20} color="#3b82f6" />
                <Text className="ml-2 text-base font-bold text-blue-900">Upgrade to Pro</Text>
              </View>
              <Text className="mb-3 text-sm text-blue-700">Get unlimited access to:</Text>
              <View className="space-y-1">
                <Text className="text-sm text-blue-700">• Unlimited doubts & questions</Text>
                <Text className="text-sm text-blue-700">• Advanced difficulty levels</Text>
                <Text className="text-sm text-blue-700">• Detailed AI notes</Text>
              </View>
            </View>

            <Button title="Upgrade to Pro" onPress={onUpgrade} fullWidth />
            <Pressable onPress={onClose} className="mt-3">
              <Text className="text-sm text-center text-gray-500">Try again tomorrow</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
