import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { X, Camera, Image as ImageIcon, FileText } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { COLORS } from "@/constants/theme";

interface DocumentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onFileSelected: (file: {
    uri: string;
    name: string;
    type: string;
    mimeType: string;
  }) => void;
}

export default function DocumentUploadModal({
  visible,
  onClose,
  onFileSelected,
}: DocumentUploadModalProps) {
  const [requesting, setRequesting] = useState(false);

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
        onFileSelected({
          uri: asset.uri,
          name: `camera_${Date.now()}.jpg`,
          type: "image",
          mimeType: "image/jpeg",
        });
        onClose();
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
        onFileSelected({
          uri: asset.uri,
          name: fileName,
          type: "image",
          mimeType: asset.mimeType || "image/jpeg",
        });
        onClose();
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
        onFileSelected({
          uri: asset.uri,
          name: asset.name,
          type: "pdf",
          mimeType: asset.mimeType || "application/pdf",
        });
        onClose();
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
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Upload Document</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text.secondary} />
            </Pressable>
          </View>

          {/* Options */}
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

          {/* Cancel Button */}
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
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
});
