import { createContext, useContext, type ReactNode } from "react";
import type { AppMode } from "../types";

interface ModeContextType {
  mode: AppMode;
}

const ModeContext = createContext<ModeContextType | null>(null);

function getInitialMode(): AppMode {
  const env = process.env.EXPO_PUBLIC_APP_MODE;
  if (env === "appwrite" || env === "demo") return env;
  return "demo";
}

export function ModeProvider({ children }: { children: ReactNode }) {
  return (
    <ModeContext.Provider value={{ mode: getInitialMode() }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be inside ModeProvider");
  return ctx;
}
