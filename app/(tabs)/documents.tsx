import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Plus,
  FileText,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Calendar,
  FileType,
  CheckCircle2,
} from "lucide-react-native";
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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [filterType, setFilterType] = useState<"all" | "image">("all");
  const [showSortMenu, setShowSortMenu] = useState(false);

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

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [documents, searchQuery, filterType, sortBy]);

  const handleFileSelected = async (
    file: {
      uri: string;
      name: string;
      type: string;
      mimeType: string;
    },
    title: string,
    options: UploadOptions
  ) => {
    try {
      const fileToUpload = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || file.type,
      };

      const { documentId, ocrStatus } = await uploadDocument(
        fileToUpload,
        title,
        file.type,
        options || undefined
      );

      if (documentId) {
        const hasAutoGenerate =
          options?.generateQuestions || options?.generateNotes;

        // Check if the uploaded document has OCR text
        const uploadedDoc = documents.find((d) => d.$id === documentId);
        const hasNoText =
          !uploadedDoc?.ocrText || uploadedDoc.ocrText.trim().length === 0;
        const hasShortText =
          uploadedDoc?.ocrText && uploadedDoc.ocrText.length < 50;

        const isPendingOcr = ocrStatus?.status === "pending" && hasNoText;

        if (isPendingOcr) {
          Alert.alert(
            "Upload received",
            "Document saved. We're processing its text in the background. You can start generation once processing finishes."
          );
        } else if (hasNoText) {
          Alert.alert(
            "Upload Successful - Text Extraction Failed",
            "Your document was uploaded, but we couldn't extract any text from it. You can view the document, but AI features (questions/notes generation) won't work.\n\nTip: Try uploading a clearer image.",
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
      } else {
        // Upload failed - show retry option
        Alert.alert(
          "Upload Failed",
          "Failed to upload document. Would you like to try again?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Retry",
              onPress: () => setUploadModalVisible(true),
            },
          ]
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert(
        "Upload Error",
        "An error occurred during upload. Would you like to try again?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Retry",
            onPress: () => setUploadModalVisible(true),
          },
        ]
      );
    }
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
    <View className="items-center justify-center flex-1 px-8 py-20">
      <View className="p-8 mb-6 rounded-full bg-gray-800/30">
        <FileText size={64} color="#6b7280" />
      </View>
      <Text className="mb-3 text-2xl font-bold text-white">
        No Documents Yet
      </Text>
      <Text className="mb-8 text-base leading-6 text-center text-gray-400">
        Upload your first document to get started with AI-powered study
        materials
      </Text>
      <TouchableOpacity
        className="flex-row items-center gap-2 bg-blue-600 px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 active:scale-95"
        onPress={handleAddPress}
      >
        <Plus size={20} color="#fff" />
        <Text className="text-base font-semibold text-white">
          Upload Document
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNoResults = () => (
    <View className="items-center justify-center flex-1 px-8 py-20">
      <View className="p-8 mb-6 rounded-full bg-gray-800/30">
        <Search size={64} color="#6b7280" />
      </View>
      <Text className="mb-3 text-2xl font-bold text-white">
        No Results Found
      </Text>
      <Text className="mb-8 text-base leading-6 text-center text-gray-400">
        {searchQuery
          ? `No documents match "${searchQuery}"`
          : `No ${filterType} documents found`}
      </Text>
      <TouchableOpacity
        className="flex-row items-center gap-2 bg-gray-800 border border-gray-700 px-6 py-3.5 rounded-xl active:scale-95"
        onPress={() => {
          setSearchQuery("");
          setFilterType("all");
        }}
      >
        <X size={20} color="#fff" />
        <Text className="text-base font-semibold text-white">
          Clear Filters
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View className="items-center justify-center flex-1 py-24">
      <ActivityIndicator size="large" color={COLORS.primary.blue} />
      <Text className="mt-3 text-sm text-gray-400">Loading documents...</Text>
    </View>
  );

  // Always render the screen so header appears instantly; show loading as list empty state

  return (
    <View className="flex-1 bg-[#121212]">
      {/* Enhanced Header with search */}
      <View className="px-5 pt-16 pb-4 bg-[#1e1e1e] border-b border-gray-700">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-3xl font-bold tracking-tight text-white">
              Documents
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              {filteredAndSortedDocuments.length}{" "}
              {filteredAndSortedDocuments.length === 1
                ? "document"
                : "documents"}
              {searchQuery && " found"}
            </Text>
          </View>
          <TouchableOpacity
            className="items-center justify-center w-10 h-10 bg-gray-800 rounded-full active:scale-90"
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <ArrowUpDown size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center bg-[#121212] border border-gray-700 rounded-xl px-4 py-3">
            <Search size={18} color={COLORS.text.tertiary} />
            <TextInput
              className="flex-1 ml-2 text-base text-white"
              placeholder="Search documents..."
              placeholderTextColor={COLORS.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="active:scale-90"
              >
                <X size={18} color={COLORS.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            className={`w-12 h-12 rounded-xl items-center justify-center active:scale-90 ${
              filterType !== "all"
                ? "bg-blue-600"
                : "bg-gray-800 border border-gray-700"
            }`}
            onPress={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal
              size={20}
              color={filterType !== "all" ? "#fff" : COLORS.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sort Menu */}
        {showSortMenu && (
          <View className="mt-3 bg-[#121212] border border-gray-700 rounded-xl overflow-hidden">
            <TouchableOpacity
              className={`flex-row items-center justify-between p-3 ${
                sortBy === "date" ? "bg-blue-600/20" : ""
              }`}
              onPress={() => {
                setSortBy("date");
                setShowSortMenu(false);
              }}
            >
              <View className="flex-row items-center gap-2">
                <Calendar size={18} color={COLORS.text.secondary} />
                <Text className="text-sm font-medium text-white">
                  Sort by Date
                </Text>
              </View>
              {sortBy === "date" && (
                <CheckCircle2 size={18} color={COLORS.primary.blue} />
              )}
            </TouchableOpacity>
            <View className="h-px bg-gray-700" />
            <TouchableOpacity
              className={`flex-row items-center justify-between p-3 ${
                sortBy === "name" ? "bg-blue-600/20" : ""
              }`}
              onPress={() => {
                setSortBy("name");
                setShowSortMenu(false);
              }}
            >
              <View className="flex-row items-center gap-2">
                <FileType size={18} color={COLORS.text.secondary} />
                <Text className="text-sm font-medium text-white">
                  Sort by Name
                </Text>
              </View>
              {sortBy === "name" && (
                <CheckCircle2 size={18} color={COLORS.primary.blue} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Chips */}
        {showFilters && (
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full border active:scale-95 ${
                filterType === "all"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-[#121212] border-gray-700"
              }`}
              onPress={() => setFilterType("all")}
            >
              <Text
                className={`text-sm font-medium ${
                  filterType === "all" ? "text-white" : "text-gray-400"
                }`}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 rounded-full border active:scale-95 ${
                filterType === "image"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-[#121212] border-gray-700"
              }`}
              onPress={() => setFilterType("image")}
            >
              <Text
                className={`text-sm font-medium ${
                  filterType === "image" ? "text-white" : "text-gray-400"
                }`}
              >
                Images
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Error Banner */}
      {error && (
        <View className="p-3 mx-4 mt-4 shadow-lg bg-red-500/90 rounded-xl">
          <Text className="font-medium text-center text-white">{error}</Text>
        </View>
      )}

      {/* Simple Upload Loading Banner */}
      {(uploadStatus === "uploading" || uploadStatus === "processing") && (
        <View className="flex-row items-center justify-center gap-3 p-4 mx-4 mt-4 bg-blue-600 shadow-lg rounded-xl shadow-blue-600/30">
          <ActivityIndicator size="small" color="#fff" />
          <Text className="text-sm font-semibold text-white">
            {uploadStatus === "uploading"
              ? "Uploading document..."
              : "Processing document..."}
          </Text>
        </View>
      )}

      {/* Documents Grid */}
      <FlatList
        data={filteredAndSortedDocuments}
        renderItem={renderDocumentCard}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerClassName="p-4 pb-24"
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
        scrollEventThrottle={16}
        ListEmptyComponent={() => {
          if (isLoading) return renderLoadingSkeleton();
          if (searchQuery || filterType !== "all") return renderNoResults();
          return renderEmptyState();
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.blue}
          />
        }
      />

      {/* Enhanced FAB with shadow and scale animation */}
      <TouchableOpacity
        className="absolute items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-2xl right-5 bottom-24 shadow-blue-600/50 active:scale-90"
        onPress={handleAddPress}
      >
        <Plus size={28} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      <DocumentUploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUpload={handleFileSelected}
      />
    </View>
  );
}

// Styles removed - using Tailwind classes
