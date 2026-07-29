import { useState, useEffect, useCallback } from "react";
import { useMode } from "./useMode";
import { account, appwriteService, setTeamId, getTeamId } from "../services/appwrite";
import { ID } from "react-native-appwrite";

export function useAuth() {
  const { mode } = useMode();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const profile = await appwriteService.getProfileByUserId(userId);
    if (profile) {
      setTeamId(profile.teamId);
    }
    return profile;
  }, []);

  const checkSession = useCallback(async () => {
    if (mode !== "appwrite") {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const current = await account.get();
      if (current.email) {
        setUser(current);
        await loadProfile(current.$id);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [mode, loadProfile]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession({ email, password });
    const current = await account.get();
    await loadProfile(current.$id);
    setUser(current);
    return current;
  };

  const register = async (email: string, password: string, name: string) => {
    const newUser = await account.create({ userId: ID.unique(), email, password, name });
    await account.createEmailPasswordSession({ email, password });

    const teamId = `team_${Date.now()}`;
    await appwriteService.createProfile(newUser.$id, name, email, teamId);
    setTeamId(teamId);

    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
    setTeamId("");
  };

  return { user, loading, login, register, logout, checkSession };
}
