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
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Plus,
  Layers,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
} from "lucide-react-native";
import { useFlashcardsStore } from "@/store/flashcardsStore";
import type { FlashcardDeck } from "@/types/flashcard";
import DeckCard from "@/components/flashcards/DeckCard";
import GenerateFlashcardsModal from "@/components/flashcards/GenerateFlashcardsModal";
import { COLORS } from "@/constants/theme";
import { SUBJECTS } from "@/constants";
import { parseContextFromParams, hasContext } from "@/utils/flashcardContext";

export default function FlashcardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    decks,
    isLoading,
    error,
    fetchDecks,
    deleteDeck,
    clearError,
    generateFlashcards,
  } = useFlashcardsStore();
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Parse context from route params
  const { documentContext, noteContext, doubtContext } = useMemo(
    () => parseContextFromParams(params),
    [params]
  );

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // Auto-open modal when context is present
  useEffect(() => {
    if (hasContext(params)) {
      setModalVisible(true);
    }
  }, [params]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDecks();
    setRefreshing(false);
  };

  const handleDeckPress = useCallback(
    (deck: FlashcardDeck) => {
      router.push(`/flashcards/${deck.$id}`);
    },
    [router]
  );

  const handleDeleteDeck = useCallback(
    async (deckId: string) => {
      const success = await deleteDeck(deckId);
      if (success) {
        Alert.alert("Success", "Deck deleted successfully");
      } else {
        Alert.alert("Error", "Failed to delete deck");
      }
    },
    [deleteDeck]
  );

  const handleAddPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    // Clear route params after closing modal
    if (hasContext(params)) {
      router.setParams({
        documentContext: undefined,
        noteContext: undefined,
        doubtContext: undefined,
      });
    }
  };

  // Filter and sort decks
  const filteredAndSortedDecks = useMemo(() => {
    let filtered = Array.isArray(decks) ? [...decks] : [];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (deck) =>
          deck.name.toLowerCase().includes(query) ||
          deck.topic.toLowerCase().includes(query)
      );
    }

    // Apply subject filter
    if (filterSubject !== "all") {
      filtered = filtered.filter(
        (deck) => deck.subject.toLowerCase() === filterSubject.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        // Sort by last studied, then by creation date
        const aDate = a.lastStudied || a.$createdAt;
        const bDate = b.lastStudied || b.$createdAt;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [decks, searchQuery, filterSubject, sortBy]);

  const renderDeckCard = useCallback(
    ({ item }: { item: FlashcardDeck }) => {
      return (
        <DeckCard
          deck={item}
          onPress={() => handleDeckPress(item)}
          onDelete={() => handleDeleteDeck(item.$id)}
        />
      );
    },
    [handleDeckPress, handleDeleteDeck]
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20 px-8">
      <View className="bg-gray-800/30 rounded-full p-8 mb-6">
        <Layers size={64} color="#6b7280" />
      </View>
      <Text className="text-2xl font-bold text-white mb-3">
        No Flashcards Yet
      </Text>
      <Text className="text-base text-gray-400 text-center mb-8 leading-6">
        Create your first flashcard deck to start studying smarter
      </Text>
      <TouchableOpacity
        className="flex-row items-center gap-2 bg-blue-600 px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 active:scale-95"
        onPress={handleAddPress}
      >
        <Plus size={20} color="#fff" />
        <Text className="text-white text-base font-semibold">
          Create Flashcards
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNoResults = () => (
    <View className="flex-1 justify-center items-center py-20 px-8">
      <View className="bg-gray-800/30 rounded-full p-8 mb-6">
        <Search size={64} color="#6b7280" />
      </View>
      <Text className="text-2xl font-bold text-white mb-3">
        No Results Found
      </Text>
      <Text className="text-base text-gray-400 text-center mb-8 leading-6">
        {searchQuery
          ? `No decks match "${searchQuery}"`
          : `No ${filterSubject} decks found`}
      </Text>
      <TouchableOpacity
        className="flex-row items-center gap-2 bg-gray-800 border border-gray-700 px-6 py-3.5 rounded-xl active:scale-95"
        onPress={() => {
          setSearchQuery("");
          setFilterSubject("all");
        }}
      >
        <X size={20} color="#fff" />
        <Text className="text-white text-base font-semibold">
          Clear Filters
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View className="flex-1 items-center justify-center py-24">
      <ActivityIndicator size="large" color={COLORS.primary.blue} />
      <Text className="text-sm text-gray-400 mt-3">Loading flashcards...</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      {/* Enhanced Header with search */}
      <View className="px-5 pt-16 pb-4 bg-[#1e1e1e] border-b border-gray-700">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">
              Flashcards
            </Text>
            <Text className="text-sm text-gray-400 mt-1">
              {filteredAndSortedDecks.length}{" "}
              {filteredAndSortedDecks.length === 1 ? "deck" : "decks"}
              {searchQuery && " found"}
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center active:scale-90"
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
              className="flex-1 ml-2 text-white text-base"
              placeholder="Search decks..."
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
              filterSubject !== "all"
                ? "bg-blue-600"
                : "bg-gray-800 border border-gray-700"
            }`}
            onPress={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal
              size={20}
              color={filterSubject !== "all" ? "#fff" : COLORS.text.secondary}
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
                <Text className="text-white text-sm font-medium">
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
                <Layers size={18} color={COLORS.text.secondary} />
                <Text className="text-white text-sm font-medium">
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
          <View className="flex-row flex-wrap gap-2 mt-3">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full border active:scale-95 ${
                filterSubject === "all"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-[#121212] border-gray-700"
              }`}
              onPress={() => setFilterSubject("all")}
            >
              <Text
                className={`text-sm font-medium ${
                  filterSubject === "all" ? "text-white" : "text-gray-400"
                }`}
              >
                All
              </Text>
            </TouchableOpacity>
            {Array.isArray(SUBJECTS) &&
              SUBJECTS.map((subject) => (
                <TouchableOpacity
                  key={subject.value}
                  className={`px-4 py-2 rounded-full border active:scale-95 ${
                    filterSubject === subject.value
                      ? "bg-blue-600 border-blue-600"
                      : "bg-[#121212] border-gray-700"
                  }`}
                  onPress={() => setFilterSubject(subject.value)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      filterSubject === subject.value
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {subject.label}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>

      {/* Error Banner */}
      {error && (
        <View className="bg-red-500/90 p-3 mx-4 mt-4 rounded-xl shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-medium flex-1">{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <X size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Decks Grid */}
      <FlatList
        data={filteredAndSortedDecks}
        renderItem={renderDeckCard}
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
          if (searchQuery || filterSubject !== "all") return renderNoResults();
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
        className="absolute right-5 bottom-24 w-16 h-16 rounded-full bg-blue-600 justify-center items-center shadow-2xl shadow-blue-600/50 active:scale-90"
        onPress={handleAddPress}
      >
        <Plus size={28} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Generate Flashcards Modal */}
      <GenerateFlashcardsModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onGenerate={generateFlashcards}
        documentContext={documentContext}
        noteContext={noteContext}
        doubtContext={doubtContext}
      />
    </View>
  );
}
