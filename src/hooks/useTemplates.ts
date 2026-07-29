import { useState, useEffect } from "react";
import { useMode } from "./useMode";
import { demoService } from "../services/demo";
import { appwriteService } from "../services/appwrite";
import type { Template } from "../types";

export function useTemplates() {
  const { mode } = useMode();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = mode === "demo" ? await demoService.getTemplates() : await appwriteService.getTemplates();
      setTemplates(data);
      setLoading(false);
    }
    load();
  }, [mode]);

  return { templates, loading };
}
