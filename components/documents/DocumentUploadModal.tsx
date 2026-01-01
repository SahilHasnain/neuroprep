import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  Switch,
  ScrollView,
} from "react-native";
import {
  X,
  Camera,
  Image as ImageIcon,
  FileText,
  Sparkles,
  FileQuestion,
  NotebookPen,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { COLORS } from "@/constants/theme";
import type { UploadOptions } from "@/types/document";

interface DocumentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onFileSelected: (
    file: {
      uri: string;
      name: string;
      type: string;
      mimeType: string;
    },
    options: UploadOptions
  ) => void;
}

export default function DocumentUploadModal({
  visible,
  onClose,
  onFileSelected,
}: DocumentUploadModalProps) {
  const [requesting, setRequesting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    uri: string;
    name: string;
    type: string;
    mimeType: string;
  } | null>(null);

  // Auto-generation options
  const [generateQuestions, setGenerateQuestions] = useState(true);
  const [generateNotes, setGenerateNotes] = useState(true);

  const resetState = () => {
    setShowOptions(false);
    setPendingFile(null);
    setGenerateQuestions(true);
    setGenerateNotes(true);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos."
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Media library permission is required to select photos."
      );
      return false;
    }
    return true;
  };

  const proceedWithFile = (file: {
    uri: string;
    name: string;
    type: string;
    mimeType: string;
  }) => {
    setPendingFile(file);
    setShowOptions(true);
  };

  const handleConfirm = () => {
    if (!pendingFile) return;

    const options: UploadOptions = {
      generateQuestions,
      generateNotes,
      questionSettings: { difficulty: "easy", count: 5 },
      noteSettings: { length: "brief" },
    };

    onFileSelected(pendingFile, options);
    handleClose();
  };

  const handleCamera = async () => {
    if (requesting) return;
    setRequesting(true);

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setRequesting(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        proceedWithFile({
          uri: asset.uri,
          name: `camera_${Date.now()}.jpg`,
          type: "image",
          mimeType: "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera");
    } finally {
      setRequesting(false);
    }
  };

  const handleGallery = async () => {
    if (requesting) return;
    setRequesting(true);

    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        setRequesting(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName =
          asset.uri.split("/").pop() || `image_${Date.now()}.jpg`;
        proceedWithFile({
          uri: asset.uri,
          name: fileName,
          type: "image",
          mimeType: asset.mimeType || "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery");
    } finally {
      setRequesting(false);
    }
  };

  const handlePDF = async () => {
    if (requesting) return;
    setRequesting(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        proceedWithFile({
          uri: asset.uri,
          name: asset.name,
          type: "pdf",
          mimeType: asset.mimeType || "application/pdf",
        });
      }
    } catch (error) {
      console.error("PDF picker error:", error);
      Alert.alert("Error", "Failed to select PDF");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {showOptions ? "Upload Options" : "Upload Document"}
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text.secondary} />
            </Pressable>
          </View>

          {!showOptions ? (
            <>
              {/* File Source Options */}
              <View style={styles.options}>
                <Pressable
                  style={styles.option}
                  onPress={handleCamera}
                  disabled={requesting}
                >
                  <View style={styles.iconContainer}>
                    <Camera size={32} color={COLORS.primary.blue} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Camera</Text>
                    <Text style={styles.optionDescription}>
                      Take a photo of your document
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.option}
                  onPress={handleGallery}
                  disabled={requesting}
                >
                  <View style={styles.iconContainer}>
                    <ImageIcon size={32} color={COLORS.primary.blue} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Gallery</Text>
                    <Text style={styles.optionDescription}>
                      Choose an image from your gallery
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.option}
                  onPress={handlePDF}
                  disabled={requesting}
                >
                  <View style={styles.iconContainer}>
                    <FileText size={32} color={COLORS.primary.blue} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>PDF Document</Text>
                    <Text style={styles.optionDescription}>
                      Select a PDF file from your device
                    </Text>
                  </View>
                </Pressable>
              </View>
            </>
          ) : (
            <ScrollView style={styles.optionsScroll}>
              {/* Selected File Info */}
              <View style={styles.selectedFile}>
                <FileText size={24} color={COLORS.primary.blue} />
                <Text style={styles.selectedFileName} numberOfLines={1}>
                  {pendingFile?.name}
                </Text>
              </View>

              {pendingFile?.type === "pdf" && (
                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerTitle}>PDF processing</Text>
                  <Text style={styles.infoBannerText}>
                    We’ll upload instantly, then process the PDF text in the
                    background. AI generation will start once processing
                    finishes.
                  </Text>
                </View>
              )}

              {/* AI Generation Options */}
              <View style={styles.aiSection}>
                <View style={styles.aiHeader}>
                  <Sparkles size={20} color={COLORS.accent.gold} />
                  <Text style={styles.aiTitle}>Auto-Generate with AI</Text>
                </View>
                <Text style={styles.aiDescription}>
                  Let AI create study materials from your document automatically
                </Text>

                {/* Generate Questions Toggle */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <View
                      style={[
                        styles.toggleIcon,
                        { backgroundColor: COLORS.primary.blue + "20" },
                      ]}
                    >
                      <FileQuestion size={18} color={COLORS.primary.blue} />
                    </View>
                    <View>
                      <Text style={styles.toggleTitle}>Generate Questions</Text>
                      <Text style={styles.toggleDescription}>
                        5 easy questions from document
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={generateQuestions}
                    onValueChange={setGenerateQuestions}
                    trackColor={{
                      false: COLORS.border.default,
                      true: COLORS.primary.blue,
                    }}
                    thumbColor={COLORS.text.primary}
                  />
                </View>

                {/* Generate Notes Toggle */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <View
                      style={[
                        styles.toggleIcon,
                        { backgroundColor: COLORS.accent.gold + "20" },
                      ]}
                    >
                      <NotebookPen size={18} color={COLORS.accent.gold} />
                    </View>
                    <View>
                      <Text style={styles.toggleTitle}>Generate Notes</Text>
                      <Text style={styles.toggleDescription}>
                        Brief summary notes
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={generateNotes}
                    onValueChange={setGenerateNotes}
                    trackColor={{
                      false: COLORS.border.default,
                      true: COLORS.accent.gold,
                    }}
                    thumbColor={COLORS.text.primary}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  style={styles.backButton}
                  onPress={() => setShowOptions(false)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </Pressable>
                <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                  <Text style={styles.confirmButtonText}>
                    {pendingFile?.type === "pdf" ? "Upload PDF" : "Upload"}
                    {(generateQuestions || generateNotes) && " & Generate"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}

          {/* Cancel Button */}
          {!showOptions && (
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  options: {
    padding: 20,
    gap: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border.default,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.text.tertiary,
  },
  cancelButton: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  // Options screen styles
  optionsScroll: {
    padding: 20,
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    marginBottom: 20,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  infoBanner: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.blue,
    marginBottom: 16,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  aiSection: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.blue,
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  aiDescription: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  toggleDescription: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  confirmButton: {
    flex: 2,
    padding: 16,
    backgroundColor: COLORS.primary.blue,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
});
