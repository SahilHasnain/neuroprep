# planStore - Complete Explanation

## 🎯 **What is planStore?**

**planStore** is a **global state manager** (using Zustand) that tracks:
- User's subscription plan (Free vs Pro)
- Daily usage limits for each feature
- Current usage count for today
- Subscription status and payment info

Think of it as the **"central brain"** that knows:
- "How many doubts can this user ask today?" (limit)
- "How many have they already used?" (usage)
- "Are they Free or Pro?" (planType)

---

## 📦 **What Data Does It Store?**

```typescript
{
  // Plan Info
  planType: "free" | "pro",
  
  // Limits (what user CAN do)
  limits: {
    doubts: 2,           // Free: 2/day, Pro: 1000/day
    questions: 1,        // Free: 1/day, Pro: 1000/day
    notes: 1,            // Free: 1/day, Pro: 1000/day
    maxQuestions: 5,     // Free: 5 questions per set, Pro: 20
    allowedDifficulties: ['easy'],  // Free: easy only, Pro: all
    allowedNoteLengths: ['brief']   // Free: brief only, Pro: all
  },
  
  // Usage (what user HAS done today)
  usage: {
    doubts: 1,           // Used 1 doubt today
    questions: 0,        // Used 0 questions today
    notes: 1,            // Used 1 note today
    lastResetDate: "2024-01-15"  // Last reset date
  },
  
  // Subscription Details (logged-in users only)
  status: "active" | "trial" | "cancelled" | "expired",
  trialEndsAt: "2024-02-01",
  currentPeriodEnd: "2024-03-01",
  
  // UI State
  loading: false,
  error: null
}
```

---

## 🔄 **Complete Flow**

### **1. App Startup**

```
User opens app
    ↓
App checks: Guest or Logged-in?
    ↓
┌─────────────────┬─────────────────┐
│   GUEST USER    │  LOGGED-IN USER │
└─────────────────┴─────────────────┘
```

#### **Guest Flow:**
```
1. planStore.fetchPlanStatus() called
2. Backend returns: { planType: "free", limits: {...} }
3. planStore reads AsyncStorage: { doubts: 1, questions: 0, notes: 0 }
4. planStore sets:
   - planType = "free"
   - limits = from backend
   - usage = from AsyncStorage
```

#### **Logged-in Flow:**
```
1. planStore.fetchPlanStatus() called
2. Backend queries database for user's subscription
3. Backend returns: { planType: "pro", limits: {...}, usage: {...} }
4. planStore sets:
   - planType = "pro"
   - limits = from backend
   - usage = from backend
```

---

### **2. User Uses a Feature (e.g., Ask Doubt)**

#### **Guest Flow:**
```
User clicks "Ask Doubt"
    ↓
Frontend checks: usage.doubts < limits.doubts?
    ↓
┌─────────────────┬─────────────────┐
│   YES (1 < 2)   │   NO (2 < 2)    │
│   ✅ Allowed    │   ❌ Blocked    │
└─────────────────┴─────────────────┘
         ↓                   ↓
    API Call           Show Error
         ↓              "Limit reached"
    Success
         ↓
    incrementGuestUsage("doubts")
         ↓
    AsyncStorage: { doubts: 2 }
         ↓
    Update local state
    (limitInfo in hook)
         ↓
    ⚠️ planStore NOT updated
    (This is the bug!)
```

#### **Logged-in Flow:**
```
User clicks "Ask Doubt"
    ↓
Frontend checks: usage.doubts < limits.doubts?
    ↓
┌─────────────────┬─────────────────┐
│   YES (5 < 1000)│   NO (1000<1000)│
│   ✅ Allowed    │   ❌ Blocked    │
└─────────────────┴─────────────────┘
         ↓                   ↓
    API Call           Show Error
         ↓
    Success
         ↓
    Backend increments DB
         ↓
    planStore.incrementUsage("doubts")
         ↓
    planStore.usage.doubts = 6
         ↓
    ✅ All screens see updated usage
```

---

### **3. User Checks Subscription Screen**

```
Subscription screen opens
    ↓
Reads from planStore:
    ↓
Shows:
- Plan Type: planStore.planType
- Doubts: planStore.usage.doubts / planStore.limits.doubts
- Questions: planStore.usage.questions / planStore.limits.questions
- Notes: planStore.usage.notes / planStore.limits.notes
```

**Problem for Guests:**
```
Guest uses 1 doubt
    ↓
AsyncStorage updated: { doubts: 1 }
    ↓
planStore NOT updated (still shows 0)
    ↓
Subscription screen shows: 0/2 doubts ❌ WRONG!
```

---

## 🎯 **Purpose of planStore**

### **1. Single Source of Truth**
- All screens read from planStore
- No need to fetch limits/usage separately on each screen
- Consistent data across entire app

### **2. Real-time Usage Tracking**
- Shows user how many uses remaining
- Prevents API calls when limit reached
- Updates immediately after each use

### **3. Feature Locking**
- Free users: Can't select "Medium" difficulty
- Free users: Can't generate 10 questions
- Pro users: All features unlocked

### **4. Subscription Management**
- Create subscription
- Handle payments
- Cancel subscription
- Track trial period

---

## 🔗 **How Components Use planStore**

### **Example 1: UsageProgressBar Component**

```typescript
import { usePlanStore } from "@/store/planStore";

function UsageProgressBar({ feature }) {
  const { usage, limits } = usePlanStore();
  
  const used = usage[feature];      // e.g., usage.doubts = 1
  const limit = limits[feature];    // e.g., limits.doubts = 2
  
  return (
    <View>
      <Text>{used}/{limit} used</Text>
      <ProgressBar value={used} max={limit} />
    </View>
  );
}
```

### **Example 2: Ask Doubt Screen**

```typescript
import { usePlanStore } from "@/store/planStore";

function AskDoubtScreen() {
  const { usage, limits, planType } = usePlanStore();
  
  const canAskDoubt = usage.doubts < limits.doubts;
  const isPro = planType === "pro";
  
  return (
    <View>
      {!isPro && (
        <UsageProgressBar feature="doubts" />
      )}
      
      <Button 
        disabled={!canAskDoubt}
        onPress={handleAskDoubt}
      >
        Ask Doubt
      </Button>
    </View>
  );
}
```

### **Example 3: Generate Questions Screen**

```typescript
import { usePlanStore } from "@/store/planStore";

function GenerateQuestionsScreen() {
  const { limits } = usePlanStore();
  
  const allowedDifficulties = limits.allowedDifficulties;
  // Free: ['easy']
  // Pro: ['easy', 'medium', 'hard']
  
  return (
    <View>
      {allowedDifficulties.includes('medium') ? (
        <Button>Medium</Button>  // Pro only
      ) : (
        <Button disabled>Medium 🔒</Button>  // Locked for Free
      )}
    </View>
  );
}
```

---

## 🐛 **Current Bug**

### **Problem:**
```
Guest uses feature
    ↓
AsyncStorage updated ✅
    ↓
planStore NOT updated ❌
    ↓
Subscription screen shows old data ❌
```

### **Why It Happens:**

In `useDoubts.ts`, `useQuestions.ts`, `useNotes.ts`:

```typescript
// After API success:
if (!user) {
  await incrementGuestUsage(feature);
  // ⚠️ Missing: planStore.fetchPlanStatus()
}
```

### **Fix:**

```typescript
// After API success:
if (!user) {
  await incrementGuestUsage(feature);
  await planStore.getState().fetchPlanStatus();  // ✅ Refresh planStore
}
```

---

## 📊 **Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────┐
│                      planStore                          │
│  (Global State - Zustand)                               │
│                                                          │
│  planType: "free"                                        │
│  limits: { doubts: 2, questions: 1, notes: 1 }          │
│  usage: { doubts: 1, questions: 0, notes: 0 }           │
└─────────────────────────────────────────────────────────┘
           ↑                    ↓
           │                    │
    fetchPlanStatus()    Read by components
           │                    │
           │                    ↓
    ┌──────┴──────┐    ┌────────────────┐
    │   Backend   │    │  Subscription  │
    │  (Logged-in)│    │     Screen     │
    └─────────────┘    └────────────────┘
           │                    ↓
    ┌──────┴──────┐    ┌────────────────┐
    │ AsyncStorage│    │  Ask Doubt     │
    │   (Guest)   │    │     Screen     │
    └─────────────┘    └────────────────┘
                              ↓
                       ┌────────────────┐
                       │   Questions    │
                       │     Screen     │
                       └────────────────┘
                              ↓
                       ┌────────────────┐
                       │     Notes      │
                       │     Screen     │
                       └────────────────┘
```

---

## ✅ **Key Takeaways**

1. **planStore = Central Hub** for all plan/usage data
2. **All screens read from planStore** for consistency
3. **Guests use AsyncStorage** → planStore reads from it
4. **Logged-in users use Backend** → planStore reads from it
5. **Bug:** Guests update AsyncStorage but don't refresh planStore
6. **Fix:** Call `fetchPlanStatus()` after guest usage increment

---

## 🎓 **Simple Analogy**

Think of planStore as a **scoreboard** at a cricket match:

- **Limits** = Total overs allowed (50 overs)
- **Usage** = Overs played (35 overs)
- **planType** = Match format (T20 vs ODI)

Everyone (players, audience, commentators) looks at the **same scoreboard**.

If someone updates the score but **doesn't update the scoreboard**, everyone sees wrong info!

That's the current bug with guests. 🐛
