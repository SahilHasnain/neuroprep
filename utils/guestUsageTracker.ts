import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "guestUsage";

export const GUEST_LIMITS = {
    doubts: 3,
    questions: 5,
    notes: 2,
};

type FeatureType = keyof typeof GUEST_LIMITS;

interface GuestUsage {
    date: string;
    doubts: number;
    questions: number;
    notes: number;
}

const getTodayDate = () => new Date().toISOString().split("T")[0];

const getUsage = async (): Promise<GuestUsage> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const today = getTodayDate();

    if (!stored) {
        return { date: today, doubts: 0, questions: 0, notes: 0 };
    }

    const usage: GuestUsage = JSON.parse(stored);

    // Reset if new day
    if (usage.date !== today) {
        return { date: today, doubts: 0, questions: 0, notes: 0 };
    }

    return usage;
};

export const checkGuestLimit = async (feature: FeatureType): Promise<boolean> => {
    const usage = await getUsage();
    return usage[feature] < GUEST_LIMITS[feature];
};

export const incrementGuestUsage = async (feature: FeatureType): Promise<void> => {
    const usage = await getUsage();
    usage[feature] += 1;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
};

export const getGuestUsage = async (): Promise<GuestUsage> => {
    return await getUsage();
};

export const getRemainingUses = async (feature: FeatureType): Promise<number> => {
    const usage = await getUsage();
    return Math.max(0, GUEST_LIMITS[feature] - usage[feature]);
};
