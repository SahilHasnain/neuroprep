import { useState, useEffect, useCallback } from "react";
import { useMode } from "./useMode";
import { demoService } from "../services/demo";
import { appwriteService } from "../services/appwrite";
import type { TimelineEvent } from "../types";

export function useTimeline(incidentId: string) {
  const { mode } = useMode();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const data = mode === "demo" ? await demoService.getTimeline(incidentId) : await appwriteService.getTimeline(incidentId);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [mode, incidentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addEvent = useCallback(
    async (data: Omit<TimelineEvent, "id" | "createdAt">) => {
      const service = mode === "demo" ? demoService : appwriteService;
      const event = await service.addTimelineEvent(data);
      setEvents((prev) => [...prev, event]);
      return event;
    },
    [mode]
  );

  return { events, loading, addEvent };
}
