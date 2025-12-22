export type UserPlan = "free" | "student_pro";

export const PLAN_LIMITS = {
  free: {
    dailyQuestions: 1,
    maxQuestions: 5,
    allowedDifficulties: ["easy"],
    dailyNotes: 3,
    allowedNoteLengths: ["brief"],
  },
  student_pro: {
    dailyQuestions: 1000,
    maxQuestions: 20,
    allowedDifficulties: ["easy", "medium", "hard"],
    dailyNotes: 1000,
    allowedNoteLengths: ["brief", "detailed", "exam"],
  },
};

export function canAccessDifficulty(plan: UserPlan, difficulty: string): boolean {
  return PLAN_LIMITS[plan].allowedDifficulties.includes(difficulty.toLowerCase());
}

export function canAccessQuestionCount(plan: UserPlan, count: number): boolean {
  return count <= PLAN_LIMITS[plan].maxQuestions;
}

export function getMaxQuestions(plan: UserPlan): number {
  return PLAN_LIMITS[plan].maxQuestions;
}

export function getAllowedDifficulties(plan: UserPlan): string[] {
  return PLAN_LIMITS[plan].allowedDifficulties;
}

export function canAccessNoteLength(plan: UserPlan, noteLength: string): boolean {
  return PLAN_LIMITS[plan].allowedNoteLengths.includes(noteLength.toLowerCase());
}

export function getAllowedNoteLengths(plan: UserPlan): string[] {
  return PLAN_LIMITS[plan].allowedNoteLengths;
}
