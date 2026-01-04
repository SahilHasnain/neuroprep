import { useState, useCallback } from "react";
import type { DoubtContext } from "@/lib/types";

export type ConnectionAction = "questions" | "notes" | "flashcards";

export interface ConnectionContextData {
  source: "doubt" | "question" | "note" | "document";
  subject: string;
  topic: string;
  doubtContext?: DoubtContext;
  metadata?: Record<string, any>;
}

export function useConnectionContext() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ConnectionContextData | null>(null);

  const openPanel = useCallback((contextData: ConnectionContextData) => {
    setContext(contextData);
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    // Keep context for a moment to allow smooth animations
    setTimeout(() => setContext(null), 300);
  }, []);

  const updateContext = useCallback(
    (updates: Partial<ConnectionContextData>) => {
      setContext((prev) => (prev ? { ...prev, ...updates } : null));
    },
    []
  );

  return {
    isOpen,
    context,
    openPanel,
    closePanel,
    updateContext,
  };
}
