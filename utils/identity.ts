import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";

const GUEST_ID_KEY = "@neuroprep_guest_id";

export const getIdentity = async () => {
  const { user } = useAuthStore.getState();

  if (user) {
    return { type: "user", id: user.$id };
  }

  let guestId = await AsyncStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return { type: "guest", id: guestId };
};
