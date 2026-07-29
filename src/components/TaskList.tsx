import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTasks } from "../hooks/useTasks";
import { scheduleTaskReminder } from "../services/notifications";

interface Props {
  incidentId: string;
}

export default function TaskList({ incidentId }: Props) {
  const { tasks, loading, add, toggle } = useTasks(incidentId);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAdd = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    await add({ incidentId, title, completed: false });
    setNewTaskTitle("");
  };

  const handleReminder = async (taskId: string, title: string, dueDate?: string) => {
    if (!dueDate) {
      Alert.alert("No due date", "Set a due date on this task to enable reminders.");
      return;
    }
    const id = await scheduleTaskReminder(taskId, title, dueDate);
    if (id) {
      Alert.alert("Reminder Set", `You'll be notified about "${title}"`);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#2563eb" className="py-4" />;
  }

  return (
    <View>
      {tasks.map((task) => (
        <View key={task.id} className="mb-2 flex-row items-center rounded-lg bg-gray-50 p-3">
          <TouchableOpacity onPress={() => toggle(task.id)} className="flex-1 flex-row items-center">
            <Ionicons
              name={task.completed ? "checkmark-circle" : "ellipse-outline"}
              size={20}
              color={task.completed ? "#10b981" : "#9ca3af"}
            />
            <Text
              className={`ml-3 flex-1 text-sm ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}
            >
              {task.title}
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            {task.dueDate && (
              <Text className="text-xs text-gray-400">{task.dueDate}</Text>
            )}
            <TouchableOpacity onPress={() => handleReminder(task.id, task.title, task.dueDate)}>
              <Ionicons name="notifications-outline" size={18} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View className="mt-2 flex-row items-center gap-2">
        <TextInput
          className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm"
          placeholder="Add a task..."
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity onPress={handleAdd} className="rounded-lg bg-blue-600 p-2.5">
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
