# Complete Guest User Flow Investigation

## 🔍 INVESTIGATION SCOPE

Checking ALL screens for guest users:
1. Ask Doubt
2. Generate Questions
3. Notes
4. Subscription

---

## 1️⃣ ASK DOUBT - COMPLETE FLOW

### **Frontend Flow:**

```typescript
// hooks/useDoubts.ts

// ✅ MOUNT: Load initial usage
useEffect(() => {
  if (!user) {
    loadGuestUsage();  // ← Loads from AsyncStorage
  }
}, []);

// ✅ BEFORE API: Check limit
if (!user) {
  const canUse = await checkGuestLimit("doubts");  // ← AsyncStorage check
  if (!canUse) {
    setError("Daily limit reached");
    return;  // ← Blocks before API call
  }
}

// ✅ AFTER API: Increment usage
if (!user) {
  await incrementGuestUsage("doubts");  // ← AsyncStorage increment
  setLimitInfo({ used: ..., limit: ... });
}
```

### **Backend Flow:**

```javascript
// askDoubt/index.js

// ✅ SKIP QUOTA CHECK
if (identityType !== "guest") {
  const quota = await enforceDailyQuota(...);  // ← Only for logged-in
}

// ✅ SAVE TO DB (AI training)
await tablesDB.createRow({
  identityId: "guest",  // ← All guests same ID, but no quota check
});

// ✅ RETURN NULL QUOTA
let quota = null;
if (identityType !== "guest") {
  quota = await enforceDailyQuota(...);
}
return { quota: null };  // ← Frontend doesn't use this
```

### **UI Display:**

```typescript
// ask-doubt.tsx

// ✅ SHOWS USAGE
{showLimit && (
  <View>
    <Text>{limitInfo.used}/{limitInfo.limit} doubts used today</Text>
    <ProgressBar />
  </View>
)}
```

### **✅ STATUS: COMPLETE**

---

## 2️⃣ GENERATE QUESTIONS - COMPLETE FLOW

### **Frontend Flow:**

```typescript
// hooks/useQuestions.ts

// ❌ MOUNT: NO initial load
useEffect(() => {
  // Missing: loadGuestUsage()
}, []);

// ✅ BEFORE API: Check limit
if (!user) {
  const canUse = await checkGuestLimit("questions");
  if (!canUse) {
    setError("Daily limit reached");
    return;
  }
}

// ✅ AFTER API: Increment usage
if (!user) {
  await incrementGuestUsage("questions");
  setQuota({ used: ..., limit: ... });
}
```

### **Backend Flow:**

```javascript
// generate-questions/index.js

// ✅ SKIP QUOTA CHECK
if (identityType !== "guest") {
  const quota = await enforceDailyQuota(...);
}

// ✅ SAVE TO DB
await tablesDB.createRow({
  identityId: "guest",
});

// ✅ RETURN NULL QUOTA
let quota = null;
if (identityType !== "guest") {
  quota = await enforceDailyQuota(...);
}
return { quota: null };
```

### **UI Display:**

```typescript
// generate-questions.tsx

// ✅ SHOWS USAGE
{quota && (
  <View>
    <Text>Daily Usage</Text>
    <Text>{quota.used}/{quota.limit}</Text>
  </View>
)}
```

### **🔴 PROBLEM FOUND: No Initial Load**

**Issue:** `useQuestions` doesn't load guest usage on mount

**Impact:**
- First time opening screen: `quota = null` → No display
- After generating 1st question: `quota = { used: 1, limit: 1 }` → Shows

**Fix Needed:**
```typescript
useEffect(() => {
  loadGuestUsage();
}, []);

const loadGuestUsage = async () => {
  const { user } = useAuthStore.getState();
  if (!user) {
    const usage = await getGuestUsage();
    const limits = getGuestLimits();
    setQuota({ used: usage.questions, limit: limits.questions });
  }
};
```

---

## 3️⃣ NOTES - COMPLETE FLOW

### **Frontend Flow:**

```typescript
// hooks/useNotes.ts

// ✅ MOUNT: Load initial usage
useEffect(() => {
  loadNotes();
  loadGuestUsage();  // ← Added
}, []);

// ✅ BEFORE API: Check limit
if (!user) {
  const canUse = await checkGuestLimit("notes");
  if (!canUse) {
    setError("Daily limit reached");
    return;
  }
}

// ✅ AFTER API: Increment usage
if (!user) {
  await incrementGuestUsage("notes");
}
```

### **Backend Flow:**

```javascript
// notes/index.js

// ✅ SKIP QUOTA CHECK
if (identityType !== "guest") {
  const quota = await enforceDailyQuota(...);
}

// ✅ SAVE TO DB
await tablesDB.createRow({
  identityId: "guest",
});

// ✅ RETURN NULL QUOTA
let quota = null;
if (identityType !== "guest") {
  quota = await enforceDailyQuota(...);
}
return { quota: null };
```

### **UI Display:**

```typescript
// notes.tsx

// ✅ SHOWS USAGE
{quota && (
  <View>
    <Text>Daily Usage</Text>
    <Text>{quota.used}/{quota.limit}</Text>
  </View>
)}
```

### **⚠️ POTENTIAL ISSUE:**

**Notes uses `planStore.usage` for quota:**
```typescript
const { planType, usage, limits } = usePlanStore();
const quota = { used: usage?.notes || 0, limit: limits?.notes || 1 };
```

**Question:** Does `planStore.usage` update for guests?

**Check:**
```typescript
// planStore.ts - fetchPlanStatus()
if (!user) {
  const guestUsage = await getGuestUsage();
  set({
    usage: {
      doubts: guestUsage.doubts,
      questions: guestUsage.questions,
      notes: guestUsage.notes,
    }
  });
}
```

**✅ YES:** planStore reads from AsyncStorage for guests

**But:** planStore is only updated:
1. On app launch (fetchPlanStatus)
2. After feature use (fetchPlanStatus called)

**Issue:** If guest generates note, `incrementGuestUsage()` updates AsyncStorage, but planStore not refreshed until next `fetchPlanStatus()` call.

**Current code:**
```typescript
// useNotes.ts - after API
if (!user) {
  await incrementGuestUsage("notes");
} else {
  await usePlanStore.getState().fetchPlanStatus();  // ← Only for logged-in!
}
```

**🔴 PROBLEM:** Guest usage increments in AsyncStorage, but planStore (which Notes uses for quota) doesn't refresh!

---

## 4️⃣ SUBSCRIPTION - COMPLETE FLOW

### **Frontend Flow:**

```typescript
// subscription.tsx

// ✅ MOUNT: Fetch plan status
useEffect(() => {
  fetchPlanStatus();  // ← Loads guest usage from AsyncStorage
}, []);

// ✅ DISPLAY: Shows usage bars
{!isPro && (
  <>
    <UsageProgressBar feature="doubts" />
    <UsageProgressBar feature="questions" />
    <UsageProgressBar feature="notes" />
  </>
)}
```

### **Backend Flow:**

```javascript
// get-plan-status.js

if (identityType === "guest") {
  const guestLimits = getPlanLimits("free");
  return {
    planType: "free",
    limits: {
      doubts: guestLimits.dailyDoubts,
      questions: guestLimits.dailyQuestions,
      notes: guestLimits.dailyNotes,
      maxQuestions: guestLimits.maxQuestions,
      allowedDifficulties: guestLimits.allowedDifficulties,
      allowedNoteLengths: guestLimits.allowedNoteLengths,
    }
  };
}
```

### **✅ STATUS: COMPLETE**

---

## 🔴 PROBLEMS SUMMARY

### **Problem 1: useQuestions - No Initial Load**

**File:** `hooks/useQuestions.ts`

**Issue:** Doesn't load guest usage on mount

**Impact:** No usage display until first question generated

**Severity:** Medium

**Fix:** Add `loadGuestUsage()` in useEffect

---

### **Problem 2: useNotes - planStore Not Refreshed After Guest Usage**

**File:** `hooks/useNotes.ts`

**Issue:**
```typescript
if (!user) {
  await incrementGuestUsage("notes");  // ← Updates AsyncStorage
  // planStore NOT refreshed!
} else {
  await usePlanStore.getState().fetchPlanStatus();  // ← Only logged-in
}
```

**Impact:**
- Guest generates note
- AsyncStorage: `notes = 1`
- planStore: `usage.notes = 0` (stale)
- UI shows: `0/1` (wrong!)
- Subscription screen shows: `0/1` (wrong!)

**Severity:** HIGH

**Fix:**
```typescript
if (!user) {
  await incrementGuestUsage("notes");
  await usePlanStore.getState().fetchPlanStatus();  // ← Refresh planStore
} else {
  await usePlanStore.getState().fetchPlanStatus();
}
```

---

### **Problem 3: useDoubts - Same Issue as Notes?**

**Check:**
```typescript
// useDoubts.ts
if (!user) {
  await incrementGuestUsage("doubts");
  setLimitInfo({ used: ..., limit: ... });  // ← Sets local state
} else {
  await usePlanStore.getState().fetchPlanStatus();
}
```

**Analysis:**
- Doubts uses `limitInfo` (local state), not `planStore.usage`
- So it's fine for Ask Doubt screen
- But Subscription screen uses `planStore.usage`

**Issue:** After guest asks doubt:
- Ask Doubt screen: Shows correct usage (uses limitInfo)
- Subscription screen: Shows stale usage (uses planStore)

**Severity:** HIGH

**Fix:** Same as Notes - refresh planStore for guests too

---

## ✅ FIXES NEEDED

### **Fix 1: Add Initial Load to useQuestions**

```typescript
// hooks/useQuestions.ts

useEffect(() => {
  loadGuestUsage();
}, []);

const loadGuestUsage = async () => {
  const { user } = useAuthStore.getState();
  if (!user) {
    const usage = await getGuestUsage();
    const limits = getGuestLimits();
    setQuota({ used: usage.questions, limit: limits.questions });
  }
};
```

---

### **Fix 2: Refresh planStore After Guest Usage (All Features)**

```typescript
// hooks/useDoubts.ts
if (!user) {
  await incrementGuestUsage("doubts");
  await usePlanStore.getState().fetchPlanStatus();  // ← Add this
  const remaining = await getRemainingUses("doubts");
  const limits = getGuestLimits();
  setLimitInfo({ used: limits.doubts - remaining, limit: limits.doubts });
} else {
  await usePlanStore.getState().fetchPlanStatus();
}
```

```typescript
// hooks/useQuestions.ts
if (!user) {
  await incrementGuestUsage("questions");
  await usePlanStore.getState().fetchPlanStatus();  // ← Add this
  const remaining = await getRemainingUses("questions");
  const limits = getGuestLimits();
  setQuota({ used: limits.questions - remaining, limit: limits.questions });
} else {
  await usePlanStore.getState().fetchPlanStatus();
}
```

```typescript
// hooks/useNotes.ts
if (!user) {
  await incrementGuestUsage("notes");
  await usePlanStore.getState().fetchPlanStatus();  // ← Add this
} else {
  await usePlanStore.getState().fetchPlanStatus();
}
```

---

## 📊 FINAL STATUS

| Screen | Initial Load | Usage Increment | planStore Sync | UI Display | Status |
|--------|-------------|-----------------|----------------|------------|--------|
| **Ask Doubt** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | **Needs Fix 2** |
| **Questions** | ❌ No | ✅ Yes | ❌ No | ✅ Yes | **Needs Fix 1 & 2** |
| **Notes** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | **Needs Fix 2** |
| **Subscription** | ✅ Yes | N/A | N/A | ✅ Yes | **Complete** |

---

## 🎯 IMPACT OF FIXES

### **Before Fixes:**

**Scenario:** Guest generates 1 question
1. Questions screen shows: `1/1` ✅
2. Go to Subscription screen: Shows `0/1` ❌ (stale)
3. Pull to refresh: Shows `1/1` ✅

### **After Fixes:**

**Scenario:** Guest generates 1 question
1. Questions screen shows: `1/1` ✅
2. Go to Subscription screen: Shows `1/1` ✅ (synced)
3. All screens consistent ✅

---

## 🚨 PRIORITY

**HIGH PRIORITY** - Inconsistent usage display across screens confuses users and breaks trust.
