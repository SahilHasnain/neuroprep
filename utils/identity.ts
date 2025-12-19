import AsyncStorage from "@react-native-async-storage/async-storage";

export type IdentityType = "guest" | "user";

export interface Identity {
  identityType: IdentityType;
  identityId: string; // guestId or userId
}

const STORAGE_KEY = "@neuroprep_identity";
const GUEST_PREFIX = "guest_";

function generateGuestId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${GUEST_PREFIX}${ts}_${rand}`;
}

export async function getIdentity(): Promise<Identity | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Identity) : null;
  } catch (err) {
    console.error("Error reading identity:", err);
    return null;
  }
}

export async function ensureGuestIdentity(): Promise<Identity> {
  const existing = await getIdentity();
  if (existing) return existing;
  const guest: Identity = {
    identityType: "guest",
    identityId: generateGuestId(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
  return guest;
}

export async function setUserIdentity(userId: string): Promise<Identity> {
  const user: Identity = { identityType: "user", identityId: userId };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function clearIdentity(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
