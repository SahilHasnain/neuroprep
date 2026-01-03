import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FlashcardComponent from "@/components/flashcards/FlashcardComponent";
import * as Haptics from "expo-haptics";

describe("FlashcardComponent", () => {
  const mockOnFlip = jest.fn();
  const defaultProps = {
    front: "What is Newton's First Law?",
    back: "An object at rest stays at rest unless acted upon by an external force",
    isFlipped: false,
    onFlip: mockOnFlip,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render front content when not flipped", () => {
    const { getByText } = render(<FlashcardComponent {...defaultProps} />);

    expect(getByText("Question")).toBeTruthy();
    expect(getByText(defaultProps.front)).toBeTruthy();
    expect(getByText("Tap to reveal answer")).toBeTruthy();
  });

  it("should render back content when flipped", () => {
    const { getByText } = render(
      <FlashcardComponent {...defaultProps} isFlipped={true} />
    );

    expect(getByText("Answer")).toBeTruthy();
    expect(getByText(defaultProps.back)).toBeTruthy();
    expect(getByText("Tap to see question")).toBeTruthy();
  });

  it("should call onFlip when card is pressed", () => {
    const { getByText } = render(<FlashcardComponent {...defaultProps} />);

    const card = getByText(defaultProps.front);
    fireEvent.press(card.parent?.parent?.parent || card);

    expect(mockOnFlip).toHaveBeenCalledTimes(1);
  });

  it("should trigger haptic feedback when card is pressed", () => {
    const { getByText } = render(<FlashcardComponent {...defaultProps} />);

    const card = getByText(defaultProps.front);
    fireEvent.press(card.parent?.parent?.parent || card);

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
  });

  it("should handle flip state changes", () => {
    const { rerender, getByText } = render(
      <FlashcardComponent {...defaultProps} />
    );

    // Initially showing front
    expect(getByText("Question")).toBeTruthy();

    // Rerender with flipped state
    rerender(<FlashcardComponent {...defaultProps} isFlipped={true} />);

    // Now showing back
    expect(getByText("Answer")).toBeTruthy();
  });
});
