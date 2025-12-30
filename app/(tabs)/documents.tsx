import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, FileText, Image as ImageIcon } from "lucide-react-native";
import { useDocumentStore } from "@/store/documentStore";
import type { Document } from "@/types/document";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentUploadModal from "@/components/documents/DocumentUploadModal";
import { COLORS } from "@/constants/theme";

export default function DocumentsScreen() {
  const router = useRouter();
  const {
    documents,
    isLoading,
    error,
    uploadStatus,
    fetchDocuments,
    uploadDocument,
  } = useDocumentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
    mimeType: string;
  } | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const handleDocumentPress = (document: Document) => {
    router.push(`/document/${document.$id}`);
  };

  const handleAddPress = () => {
    setUploadModalVisible(true);
  };

  const handleFileSelected = (file: {
    uri: string;
    name: string;
    type: string;
    mimeType: string;
  }) => {
    setSelectedFile(file);
    // Pre-fill title with filename without extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setDocumentTitle(nameWithoutExt);
    setTitleModalVisible(true);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentTitle.trim()) {
      Alert.alert("Error", "Please enter a document title");
      return;
    }

    setTitleModalVisible(false);

    try {
      // Convert URI to Blob for upload
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      const success = await uploadDocument(
        blob,
        documentTitle.trim(),
        selectedFile.type
      );

      if (success) {
        Alert.alert("Success", "Document uploaded successfully!");
        setSelectedFile(null);
        setDocumentTitle("");
      } else {
        Alert.alert("Error", "Failed to upload document. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "An error occurred during upload");
    }
  };

  const handleCancelUpload = () => {
    setTitleModalVisible(false);
    setSelectedFile(null);
    setDocumentTitle("");
  };

  const renderDocumentCard = ({ item }: { item: Document }) => {
    return <DocumentCard document={item} onPress={handleDocumentPress} />;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FileText size={64} color="#6b7280" />
      <Text style={styles.emptyTitle}>No Documents Yet</Text>
      <Text style={styles.emptyText}>
        Upload your first document to get started
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddPress}>
        <Plus size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Upload Document</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.container}>
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.card, styles.skeletonCard]}>
            <View style={styles.skeleton} />
          </View>
        ))}
      </View>
    </View>
  );

  if (isLoading && documents.length === 0) {
    return renderLoadingSkeleton();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {uploadStatus === "uploading" && (
        <View style={styles.uploadingBanner}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.uploadingText}>Uploading document...</Text>
        </View>
      )}

      {uploadStatus === "processing" && (
        <View style={styles.uploadingBanner}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.uploadingText}>Processing document...</Text>
        </View>
      )}

      <FlatList
        data={documents}
        renderItem={renderDocumentCard}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.blue}
          />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <DocumentUploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onFileSelected={handleFileSelected}
      />

      {/* Title Input Modal */}
      {titleModalVisible && (
        <View style={styles.titleModalOverlay}>
          <View style={styles.titleModal}>
            <Text style={styles.titleModalTitle}>Document Title</Text>
            <TextInput
              style={styles.titleInput}
              value={documentTitle}
              onChangeText={setDocumentTitle}
              placeholder="Enter document title"
              placeholderTextColor={COLORS.text.tertiary}
              autoFocus
            />
            <View style={styles.titleModalButtons}>
              <TouchableOpacity
                style={[styles.titleModalButton, styles.cancelButton]}
                onPress={handleCancelUpload}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.titleModalButton, styles.uploadButton]}
                onPress={handleUpload}
              >
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  errorBanner: {
    backgroundColor: COLORS.status.error,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.text.primary,
    textAlign: "center",
  },
  uploadingBanner: {
    backgroundColor: COLORS.primary.blue,
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadingText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  grid: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  thumbnail: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.border.default,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardInfo: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  skeletonCard: {
    height: 200,
  },
  skeleton: {
    flex: 1,
    backgroundColor: COLORS.border.default,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary.blue,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  titleModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleModal: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  titleModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  titleInput: {
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  titleModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  titleModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: COLORS.primary.blue,
  },
  uploadButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
