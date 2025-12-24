import { create } from "zustand";
import { ID, Models } from "react-native-appwrite";
import { account } from "@/lib/appwrite";
import { usePlanStore } from "./planStore";
// MVP_BYPASS: Import feature flags for MVP bypass mode
import { isMVPBypassMode } from "@/config/featureFlags";

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;

  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // MVP_BYPASS: Keep user always null in bypass mode
  user: null,
  // MVP_BYPASS: Set loading to false immediately in bypass mode
  loading: isMVPBypassMode() ? false : true,

  checkSession: async () => {
    // MVP_BYPASS: Disable session check in bypass mode
    if (isMVPBypassMode()) {
      set({ user: null, loading: false });
      return;
    }

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
    // MVP_BYPASS: Make signup a no-op in bypass mode
    if (isMVPBypassMode()) {
      console.log("Signup is disabled in MVP bypass mode");
      return;
    }

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
    // MVP_BYPASS: Make login a no-op in bypass mode
    if (isMVPBypassMode()) {
      console.log("Login is disabled in MVP bypass mode");
      return;
    }

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
    // MVP_BYPASS: Make logout a no-op in bypass mode
    if (isMVPBypassMode()) {
      console.log("Logout is disabled in MVP bypass mode");
      return;
    }

    await account.deleteSession({
      sessionId: "current",
    });
    set({ user: null });
    // Reset to guest state
    await usePlanStore.getState().fetchPlanStatus();
  },
}));
