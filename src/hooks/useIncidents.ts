import { useState, useEffect, useCallback, useRef } from "react";
import { useMode } from "./useMode";
import { demoService } from "../services/demo";
import { appwriteService } from "../services/appwrite";
import type { Incident } from "../types";

function toIncident(doc: any): Incident {
  return {
    id: doc.$id,
    title: doc.title,
    date: doc.date,
    category: doc.category,
    reporter: doc.reporter,
    description: doc.description ?? "",
    severity: doc.severity,
    status: doc.status,
    owner: doc.owner ?? "",
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  };
}

export const FREE_TIER_LIMIT = 1000;

export function useIncidents() {
  const { mode } = useMode();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = mode === "demo" ? await demoService.getIncidents() : await appwriteService.getIncidents();
      setIncidents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (mode !== "appwrite") return;

    const unsubscribe = appwriteService.subscribeToIncidents((event: any) => {
      const events = event.events as string[];
      const payload = event.payload as any;
      if (events.some((e: string) => e.endsWith(".create"))) {
        setIncidents((prev) => [toIncident(payload), ...prev]);
      } else if (events.some((e: string) => e.endsWith(".update"))) {
        setIncidents((prev) =>
          prev.map((i) => (i.id === payload.$id ? toIncident(payload) : i))
        );
      } else if (events.some((e: string) => e.endsWith(".delete"))) {
        setIncidents((prev) => prev.filter((i) => i.id !== payload.$id));
      }
    });

    return unsubscribe;
  }, [mode]);

  const create = useCallback(
    async (data: Omit<Incident, "id" | "createdAt" | "updatedAt">) => {
      const service = mode === "demo" ? demoService : appwriteService;
      const created = await service.createIncident(data);
      setIncidents((prev) => [created, ...prev]);
      return created;
    },
    [mode]
  );

  const update = useCallback(
    async (id: string, data: Partial<Incident>) => {
      const service = mode === "demo" ? demoService : appwriteService;
      const updated = await service.updateIncident(id, data);
      if (updated) {
        setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
      }
      return updated;
    },
    [mode]
  );

  const remove = useCallback(
    async (id: string) => {
      if (mode === "appwrite") {
        await appwriteService.deleteIncident(id);
      }
      setIncidents((prev) => prev.filter((i) => i.id !== id));
    },
    [mode]
  );

  const canCreate = mode !== "appwrite" || incidents.length < FREE_TIER_LIMIT;

  return { incidents, loading, error, refetch: fetch, create, update, remove, canCreate };
}
