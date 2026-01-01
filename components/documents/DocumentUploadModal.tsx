import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from "react-native";
import {
  X,
  Camera,
  Image as ImageIcon,
  FileText,
  Sparkles,
  FileQuestion,
  NotebookPen,
  CheckCircle2,
  ArrowLeft,
  Upload,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { COLORS } from "@/constants/theme";
import type { UploadOptions } from "@/types/document";

interface DocumentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (
    file: {
      uri: string;
      name: string;
      type: string;
      mimeType: string;
    },
    title: string,
    options: UploadOptions
  ) => void;
}

export default function DocumentUploadModal({
  visible,
  onClose,
  onUpload,
}: DocumentUploadModalProps) {
  const [requesting, setRequesting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"select" | "review" | "title">(
    "select"
  );
  const [pendingFile, setPendingFile] = useState<{
    uri: string;
    name: string;
    type: string;
    mimeType: string;
  } | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");

  // Auto-generation options - disabled during upload
  const [generateQuestions, setGenerateQuestions] = useState(false);
  const [generateNotes, setGenerateNotes] = useState(false);

  const resetState = () => {
    setCurrentStep("select");
    setPendingFile(null);
    setDocumentTitle("");
    setGenerateQuestions(false);
    setGenerateNotes(false);
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
    // Auto-fill title from filename (without extension)
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setDocumentTitle(nameWithoutExt);
    setCurrentStep("title");
  };

  const handleBack = () => {
    if (currentStep === "title") {
      setCurrentStep("select");
      setPendingFile(null);
      setDocumentTitle("");
    }
  };

  const handleUpload = () => {
    if (!pendingFile || !documentTitle.trim()) {
      Alert.alert("Error", "Please enter a document title");
      return;
    }

    const options: UploadOptions = {
      generateQuestions,
      generateNotes,
      questionSettings: { difficulty: "easy", count: 5 },
      noteSettings: { length: "brief" },
    };

    onUpload(pendingFile, documentTitle.trim(), options);
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
      <Pressable
        className="justify-end flex-1 bg-black/80"
        onPress={handleClose}
      >
        <Pressable
          className="bg-[#1e1e1e] rounded-t-3xl max-h-[85%]"
          style={{ paddingBottom: Platform.OS === "ios" ? 40 : 20 }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <View className="flex-row items-center justify-between px-6 py-5 border-b border-gray-700">
            <View className="flex-row items-center gap-3">
              {currentStep !== "select" && (
                <Pressable
                  className="items-center justify-center w-8 h-8 bg-gray-800 rounded-full active:scale-90"
                  onPress={handleBack}
                >
                  <ArrowLeft size={18} color={COLORS.text.secondary} />
                </Pressable>
              )}
              <View>
                <Text className="text-xl font-bold text-white">
                  {currentStep === "select" && "Upload Document"}
                  {currentStep === "title" && "Name Your Document"}
                </Text>
                {currentStep === "select" && (
                  <Text className="text-xs text-gray-400 mt-0.5">
                    Choose a source for your document
                  </Text>
                )}
                {currentStep === "title" && (
                  <Text className="text-xs text-gray-400 mt-0.5">
                    Give it a memorable name
                  </Text>
                )}
              </View>
            </View>
            <Pressable
              className="items-center justify-center bg-gray-800 rounded-full w-9 h-9 active:scale-90"
              onPress={handleClose}
            >
              <X size={20} color={COLORS.text.secondary} />
            </Pressable>
          </View>

          {currentStep === "select" ? (
            <>
              {/* Enhanced File Source Options */}
              <View className="gap-3 p-5">
                <Pressable
                  className={`flex-row items-center p-4 bg-[#121212] rounded-2xl border border-gray-700 ${
                    requesting ? "opacity-50" : "active:scale-[0.98]"
                  }`}
                  onPress={handleCamera}
                  disabled={requesting}
                >
                  <View className="items-center justify-center mr-4 rounded-full w-14 h-14 bg-blue-600/20">
                    <Camera size={28} color={COLORS.primary.blue} />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-semibold text-white">
                      Camera
                    </Text>
                    <Text className="text-sm text-gray-400">
                      Take a photo of your document
                    </Text>
                  </View>
                  {requesting && (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.primary.blue}
                    />
                  )}
                </Pressable>

                <Pressable
                  className={`flex-row items-center p-4 bg-[#121212] rounded-2xl border border-gray-700 ${
                    requesting ? "opacity-50" : "active:scale-[0.98]"
                  }`}
                  onPress={handleGallery}
                  disabled={requesting}
                >
                  <View className="items-center justify-center mr-4 rounded-full w-14 h-14 bg-purple-600/20">
                    <ImageIcon size={28} color="#9333ea" />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-semibold text-white">
                      Gallery
                    </Text>
                    <Text className="text-sm text-gray-400">
                      Choose from your photo library
                    </Text>
                  </View>
                  {requesting && (
                    <ActivityIndicator size="small" color="#9333ea" />
                  )}
                </Pressable>

                <Pressable
                  className={`flex-row items-center p-4 bg-[#121212] rounded-2xl border border-gray-700 ${
                    requesting ? "opacity-50" : "active:scale-[0.98]"
                  }`}
                  onPress={handlePDF}
                  disabled={requesting}
                >
                  <View className="items-center justify-center mr-4 rounded-full w-14 h-14 bg-amber-500/20">
                    <FileText size={28} color={COLORS.accent.gold} />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-semibold text-white">
                      PDF Document
                    </Text>
                    <Text className="text-sm text-gray-400">
                      Select a PDF file from your device
                    </Text>
                  </View>
                  {requesting && (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.accent.gold}
                    />
                  )}
                </Pressable>
              </View>

              {/* Enhanced Tips Section */}
              <View className="p-4 mx-5 mb-5 border bg-blue-600/10 border-blue-600/30 rounded-xl">
                <View className="flex-row items-center gap-2 mb-2">
                  <Sparkles size={16} color={COLORS.primary.blue} />
                  <Text className="text-sm font-semibold text-blue-400">
                    Pro Tips
                  </Text>
                </View>
                <Text className="text-xs leading-5 text-gray-300">
                  • Ensure good lighting for photos{"\n"}• Keep text clear and
                  readable{"\n"}• PDFs work best for multi-page documents
                </Text>
              </View>
            </>
          ) : (
            <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
              {/* Enhanced Selected File Card */}
              <View className="flex-row items-center p-4 bg-[#121212] rounded-2xl border border-blue-600/50 mb-4 shadow-lg shadow-blue-600/20">
                <View className="items-center justify-center w-12 h-12 mr-3 rounded-xl bg-blue-600/20">
                  <FileText size={24} color={COLORS.primary.blue} />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-xs text-gray-400">
                    Selected File
                  </Text>
                  <Text
                    className="text-sm font-semibold text-white"
                    numberOfLines={1}
                  >
                    {pendingFile?.name}
                  </Text>
                </View>
                <CheckCircle2 size={20} color={COLORS.status.success} />
              </View>

              {/* Title Input Section */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-white">
                  Document Title
                </Text>
                <TextInput
                  className="bg-[#121212] border border-gray-700 rounded-xl p-4 text-base text-white"
                  value={documentTitle}
                  onChangeText={setDocumentTitle}
                  placeholder="Enter document title"
                  placeholderTextColor={COLORS.text.tertiary}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              {/* PDF Processing Info */}
              {pendingFile?.type === "pdf" && (
                <View className="p-4 mb-4 border bg-blue-600/10 border-blue-600/30 rounded-xl">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Sparkles size={16} color={COLORS.primary.blue} />
                    <Text className="text-sm font-bold text-white">
                      PDF Processing
                    </Text>
                  </View>
                  <Text className="text-sm leading-5 text-gray-300">
                    We&apos;ll upload your PDF instantly, then extract text in the
                    background. You&apos;ll be notified when it&apos;s ready for AI
                    generation.
                  </Text>
                </View>
              )}

              {/* What Happens Next Section */}
              <View className="p-4 bg-[#121212] border border-gray-700 rounded-xl mb-4">
                <Text className="mb-3 text-sm font-bold text-white">
                  What happens next?
                </Text>
                <View className="gap-3">
                  <View className="flex-row items-start gap-3">
                    <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mt-0.5">
                      <Text className="text-xs font-bold text-white">1</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-medium text-white">
                        Upload & Process
                      </Text>
                      <Text className="text-xs leading-4 text-gray-400">
                        Your document will be uploaded and text will be
                        extracted
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start gap-3">
                    <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mt-0.5">
                      <CheckCircle2 size={14} color="#fff" />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-medium text-white">
                        Title Added
                      </Text>
                      <Text className="text-xs leading-4 text-gray-400">
                        Your document has a memorable name
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start gap-3">
                    <View className="w-6 h-6 rounded-full bg-gray-700 items-center justify-center mt-0.5">
                      <Text className="text-xs font-bold text-white">3</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-medium text-white">
                        Generate Content
                      </Text>
                      <Text className="text-xs leading-4 text-gray-400">
                        Create questions and notes from your document
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Enhanced Action Buttons */}
              <View className="flex-row gap-3 mt-2">
                <Pressable
                  className="flex-1 p-4 bg-[#121212] border border-gray-700 rounded-xl items-center active:scale-95"
                  onPress={handleBack}
                >
                  <Text className="text-base font-semibold text-gray-300">
                    Back
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-[2] p-4 rounded-xl items-center flex-row justify-center gap-2 shadow-lg active:scale-95 ${
                    documentTitle.trim()
                      ? "bg-blue-600 shadow-blue-600/30"
                      : "bg-gray-700 opacity-50"
                  }`}
                  onPress={handleUpload}
                  disabled={!documentTitle.trim()}
                >
                  <Upload size={20} color="#fff" />
                  <Text className="text-base font-bold text-white">
                    Upload Now
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}

          {/* Enhanced Cancel Button */}
          {currentStep === "select" && (
            <Pressable
              className="mx-5 mb-2 p-4 bg-[#121212] border border-gray-700 rounded-xl items-center active:scale-95"
              onPress={handleClose}
            >
              <Text className="text-base font-semibold text-gray-300">
                Cancel
              </Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Styles removed - using Tailwind classes
