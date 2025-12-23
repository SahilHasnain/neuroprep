import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { X, AlertCircle } from "lucide-react-native";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import InputTopic from "@/components/ui/InputTopic";
import { SUBJECTS, DIFFICULTY_LEVELS, QUESTION_COUNTS } from "@/constants";
import type { ApiError } from "@/utils/errorHandler";

interface GenerateQuestionsModalProps {
  visible: boolean;
  onClose: () => void;
  subject: string;
  setSubject: (value: string) => void;
  topic: string;
  setTopic: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  questionCount: string;
  setQuestionCount: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
  error: ApiError | null;
  canGenerate: boolean;
  userPlan: string;
  isDifficultyLocked: (diff: string) => boolean;
  isQuestionCountLocked: (count: string) => boolean;
  onUpgradePress: () => void;
}

export default function GenerateQuestionsModal({
  visible,
  onClose,
  subject,
  setSubject,
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  questionCount,
  setQuestionCount,
  onGenerate,
  loading,
  error,
  canGenerate,
  userPlan,
  isDifficultyLocked,
  isQuestionCountLocked,
  onUpgradePress,
}: GenerateQuestionsModalProps) {
  const difficultyOptions = DIFFICULTY_LEVELS.map(d => ({
    ...d,
    locked: isDifficultyLocked(d.value),
  }));

  const questionCountOptions = QUESTION_COUNTS.map(q => ({
    ...q,
    locked: isQuestionCountLocked(q.value),
  }));

  const showUpgradeAlert = (message: string) => {
    onUpgradePress();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-gray-50">
        <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">Generate Questions</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          <Dropdown
            label="Select Subject"
            value={subject}
            options={SUBJECTS}
            onSelect={setSubject}
            placeholder="Choose a subject"
          />

          <InputTopic
            label="Enter Topic"
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g., Newton's Laws, Organic Reactions"
          />

          <Dropdown
            label="Difficulty Level"
            value={difficulty}
            options={difficultyOptions}
            onSelect={setDifficulty}
            placeholder="Choose difficulty"
            onLockedPress={() => showUpgradeAlert("Upgrade to Pro to unlock Medium and Hard difficulty levels!")}
          />

          <Dropdown
            label="Number of Questions"
            value={questionCount}
            options={questionCountOptions}
            onSelect={setQuestionCount}
            placeholder="Choose count"
            onLockedPress={() => showUpgradeAlert("Upgrade to Pro to generate more than 5 questions!")}
          />

          <View className="mt-6">
            <Button
              title="Generate Questions"
              onPress={onGenerate}
              loading={loading}
              fullWidth
            />
          </View>

          {error && (
            <View className="mt-3 p-3 bg-red-50 rounded-xl border-[1px] border-red-200 flex-row items-start">
              <AlertCircle size={18} color="#dc2626" style={{ marginTop: 2 }} />
              <Text className="ml-2 text-sm text-red-600 flex-1">
                {error.message}
              </Text>
            </View>
          )}

          {!canGenerate && !error && (
            <Text className="mt-3 text-sm text-center text-gray-500">
              Please fill all fields to generate questions
            </Text>
          )}

          {userPlan === "free" && !error && (
            <View className="mt-3 p-3 bg-blue-50 rounded-xl border-[1px] border-blue-200">
              <Text className="text-xs text-blue-700 text-center">
                Free plan: 1 set/day • Easy only • Max 5 questions
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
