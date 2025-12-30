import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDocumentStore } from "@/store/documentStore";
import DocumentViewer from "@/components/documents/DocumentViewer";
import DocumentActionSheet from "@/components/documents/DocumentActionSheet";
import { COLORS } from "@/constants/theme";

export default function DocumentViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    currentDocument,
    isLoading,
    error,
    getDocumentById,
    deleteDocument,
    setCurrentDocument,
  } = useDocumentStore();

  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  useEffect(() => {
    if (id) {
      getDocumentById(id);
    }

    // Cleanup on unmount
    return () => {
      setCurrentDocument(null);
    };
  }, [id]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  }, [error]);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (!id) return;

    const success = await deleteDocument(id);
    if (success) {
      Alert.alert("Success", "Document deleted successfully");
      router.back();
    } else {
      Alert.alert("Error", "Failed to delete document");
    }
  };

  const handleAIAction = () => {
    setActionSheetVisible(true);
  };

  const handleActionSelect = (
    action: "generate-questions" | "ask-doubt" | "create-notes"
  ) => {
    // Navigate to the appropriate screen with document context
    if (!currentDocument) return;

    const documentContext = {
      documentId: currentDocument.$id,
      documentTitle: currentDocument.title,
      documentType: currentDocument.type,
      ocrText: currentDocument.ocrText || "",
    };

    switch (action) {
      case "generate-questions":
        router.push({
          pathname: "/(tabs)/generate-questions",
          params: {
            documentContext: JSON.stringify(documentContext),
          },
        });
        break;
      case "ask-doubt":
        router.push({
          pathname: "/(tabs)/ask-doubt",
          params: {
            documentContext: JSON.stringify(documentContext),
          },
        });
        break;
      case "create-notes":
        router.push({
          pathname: "/(tabs)/notes",
          params: {
            documentContext: JSON.stringify(documentContext),
          },
        });
        break;
    }
  };

  if (!currentDocument && !isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {currentDocument && (
        <DocumentViewer
          document={currentDocument}
          onBack={handleBack}
          onDelete={handleDelete}
          onAIAction={handleAIAction}
          isLoading={isLoading}
        />
      )}

      <DocumentActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        onActionSelect={handleActionSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
});
