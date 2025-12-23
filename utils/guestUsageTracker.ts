import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PlanLimits } from "@/lib/types/plan";

const STORAGE_KEY = "guestUsage";

// Limits will be fetched from backend
let CACHED_LIMITS: PlanLimits | null = null;

export const setGuestLimits = (limits: PlanLimits) => {
    CACHED_LIMITS = limits;
};

export const getGuestLimits = (): PlanLimits => {
    return CACHED_LIMITS || {
        doubts: 2,
        questions: 1,
        notes: 1,
        maxQuestions: 5,
        allowedDifficulties: ['easy'],
        allowedNoteLengths: ['brief']
    };
};

type FeatureType = "doubts" | "questions" | "notes";

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
    const limits = getGuestLimits();
    return usage[feature] < limits[feature];
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
    const limits = getGuestLimits();
    return Math.max(0, limits[feature] - usage[feature]);
};
