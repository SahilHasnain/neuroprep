import { create } from "zustand";
import { ID, Models } from "react-native-appwrite";
import { account } from "@/lib/appwrite";

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
  },

  login: async (email, password) => {
    await account.createEmailPasswordSession({
      email,
      password,
    });
    const currentUser = await account.get();
    set({ user: currentUser });
  },

  logout: async () => {
    await account.deleteSession({
      sessionId: "current",
    });
    set({ user: null });
  },
}));
