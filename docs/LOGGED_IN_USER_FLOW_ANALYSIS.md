# Logged-in User Flow Analysis

## Current Flow

### 1. **Feature Usage (Ask Doubt/Questions/Notes)**

```
Frontend Hook (useDoubts/useQuestions/useNotes)
  ↓
Check if user exists
  ↓
If logged-in: Skip guest limit check
  ↓
Make API call to backend
  ↓
Backend (askDoubt/notes/generate-questions)
  ├─> getUserPlan() - Fetch subscription
  ├─> enforceDailyQuota() - Check usage in DB
  ├─> If limit reached: Return 402 error
  ├─> If allowed: Process request
  ├─> Save to DB (auto-increments usage)
  └─> Return response with quota: { used, limit, allowed }
  ↓
Frontend receives response
  ↓
incrementUsage("feature") in planStore (Zustand)
  ↓
If guest: incrementGuestUsage() (AsyncStorage)
```

### 2. **Subscription Screen**

```
fetchPlanStatus() called
  ↓
Check if user exists
  ↓
If logged-in: Call backend API
  ↓
Backend (get-plan-status.js)
  ├─> Fetch subscription from DB
  ├─> Count today's usage from doubts/questions/notes tables
  └─> Return { planType, status, usage: { doubts, questions, notes } }
  ↓
Frontend updates planStore with backend data
  ↓
UsageProgressBar displays usage
```

## ❌ PROBLEMS IDENTIFIED

### **Problem 1: DUAL TRACKING (Similar to Guest Issue)**

**Frontend has TWO tracking systems:**

1. **Backend (Source of Truth)**

   - Tracks in database tables
   - Counts via `enforceDailyQuota()`
   - Returns in API responses

2. **Frontend Zustand (Redundant)**
   - `planStore.incrementUsage()` called after API success
   - Stored in memory (lost on app restart)
   - NOT synced with backend

**Issue:**

```typescript
// In useNotes.ts (line 115)
incrementUsage("notes"); // ← Updates Zustand

// If guest
if (!user) {
  await incrementGuestUsage("notes"); // ← Updates AsyncStorage
}
```

**Why this is problematic:**

- Zustand increment happens AFTER API call
- If app crashes/restarts before next `fetchPlanStatus()`, Zustand is out of sync
- Backend is already tracking, so Zustand is redundant
- Adds unnecessary complexity

### **Problem 2: INCONSISTENT USAGE DISPLAY**

**Scenario:**

1. User generates 2 notes
2. Backend tracks: `usage.notes = 2`
3. Zustand tracks: `usage.notes = 2`
4. App restarts
5. Zustand resets: `usage.notes = 0` (initial state)
6. Subscription screen shows: `0/1` ❌ (WRONG!)
7. User tries to generate note
8. Backend rejects: "Daily limit reached" ✅ (CORRECT)

**Root cause:** Zustand is not persistent for logged-in users

### **Problem 3: HARDCODED PLAN IN BACKEND**

```javascript
// askDoubt/index.js (line 47)
// const plan = await getUserPlan(tablesDB, identityType, identityId);
const plan = "pro"; // ← HARDCODED!
```

**Issue:**

- All logged-in users treated as Pro
- Free users get unlimited access
- Subscription system bypassed

### **Problem 4: DOUBLE INCREMENT FOR GUESTS**

```typescript
// In useNotes.ts
incrementUsage("notes"); // ← Always called

if (!user) {
  await incrementGuestUsage("notes"); // ← Guest-specific
}
```

**Issue:**

- Guests increment BOTH Zustand AND AsyncStorage
- Zustand increment is useless for guests (we fixed this in planStore, but hooks still call it)

## ✅ RECOMMENDED FIXES

### **Fix 1: Remove Zustand Increment for Logged-in Users**

**Backend already tracks usage, so frontend should just READ from backend.**

```typescript
// In useDoubts/useQuestions/useNotes hooks
// REMOVE THIS:
incrementUsage("notes");

// Backend already incremented by saving to DB
// Next fetchPlanStatus() will get updated count
```

### **Fix 2: Fetch Plan Status After Each Feature Use**

```typescript
// In useNotes.ts (after successful API call)
const { user } = useAuthStore.getState();

if (user) {
  // Logged-in: Refresh from backend
  await usePlanStore.getState().fetchPlanStatus();
} else {
  // Guest: Increment AsyncStorage
  await incrementGuestUsage("notes");
}
```

### **Fix 3: Uncomment getUserPlan in Backend**

```javascript
// askDoubt/index.js
const plan = await getUserPlan(tablesDB, identityType, identityId);
// const plan = "pro";  // ← REMOVE THIS
```

### **Fix 4: Update planStore.incrementUsage**

Already fixed! Now skips guests:

```typescript
incrementUsage: (feature) => {
  const { user } = useAuthStore.getState();
  if (!user) return; // ✅ Guests handled by guestUsageTracker
  // ... logged-in logic
};
```

But we should REMOVE calls to this function entirely for logged-in users.

## 📊 COMPARISON: Current vs Proposed

### **Current (Problematic)**

```
Logged-in User:
├── Backend: Tracks in DB ✅
├── Zustand: Increments after API ❌ (redundant)
└── Display: Shows Zustand (out of sync after restart) ❌

Guest User:
├── AsyncStorage: Tracks usage ✅
├── Zustand: Increments after API ❌ (redundant)
└── Display: Shows Zustand (out of sync) ❌
```

### **Proposed (Clean)**

```
Logged-in User:
├── Backend: Tracks in DB ✅ (ONLY source)
├── Zustand: Reads from backend via fetchPlanStatus() ✅
└── Display: Shows backend data ✅

Guest User:
├── AsyncStorage: Tracks usage ✅ (ONLY source)
├── Zustand: Reads from AsyncStorage via fetchPlanStatus() ✅
└── Display: Shows AsyncStorage data ✅
```

## 🎯 FINAL ARCHITECTURE

```
┌─────────────────────────────────────────────┐
│           SINGLE SOURCE OF TRUTH            │
├─────────────────────────────────────────────┤
│ Guest:     AsyncStorage (guestUsageTracker) │
│ Logged-in: Backend Database                 │
└─────────────────────────────────────────────┘
                    ↓
         planStore.fetchPlanStatus()
                    ↓
              Zustand State
                    ↓
         UsageProgressBar Display
```

## 🔧 ACTION ITEMS

1. ✅ **planStore.incrementUsage** - Already fixed to skip guests
2. ❌ **Remove incrementUsage calls** - From all hooks for logged-in users
3. ❌ **Add fetchPlanStatus after API** - Refresh backend data
4. ❌ **Uncomment getUserPlan** - Fix hardcoded plan in backend
5. ✅ **Guest tracking** - Already using guestUsageTracker

## 🚨 CRITICAL ISSUE

**The hardcoded `plan = "pro"` in askDoubt/index.js means:**

- All users (even free) get unlimited doubts
- Subscription system is bypassed
- No revenue from doubt feature

**This must be fixed immediately!**
