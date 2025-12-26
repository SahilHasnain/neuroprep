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
      <Text className="mb-2 text-base font-medium text-gray-700">{label}</Text>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between px-4 py-3 bg-white border-[1px] border-gray-300 rounded-xl"
      >
        <Text
          className={clsx(
            "text-base",
            selectedOption ? "text-gray-900" : "text-gray-400"
          )}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={20} color="#9ca3af" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-black/50" edges={["bottom"]}>
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
                <View className="bg-white rounded-t-3xl max-h-96">
                  <View className="items-center py-3 border-b-[1px] border-gray-200">
                    <View className="w-12 h-1 bg-gray-300 rounded-full" />
                    <Text className="mt-3 text-lg font-semibold text-gray-900">
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
                          "py-4 border-b-[1px] border-gray-100 flex-row items-center justify-between",
                          value === option.value && "bg-blue-50",
                          (option.locked || option.disabled) && "opacity-60"
                        )}
                      >
                        <Text
                          className={clsx(
                            "text-base",
                            value === option.value
                              ? "text-blue-600 font-semibold"
                              : option.locked || option.disabled
                                ? "text-gray-500"
                                : "text-gray-900"
                          )}
                        >
                          {option.label}
                        </Text>
                        {(option.locked || option.disabled) && (
                          <Lock size={16} color="#9ca3af" />
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
