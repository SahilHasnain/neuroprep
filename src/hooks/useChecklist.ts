import { useState, useEffect, useCallback } from "react";
import { useMode } from "./useMode";
import { demoService } from "../services/demo";
import { appwriteService } from "../services/appwrite";
import { categoryChecklists } from "../data/mock/categories";
import type { IncidentCategory } from "../types";

export function useChecklist(incidentId: string, category: IncidentCategory) {
  const { mode } = useMode();
  const [items, setItems] = useState<{ id: string; label: string; completed: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  const seed = useCallback(async () => {
    if (mode === "demo") {
      const labels = categoryChecklists[category] ?? [];
      setItems(labels.map((label, i) => ({ id: String(i), label, completed: false })));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let existing = await appwriteService.getChecklistItems(incidentId);
      if (existing.length === 0) {
        const labels = categoryChecklists[category] ?? [];
        const created = await Promise.all(
          labels.map((label) =>
            appwriteService.addChecklistItem({ incidentId, label, completed: false })
          )
        );
        existing = created;
      }
      setItems(existing);
    } finally {
      setLoading(false);
    }
  }, [mode, incidentId, category]);

  useEffect(() => {
    seed();
  }, [seed]);

  const toggle = useCallback(
    async (id: string) => {
      if (mode === "demo") {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
        );
        return;
      }
      const updated = await appwriteService.toggleChecklistItem(id);
      if (updated) {
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
    },
    [mode]
  );

  return { items, loading, toggle };
}
