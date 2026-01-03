import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  MoreVertical,
  Trash2,
  Edit3,
  Shuffle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useFlashcardsStore } from "@/store/flashcardsStore";
import FlashcardComponent from "@/components/flashcards/FlashcardComponent";
import { COLORS } from "@/constants/theme";
import type { Flashcard } from "@/types/flashcard";

export default function DeckViewScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const {
    currentDeck,
    currentCards,
    isLoading,
    error,
    getDeck,
    deleteDeck,
    setCurrentDeck,
  } = useFlashcardsStore();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    if (deckId) {
      getDeck(deckId);
    }

    return () => {
      setCurrentDeck(null);
    };
  }, [deckId]);

  // Initialize shuffled cards when currentCards changes
  useEffect(() => {
    if (currentCards.length > 0 && shuffledCards.length === 0) {
      setShuffledCards([...currentCards]);
    }
  }, [currentCards]);

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

  const handleDelete = () => {
    if (!currentDeck) return;

    Alert.alert(
      "Delete Deck",
      `Are you sure you want to delete "${currentDeck.name}"? This will remove all ${currentDeck.cardCount} flashcards.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteDeck(currentDeck.$id);
            if (success) {
              Alert.alert("Success", "Deck deleted successfully");
              router.back();
            } else {
              Alert.alert("Error", "Failed to delete deck");
            }
          },
        },
      ]
    );
  };

  const handleEditName = () => {
    // TODO: Implement edit name functionality
    Alert.alert("Coming Soon", "Edit deck name will be available soon");
    setShowMenu(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < displayCards.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Fisher-Yates shuffle algorithm
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    if (isShuffled) {
      // Reset to original order
      setShuffledCards([...currentCards]);
      setIsShuffled(false);
      Alert.alert("Cards Reset", "Cards are now in original order");
    } else {
      // Shuffle cards
      const shuffled = shuffleArray(currentCards);
      setShuffledCards(shuffled);
      setIsShuffled(true);
      Alert.alert("Cards Shuffled", "Cards have been randomized");
    }

    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Use shuffled cards if shuffled, otherwise use original cards
  const displayCards = useMemo(() => {
    return shuffledCards.length > 0 ? shuffledCards : currentCards;
  }, [shuffledCards, currentCards]);

  if (isLoading || !currentDeck) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.blue} />
          <Text style={styles.loadingText}>Loading deck...</Text>
        </View>
      </View>
    );
  }

  const currentCard = displayCards[currentCardIndex];
  const isFirstCard = currentCardIndex === 0;
  const isLastCard = currentCardIndex === displayCards.length - 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.deckName} numberOfLines={1}>
            {currentDeck.name}
          </Text>
          <Text style={styles.deckTopic} numberOfLines={1}>
            {currentDeck.topic}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <MoreVertical size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      {showMenu && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleEditName}
            activeOpacity={0.7}
          >
            <Edit3 size={18} color={COLORS.text.secondary} />
            <Text style={styles.menuItemText}>Edit Name</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color="#ef4444" />
            <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
              Delete Deck
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Card Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentCardIndex + 1} / {displayCards.length}
        </Text>
        {isShuffled && (
          <View style={styles.shuffleBadge}>
            <Shuffle size={12} color="#fff" />
            <Text style={styles.shuffleBadgeText}>Shuffled</Text>
          </View>
        )}
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        {currentCard ? (
          <FlashcardComponent
            front={currentCard.front}
            back={currentCard.back}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No cards in this deck</Text>
          </View>
        )}
      </View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            isFirstCard && styles.controlButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={isFirstCard}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.shuffleButton,
            isShuffled && styles.shuffleButtonActive,
          ]}
          onPress={handleShuffle}
          activeOpacity={0.7}
        >
          <Shuffle size={18} color="#fff" />
          <Text style={styles.shuffleButtonText}>
            {isShuffled ? "Reset" : "Shuffle"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            isLastCard && styles.controlButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isLastCard}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#1e1e1e",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  deckName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  deckTopic: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  menuDropdown: {
    position: "absolute",
    top: 120,
    right: 20,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    overflow: "hidden",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#374151",
  },
  counterContainer: {
    alignItems: "center",
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  counterText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },
  shuffleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shuffleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyCard: {
    width: "100%",
    height: 400,
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  emptyCardText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  controlButtonDisabled: {
    backgroundColor: "#374151",
    opacity: 0.5,
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  shuffleButton: {
    flex: 1,
    backgroundColor: "#374151",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4b5563",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  shuffleButtonActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  shuffleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
