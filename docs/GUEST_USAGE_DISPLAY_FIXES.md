# Guest Usage Display Issues & Fixes

## 🔴 CRITICAL PROBLEMS

### **Problem: No Usage Display on Feature Screens**

**Affected Screens:**

- ❌ Ask Doubt (`ask-doubt.tsx`)
- ✅ Generate Questions (`generate-questions.tsx`) - HAS usage display
- ❌ Notes (`notes.tsx`) - No usage display

**Current State:**

| Screen       | Usage Display  | Initial Load | Updates After Use      |
| ------------ | -------------- | ------------ | ---------------------- |
| Ask Doubt    | ❌ None        | ❌ No        | ✅ Yes (but not shown) |
| Questions    | ✅ Shows quota | ✅ Yes       | ✅ Yes                 |
| Notes        | ❌ None        | ❌ No        | ✅ Yes (but not shown) |
| Subscription | ✅ Shows all   | ✅ Yes       | ✅ Yes                 |

---

## 📋 DETAILED ISSUES

### **Issue 1: Ask Doubt - No Usage Display**

**Current Code:**

```typescript
// ask-doubt.tsx
// Missing: No UsageProgressBar component
// Missing: No quota display in header
// limitInfo exists in hook but not displayed
```

**User Experience:**

- Guest asks 1st doubt → No feedback on usage
- Guest asks 2nd doubt → No feedback on usage
- Guest tries 3rd doubt → Suddenly blocked with error
- **Confusing and frustrating**

---

### **Issue 2: Notes - No Usage Display**

**Current Code:**

```typescript
// notes.tsx
// Has quota in hook: const quota = { used: usage?.notes || 0, limit: dailyLimit };
// But NOT displayed on screen
```

**User Experience:**

- Same as Ask Doubt
- No transparency on usage
- Surprise when limit reached

---

### **Issue 3: No Initial Usage Load for Guests**

**Ask Doubt Hook:**

```typescript
// useDoubts.ts
useEffect(() => {
  const { user } = useAuthStore.getState();
  if (user) {
    loadPastDoubts(); // ← Only logged-in users
  }
  // ← Missing: Load guest usage from AsyncStorage
}, []);
```

**Result:**

- `limitInfo` stays `null` until first doubt
- Even if guest already used doubts today
- No initial state

---

### **Issue 4: Backend Returns null Quota for Guests**

**Backend:**

```javascript
// askDoubt/index.js
let quota = null;
if (identityType !== "guest") {
    quota = await enforceDailyQuota(...);
}
return buildResponse(true, plan, quota, ...);  // ← quota is null for guests
```

**Frontend:**

```typescript
if (response.limitInfo) {
  setLimitInfo(response.limitInfo); // ← Never runs for guests
}
```

**Result:**

- Frontend must manually calculate and set limitInfo
- Currently done after increment, but not on mount

---

## ✅ FIXES

### **Fix 1: Add Usage Display to Ask Doubt Screen**

**File:** `app/(tabs)/ask-doubt.tsx`

**Add after header, before messages:**

```typescript
import UsageProgressBar from "@/components/ui/UsageProgressBar";
import { usePlanStore } from "@/store/planStore";

// Inside component:
const { planType } = usePlanStore();
const isPro = planType === "pro";

// In JSX, after header:
{
  !isPro && limitInfo && (
    <View className="px-6 py-3 bg-white border-b border-gray-200">
      <Text className="mb-2 text-sm font-medium text-gray-700">
        Today's Usage
      </Text>
      <UsageProgressBar
        feature="doubts"
        showLabel={false}
        showRemaining={true}
      />
    </View>
  );
}
```

---

### **Fix 2: Load Guest Usage on Mount (Ask Doubt)**

**File:** `hooks/useDoubts.ts`

**Add function:**

```typescript
const loadGuestUsage = async () => {
  const usage = await getGuestUsage();
  const limits = getGuestLimits();
  setLimitInfo({
    used: usage.doubts,
    limit: limits.doubts,
    allowed: usage.doubts < limits.doubts,
  });
};
```

**Update useEffect:**

```typescript
useEffect(() => {
  const { user } = useAuthStore.getState();
  if (user) {
    loadPastDoubts();
  } else {
    loadGuestUsage(); // ← Add this
  }
}, []);
```

---

### **Fix 3: Add Usage Display to Notes Screen**

**File:** `app/(tabs)/notes.tsx`

**Current has quota but doesn't display it. Add:**

```typescript
import UsageProgressBar from "@/components/ui/UsageProgressBar";

// In header section (after title, before buttons):
{
  userPlan !== "pro" && (
    <View className="px-6 py-3 bg-white border-b border-gray-200">
      <Text className="mb-2 text-sm font-medium text-gray-700">
        Today's Usage
      </Text>
      <UsageProgressBar
        feature="notes"
        showLabel={false}
        showRemaining={true}
      />
    </View>
  );
}
```

---

### **Fix 4: Load Guest Usage on Mount (Notes)**

**File:** `hooks/useNotes.ts`

**Add function:**

```typescript
const loadGuestUsage = async () => {
  const { user } = useAuthStore.getState();
  if (!user) {
    const usage = await getGuestUsage();
    const limits = getGuestLimits();
    // quota is already calculated from planStore, just ensure it's set
  }
};
```

**Update useEffect:**

```typescript
useEffect(() => {
  loadNotes();
  loadGuestUsage(); // ← Add this
}, []);
```

**Note:** Notes already uses `planStore.usage` for quota, so it should work once planStore is initialized. Just need to ensure it's loaded.

---

## 📊 EXPECTED BEHAVIOR AFTER FIXES

### **Ask Doubt Screen:**

```
┌─────────────────────────────┐
│ Ask Doubt            [Icon] │
├─────────────────────────────┤
│ Today's Usage               │
│ ████████░░ 2/2              │
│ 0 uses remaining today      │
├─────────────────────────────┤
│ [Chat messages...]          │
└─────────────────────────────┘
```

### **Notes Screen:**

```
┌─────────────────────────────┐
│ AI Notes            [Icon]  │
├─────────────────────────────┤
│ Today's Usage               │
│ ████░░░░░░ 1/1              │
│ 0 uses remaining today      │
├─────────────────────────────┤
│ [Notes list...]             │
└─────────────────────────────┘
```

### **Questions Screen:**

```
✅ Already has usage display
No changes needed
```

---

## 🔄 USER FLOW AFTER FIXES

### **Guest Opens Ask Doubt:**

1. Screen loads
2. `loadGuestUsage()` runs
3. Reads AsyncStorage: `{ doubts: 1 }`
4. Shows: "1/2 doubts used" ✅
5. User knows they have 1 more doubt

### **Guest Asks Doubt:**

1. Frontend checks: 1 < 2 ✅
2. API call succeeds
3. `incrementGuestUsage()` → AsyncStorage: 2
4. Updates display: "2/2 doubts used" ✅
5. Shows: "0 uses remaining today"

### **Guest Tries Again:**

1. Frontend checks: 2 < 2 ❌
2. Shows error: "Daily limit reached"
3. No API call
4. User understands why (saw 2/2)

---

## 📝 IMPLEMENTATION CHECKLIST

### Ask Doubt:

- [ ] Import `UsageProgressBar` component
- [ ] Import `usePlanStore` hook
- [ ] Add `loadGuestUsage()` function to hook
- [ ] Update `useEffect` to call `loadGuestUsage()`
- [ ] Add usage display in screen JSX
- [ ] Test: Open screen → See usage
- [ ] Test: Ask doubt → Usage updates
- [ ] Test: Reach limit → See 2/2

### Notes:

- [ ] Import `UsageProgressBar` component
- [ ] Add `loadGuestUsage()` function to hook (if needed)
- [ ] Update `useEffect` to ensure usage loaded
- [ ] Add usage display in screen JSX
- [ ] Test: Open screen → See usage
- [ ] Test: Generate note → Usage updates
- [ ] Test: Reach limit → See 1/1

### Questions:

- [x] Already complete ✅
- [x] Has usage display
- [x] Loads initial usage
- [x] Updates after generation

---

## 🎯 BENEFITS

**Before Fixes:**

- ❌ No transparency on usage
- ❌ Surprise when limit reached
- ❌ Poor user experience
- ❌ Inconsistent across screens

**After Fixes:**

- ✅ Clear usage display on all screens
- ✅ Users know their limits
- ✅ No surprises
- ✅ Consistent UX across app
- ✅ Encourages upgrade when limit reached

---

## 🚨 PRIORITY

**HIGH PRIORITY** - This affects user experience significantly.

Without usage display:

- Users feel confused
- No transparency
- Bad first impression
- Lower conversion to paid

With usage display:

- Clear expectations
- Professional feel
- Users understand limits
- Better upgrade prompts

---

## 🔍 TESTING SCENARIOS

### Test 1: Fresh Guest

1. Clear app data
2. Open Ask Doubt → Should show "0/2"
3. Ask doubt → Should show "1/2"
4. Ask doubt → Should show "2/2"
5. Try again → Should block with error

### Test 2: Returning Guest

1. Guest used 1 doubt yesterday
2. Open app today → Should show "0/2" (reset)
3. Ask doubt → Should show "1/2"

### Test 3: Guest at Limit

1. Guest used 2 doubts today
2. Open Ask Doubt → Should show "2/2"
3. Try to ask → Should block immediately
4. Error message clear

### Test 4: Cross-Screen Consistency

1. Use 1 doubt
2. Check subscription screen → Shows 1/2
3. Check ask doubt screen → Shows 1/2
4. Both match ✅

---

## 📌 NOTES

- Questions screen already has this implemented correctly
- Use it as reference for Ask Doubt and Notes
- UsageProgressBar component already exists and works
- Just need to wire it up to the screens
- planStore already has usage data, just need to display it
