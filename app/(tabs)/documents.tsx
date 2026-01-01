import React, { useEffect, useState, useCallback } from "react";
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
import { Plus, FileText } from "lucide-react-native";
import { useDocumentStore } from "@/store/documentStore";
import type { Document, UploadOptions } from "@/types/document";
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
    generationStates,
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
  const [uploadOptions, setUploadOptions] = useState<UploadOptions | null>(
    null
  );
  const [documentTitle, setDocumentTitle] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const handleDocumentPress = useCallback(
    (document: Document) => {
      router.push(`/document/${document.$id}`);
    },
    [router]
  );

  const handleAddPress = () => {
    setUploadModalVisible(true);
  };

  const handleFileSelected = (
    file: {
      uri: string;
      name: string;
      type: string;
      mimeType: string;
    },
    options: UploadOptions
  ) => {
    setSelectedFile(file);
    setUploadOptions(options);
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
      const fileToUpload = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || selectedFile.type,
      };

      const documentId = await uploadDocument(
        fileToUpload,
        documentTitle.trim(),
        selectedFile.type,
        uploadOptions || undefined
      );

      if (documentId) {
        const hasAutoGenerate =
          uploadOptions?.generateQuestions || uploadOptions?.generateNotes;

        // Check if the uploaded document has OCR text
        const uploadedDoc = documents.find((d) => d.$id === documentId);
        const hasNoText =
          !uploadedDoc?.ocrText || uploadedDoc.ocrText.trim().length === 0;
        const hasShortText =
          uploadedDoc?.ocrText && uploadedDoc.ocrText.length < 50;

        if (hasNoText) {
          Alert.alert(
            "Upload Successful - Text Extraction Failed",
            "Your document was uploaded, but we couldn't extract any text from it. You can view the document, but AI features (questions/notes generation) won't work.\n\nTip: Try uploading a clearer image or a text-based PDF.",
            [{ text: "OK" }]
          );
        } else if (hasShortText) {
          Alert.alert(
            "Upload Successful - Limited Text",
            "Your document was uploaded, but very little text was extracted. AI-generated content may be limited.\n\nTip: Ensure the document has clear, readable text.",
            [{ text: "OK" }]
          );
        } else if (hasAutoGenerate) {
          Alert.alert(
            "Success",
            "Document uploaded! AI is generating your study materials..."
          );
        } else {
          Alert.alert("Success", "Document uploaded successfully!");
        }

        setSelectedFile(null);
        setDocumentTitle("");
        setUploadOptions(null);
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
    setUploadOptions(null);
  };

  const renderDocumentCard = useCallback(
    ({ item }: { item: Document }) => {
      const genState = generationStates[item.$id];
      return (
        <DocumentCard
          document={item}
          onPress={handleDocumentPress}
          generationState={genState}
        />
      );
    },
    [generationStates, handleDocumentPress]
  );

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

  if (isLoading && (!documents || documents.length === 0)) {
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

            {/* Show what will be generated */}
            {(uploadOptions?.generateQuestions ||
              uploadOptions?.generateNotes) && (
              <View style={styles.generationInfo}>
                <Text style={styles.generationInfoTitle}>
                  Will auto-generate:
                </Text>
                {uploadOptions?.generateQuestions && (
                  <Text style={styles.generationInfoItem}>
                    • 5 Easy Questions
                  </Text>
                )}
                {uploadOptions?.generateNotes && (
                  <Text style={styles.generationInfoItem}>• Brief Notes</Text>
                )}
              </View>
            )}

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
    marginBottom: 16,
  },
  generationInfo: {
    backgroundColor: COLORS.background.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.blue,
  },
  generationInfoTitle: {
    fontSize: 13,
    color: COLORS.primary.blue,
    fontWeight: "500",
    marginBottom: 6,
  },
  generationInfoItem: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginLeft: 4,
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
