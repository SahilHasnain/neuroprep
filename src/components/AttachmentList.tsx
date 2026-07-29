import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useMode } from "../hooks/useMode";
import { appwriteService, storage, BUCKET_ID } from "../services/appwrite";

interface Props {
  incidentId: string;
}

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

const mockAttachments: Record<string, Attachment[]> = {
  "1": [
    { id: "a1", fileName: "email_screenshot.png", fileUrl: "", fileType: "image/png", uploadedAt: "2026-07-28T09:30:00Z" },
    { id: "a2", fileName: "incident_report.pdf", fileUrl: "", fileType: "application/pdf", uploadedAt: "2026-07-28T10:00:00Z" },
  ],
  "2": [
    { id: "a3", fileName: "device_details.docx", fileUrl: "", fileType: "application/msword", uploadedAt: "2026-07-25T14:30:00Z" },
  ],
  "8": [
    { id: "a4", fileName: "access_logs.csv", fileUrl: "", fileType: "text/csv", uploadedAt: "2026-07-05T11:00:00Z" },
    { id: "a5", fileName: "customer_notice.pdf", fileUrl: "", fileType: "application/pdf", uploadedAt: "2026-07-06T09:00:00Z" },
  ],
};

function mimeToIcon(mime: string): keyof typeof Ionicons.glyphMap {
  if (mime.startsWith("image/")) return "image-outline";
  if (mime === "application/pdf") return "document-text-outline";
  if (mime.includes("csv") || mime.includes("spreadsheet")) return "grid-outline";
  if (mime.includes("word") || mime.includes("document")) return "document-text-outline";
  return "document-outline";
}

export default function AttachmentList({ incidentId }: Props) {
  const { mode } = useMode();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (mode === "demo") {
      setAttachments(mockAttachments[incidentId] ?? []);
    } else {
      appwriteService.getFiles(incidentId).then((files) => {
        setAttachments(
          files.map((f: any) => ({
            id: f.$id,
            fileName: f.name,
            fileUrl: storage.getFileView(BUCKET_ID, f.$id).toString(),
            fileType: f.mimeType ?? "application/octet-stream",
            uploadedAt: f.$createdAt,
          }))
        );
      });
    }
  }, [mode, incidentId]);

  const handleAdd = async () => {
    if (mode === "demo") {
      setAttachments((prev) => [
        ...prev,
        {
          id: `a${Date.now()}`,
          fileName: `evidence_${(prev.length + 1).toString().padStart(2, "0")}.pdf`,
          fileUrl: "",
          fileType: "application/pdf",
          uploadedAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      const url = await appwriteService.uploadFile(incidentId, file);
      setAttachments((prev) => [
        ...prev,
        {
          id: url.split("/").pop() ?? `f${Date.now()}`,
          fileName: file.name,
          fileUrl: url,
          fileType: file.mimeType ?? "application/octet-stream",
          uploadedAt: new Date().toISOString(),
        },
      ]);
    } catch (e: any) {
      Alert.alert("Upload failed", e.message);
    }
  };

  if (attachments.length === 0) {
    return (
      <View>
        <Text className="mb-3 text-sm text-gray-400">No attachments</Text>
        <TouchableOpacity onPress={handleAdd} className="flex-row items-center gap-1">
          <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
          <Text className="text-sm text-blue-600">Add attachment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      {attachments.map((att) => (
        <TouchableOpacity
          key={att.id}
          className="mb-2 flex-row items-center rounded-lg bg-gray-50 p-3"
        >
          <Ionicons
            name={mimeToIcon(att.fileType)}
            size={20}
            color="#6b7280"
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm text-gray-900">{att.fileName}</Text>
            <Text className="text-xs text-gray-400">
              {new Date(att.uploadedAt).toLocaleDateString()}
            </Text>
          </View>
          <Ionicons name="download-outline" size={18} color="#9ca3af" />
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={handleAdd} className="mt-1 flex-row items-center gap-1">
        <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
        <Text className="text-sm text-blue-600">Add attachment</Text>
      </TouchableOpacity>
    </View>
  );
}
