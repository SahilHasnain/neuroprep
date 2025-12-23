import { create } from "zustand";
import { ID, Models } from "react-native-appwrite";
import { account } from "@/lib/appwrite";
import { usePlanStore } from "./planStore";

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;

  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  checkSession: async () => {
    try {
      const currentUser = await account.get();
      set({ user: currentUser });
      // Fetch plan status when session is restored
      await usePlanStore.getState().fetchPlanStatus();
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email, password, name) => {
    await account.create({
      userId: ID.unique(),
      name,
      email,
      password,
    });
    await account.createEmailPasswordSession({
      email,
      password,
    });
    const currentUser = await account.get();
    set({ user: currentUser });
    // Fetch plan status for new user
    await usePlanStore.getState().fetchPlanStatus();
  },

  login: async (email, password) => {
    await account.createEmailPasswordSession({
      email,
      password,
    });
    const currentUser = await account.get();
    set({ user: currentUser });
    // Fetch plan status on login
    await usePlanStore.getState().fetchPlanStatus();
  },

  logout: async () => {
    await account.deleteSession({
      sessionId: "current",
    });
    set({ user: null });
    // Reset to guest state
    await usePlanStore.getState().fetchPlanStatus();
  },
}));
