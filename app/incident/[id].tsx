import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useIncidents } from "../../src/hooks/useIncidents";
import { useTimeline } from "../../src/hooks/useTimeline";
import { useTasks } from "../../src/hooks/useTasks";
import { generateIncidentReport, sharePDF } from "../../src/lib/pdf";
import Timeline from "../../src/components/Timeline";
import TaskList from "../../src/components/TaskList";
import Checklist from "../../src/components/Checklist";
import AttachmentList from "../../src/components/AttachmentList";

const severityColors: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

const statusColors: Record<string, string> = {
  open: "#f59e0b",
  investigating: "#3b82f6",
  pending: "#8b5cf6",
  closed: "#10b981",
  archived: "#6b7280",
};

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incidents, update } = useIncidents();
  const { addEvent } = useTimeline(id!);
  const { events } = useTimeline(id!);
  const { tasks } = useTasks(id!);
  const incident = incidents.find((i) => i.id === id);
  const [exporting, setExporting] = useState(false);

  if (!incident) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Incident not found</Text>
      </View>
    );
  }

  const nextStatus = () => {
    const flow: Record<string, string> = {
      open: "investigating",
      investigating: "pending",
      pending: "closed",
    };
    return flow[incident.status] ?? null;
  };

  const handleAdvanceStatus = () => {
    const next = nextStatus();
    if (next) {
      const action = next === "closed" ? "Incident Closed" : next === "investigating" ? "Investigation Started" : "Review Pending";
      update(incident.id, { status: next as any });
      addEvent({ incidentId: incident.id, action, description: `Status changed to ${next}` });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const uri = await generateIncidentReport(incident, events, tasks);
      await sharePDF(uri);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-4 pb-6 pt-4">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="rounded-full bg-white/20 p-1.5">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Incident Details</Text>
        </View>
      </View>
      <View className="bg-white p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">{incident.title}</Text>
            <Text className="mt-1 text-sm text-gray-500">{incident.date}</Text>
          </View>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: statusColors[incident.status] + "20" }}
          >
            <Text className="text-sm font-medium capitalize" style={{ color: statusColors[incident.status] }}>
              {incident.status}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: severityColors[incident.severity] + "20" }}
          >
            <Text className="text-sm capitalize" style={{ color: severityColors[incident.severity] }}>
              {incident.severity}
            </Text>
          </View>
          <View className="rounded-full bg-gray-100 px-3 py-1">
            <Text className="text-sm text-gray-700">{incident.category}</Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="person-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-500">{incident.reporter}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="briefcase-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-500">{incident.owner || "Unassigned"}</Text>
          </View>
        </View>

        {incident.description ? (
          <Text className="mt-4 text-sm leading-5 text-gray-700">{incident.description}</Text>
        ) : null}

        <View className="mt-4 flex-row gap-3">
          {nextStatus() && (
            <TouchableOpacity
              onPress={handleAdvanceStatus}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5"
            >
              <Ionicons name="arrow-forward" size={16} color="white" />
              <Text className="font-medium text-white">Move to {nextStatus()}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleExport}
            disabled={exporting}
            className="flex-row items-center justify-center gap-2 rounded-lg border border-blue-600 py-2.5"
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Ionicons name="document-text-outline" size={16} color="#2563eb" />
            )}
            <Text className="font-medium text-blue-600">PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 bg-white p-4">
        <Checklist incidentId={incident.id} category={incident.category} />
      </View>

      <View className="mt-4 bg-white p-4">
        <Text className="mb-2 text-base font-semibold text-gray-900">Attachments</Text>
        <AttachmentList incidentId={incident.id} />
      </View>

      <View className="mt-4 bg-white p-4">
        <Text className="mb-2 text-base font-semibold text-gray-900">Timeline</Text>
        <Timeline incidentId={incident.id} />
      </View>

      <View className="mt-4 bg-white p-4">
        <Text className="mb-2 text-base font-semibold text-gray-900">Tasks</Text>
        <TaskList incidentId={incident.id} />
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
