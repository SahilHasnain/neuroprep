import React, { useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDocumentStore } from "@/store/documentStore";
import DocumentViewer from "@/components/documents/DocumentViewer";
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
    generateQuestions,
    generateNotes,
  } = useDocumentStore();

  // Subscribe directly to generation state so UI reacts to updates
  const generationState = useDocumentStore((s) =>
    typeof id === "string" && id ? s.generationStates[id] : undefined
  );

  useEffect(() => {
    if (id) {
      getDocumentById(id);
    }

    return () => {
      setCurrentDocument(null);
    };
  }, [id, getDocumentById, setCurrentDocument]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  }, [error, router]);

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

  const handleGenerateQuestions = async () => {
    if (!id || !currentDocument) return;

    await generateQuestions(id, {
      difficulty: "easy",
      count: 5,
    });
  };

  const handleGenerateNotes = async () => {
    if (!id || !currentDocument) return;

    await generateNotes(id, { length: "brief" });
  };

  const handleViewQuestions = () => {
    if (!currentDocument) return;

    const genState = generationState?.questions;

    // If we have generated questions data, pass it to view directly
    if (genState?.status === "success" && genState.data) {
      router.push({
        pathname: "/(tabs)/generate-questions",
        params: {
          viewGeneratedQuestions: JSON.stringify({
            questions: genState.data,
            subject: inferSubjectFromTitle(currentDocument.title),
            topic: currentDocument.title,
            documentId: currentDocument.$id,
          }),
        },
      });
    } else {
      // Fallback to document context for new generation
      const documentContext = {
        documentId: currentDocument.$id,
        documentTitle: currentDocument.title,
        documentType: currentDocument.type,
        ocrText: currentDocument.ocrText || "",
      };

      router.push({
        pathname: "/(tabs)/generate-questions",
        params: {
          documentContext: JSON.stringify(documentContext),
        },
      });
    }
  };

  const handleViewNotes = () => {
    if (!currentDocument) return;

    const genState = generationState?.notes;

    // If we have generated notes data, pass it to view directly
    if (genState?.status === "success" && genState.data) {
      router.push({
        pathname: "/(tabs)/notes",
        params: {
          viewGeneratedNotes: JSON.stringify({
            notes: genState.data,
            subject: inferSubjectFromTitle(currentDocument.title),
            topic: currentDocument.title,
            documentId: currentDocument.$id,
          }),
        },
      });
    } else {
      // Fallback to document context for new generation
      const documentContext = {
        documentId: currentDocument.$id,
        documentTitle: currentDocument.title,
        documentType: currentDocument.type,
        ocrText: currentDocument.ocrText || "",
      };

      router.push({
        pathname: "/(tabs)/notes",
        params: {
          documentContext: JSON.stringify(documentContext),
        },
      });
    }
  };

  const handleGenerateFlashcards = () => {
    if (!currentDocument) return;

    const documentContext = {
      documentId: currentDocument.$id,
      documentTitle: currentDocument.title,
      ocrText: currentDocument.ocrText || "",
    };

    router.push({
      pathname: "/(tabs)/flashcards",
      params: {
        documentContext: JSON.stringify(documentContext),
      },
    });
  };

  // Helper to infer subject from document title
  const inferSubjectFromTitle = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (
      titleLower.includes("physics") ||
      titleLower.includes("motion") ||
      titleLower.includes("force")
    )
      return "physics";
    if (
      titleLower.includes("chemistry") ||
      titleLower.includes("chemical") ||
      titleLower.includes("atom")
    )
      return "chemistry";
    if (
      titleLower.includes("biology") ||
      titleLower.includes("cell") ||
      titleLower.includes("organism")
    )
      return "biology";
    if (
      titleLower.includes("math") ||
      titleLower.includes("algebra") ||
      titleLower.includes("calculus")
    )
      return "mathematics";
    return "general";
  };

  // generationState is selected above to ensure reactive updates

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
          onGenerateQuestions={handleGenerateQuestions}
          onGenerateNotes={handleGenerateNotes}
          onGenerateFlashcards={handleGenerateFlashcards}
          onViewQuestions={handleViewQuestions}
          onViewNotes={handleViewNotes}
          generationState={generationState}
          isLoading={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
});
