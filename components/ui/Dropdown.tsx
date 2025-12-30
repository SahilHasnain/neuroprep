import clsx from "clsx";
import { ChevronDown, Lock } from "lucide-react-native";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DropdownProps {
  label: string;
  value: string;
  options: {
    label: string;
    value: string;
    locked?: boolean;
    disabled?: boolean;
  }[];
  onSelect: (value: string) => void;
  placeholder?: string;
  onLockedPress?: () => void;
}

export default function Dropdown({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option",
  onLockedPress,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-base font-medium text-gray-300">{label}</Text>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between px-4 py-3 bg-surface-dark border-[1px] border-gray-700 rounded-xl"
      >
        <Text
          className={clsx(
            "text-base",
            selectedOption ? "text-gray-100" : "text-gray-500"
          )}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-black/85" edges={["bottom"]}>
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          >
            <View className="justify-end flex-1">
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View className="bg-surface-dark rounded-t-3xl max-h-96 border-t-[1px] border-gray-700">
                  <View className="items-center py-3 border-b-[1px] border-gray-700">
                    <View className="w-12 h-1 bg-gray-600 rounded-full" />
                    <Text className="mt-3 text-lg font-semibold text-gray-100">
                      {label}
                    </Text>
                  </View>
                  <ScrollView className="px-4">
                    {options.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                          if (option.locked || option.disabled) {
                            setIsOpen(false);
                            onLockedPress?.();
                          } else {
                            onSelect(option.value);
                            setIsOpen(false);
                          }
                        }}
                        className={clsx(
                          "py-4 border-b-[1px] border-gray-800 flex-row items-center justify-between",
                          value === option.value && "bg-blue-500/10",
                          (option.locked || option.disabled) && "opacity-60"
                        )}
                      >
                        <Text
                          className={clsx(
                            "text-base",
                            value === option.value
                              ? "text-blue-400 font-semibold"
                              : option.locked || option.disabled
                                ? "text-gray-500"
                                : "text-gray-200"
                          )}
                        >
                          {option.label}
                        </Text>
                        {(option.locked || option.disabled) && (
                          <Lock size={16} color="#6b7280" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
