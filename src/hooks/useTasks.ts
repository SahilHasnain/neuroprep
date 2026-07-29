import { useState, useEffect, useCallback } from "react";
import { useMode } from "./useMode";
import { demoService } from "../services/demo";
import { appwriteService } from "../services/appwrite";
import type { Task } from "../types";

export function useTasks(incidentId: string) {
  const { mode } = useMode();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const data = mode === "demo" ? await demoService.getTasks(incidentId) : await appwriteService.getTasks(incidentId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [mode, incidentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = useCallback(
    async (data: Omit<Task, "id" | "createdAt">) => {
      const service = mode === "demo" ? demoService : appwriteService;
      const task = await service.addTask(data);
      setTasks((prev) => [...prev, task]);
      return task;
    },
    [mode]
  );

  const toggle = useCallback(
    async (id: string) => {
      const service = mode === "demo" ? demoService : appwriteService;
      const updated = await service.toggleTask(id);
      if (updated) {
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
      return updated;
    },
    [mode]
  );

  return { tasks, loading, add, toggle };
}
