// MVP_BYPASS: Removed userPlan, error, and upgrade prompts
import { Modal, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import InputTopic from "@/components/ui/InputTopic";
import { SUBJECTS, DIFFICULTY_LEVELS, QUESTION_COUNTS } from "@/constants";

// MVP_BYPASS: Removed userPlan, error, and upgrade prompts
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
  canGenerate: boolean;
  isDifficultyLocked: (diff: string) => boolean;
  isQuestionCountLocked: (count: string) => boolean;
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
  canGenerate,
  isDifficultyLocked,
  isQuestionCountLocked,
}: GenerateQuestionsModalProps) {
  const difficultyOptions = DIFFICULTY_LEVELS.map((d) => ({
    ...d,
    locked: isDifficultyLocked(d.value),
  }));

  const questionCountOptions = QUESTION_COUNTS.map((q) => ({
    ...q,
    locked: isQuestionCountLocked(q.value),
  }));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50" onTouchEnd={onClose}>
        <View className="flex-1" />
        <View
          className="bg-white rounded-t-3xl"
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              Generate Questions
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6 py-6" style={{ maxHeight: 500 }}>
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
            />

            <Dropdown
              label="Number of Questions"
              value={questionCount}
              options={questionCountOptions}
              onSelect={setQuestionCount}
              placeholder="Choose count"
            />

            <View className="mt-6">
              <Button
                title="Generate Questions"
                onPress={onGenerate}
                loading={loading}
                fullWidth
              />
            </View>

            {/* MVP_BYPASS: Removed error display and free plan info */}
            {!canGenerate && (
              <Text className="mt-3 text-sm text-center text-gray-500">
                Please fill all fields to generate questions
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
