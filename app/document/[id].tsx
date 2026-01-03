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
    getGenerationState,
  } = useDocumentStore();

  useEffect(() => {
    if (id) {
      getDocumentById(id);
    }

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

  const handleGenerateQuestions = async () => {
    if (!id || !currentDocument) return;

    // Show immediate feedback
    Alert.alert(
      "Generating Questions",
      "AI is generating 5 practice questions from your document. This may take a moment...",
      [{ text: "OK" }]
    );

    const result = await generateQuestions(id, {
      difficulty: "easy",
      count: 5,
    });

    if (result) {
      Alert.alert(
        "Success!",
        "Questions generated successfully! You can view them below or in the Questions tab.",
        [{ text: "Got it" }]
      );
    } else {
      Alert.alert(
        "Generation Failed",
        "Failed to generate questions. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleGenerateNotes = async () => {
    if (!id || !currentDocument) return;

    // Show immediate feedback
    Alert.alert(
      "Generating Notes",
      "AI is creating study notes from your document. This may take a moment...",
      [{ text: "OK" }]
    );

    const result = await generateNotes(id, { length: "brief" });

    if (result) {
      Alert.alert(
        "Success!",
        "Notes generated successfully! You can view them below or in the Notes tab.",
        [{ text: "Got it" }]
      );
    } else {
      Alert.alert(
        "Generation Failed",
        "Failed to generate notes. Please try again.",
        [{ text: "OK" }]
      );
    }
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

  const generationState = id ? getGenerationState(id) : undefined;

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
