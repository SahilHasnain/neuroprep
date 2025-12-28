# Guest Usage Tracking Implementation

## Overview
Unified guest user tracking system using `guestUsageTracker.ts` as the single source of truth for all guest-related usage data.

## Architecture

### Guest Users (No Backend Tracking)
- **Storage**: AsyncStorage (client-side only)
- **Limits**: `GUEST_LIMITS` from `guestUsageTracker.ts`
  - Doubts: 3 per day
  - Questions: 5 per day
  - Notes: 2 per day
- **Reset**: Automatic at midnight (date-based)
- **Persistence**: Device-specific, survives app restarts

### Logged-in Users (Backend Tracking)
- **Storage**: Backend database + Zustand sync
- **Limits**: From subscription plan (backend)
- **Reset**: Server-side tracking
- **Persistence**: Account-specific, cross-device

## Changes Made

### 1. `store/planStore.ts`
**Before**: Dual tracking with hardcoded limits
**After**: Single source of truth

```typescript
// Imports guestUsageTracker
import { getGuestUsage, GUEST_LIMITS } from "@/utils/guestUsageTracker";
import { useAuthStore } from "./authStore";

// fetchPlanStatus now checks user type
fetchPlanStatus: async () => {
  const { user } = useAuthStore.getState();
  
  if (!user) {
    // Guest: Read from AsyncStorage
    const guestUsage = await getGuestUsage();
    set({
      planType: "free",
      limits: GUEST_LIMITS,
      usage: { ...guestUsage },
    });
    return;
  }
  
  // Logged-in: Fetch from backend
  // ... existing backend logic
}

// incrementUsage skips guests (handled in hooks)
incrementUsage: (feature) => {
  const { user } = useAuthStore.getState();
  if (!user) return; // Guests handled by guestUsageTracker
  // ... logged-in user logic
}
```

### 2. `store/authStore.ts`
**Before**: Hardcoded reset on logout
**After**: Calls fetchPlanStatus to load guest data

```typescript
import { GUEST_LIMITS } from "@/utils/guestUsageTracker";

logout: async () => {
  await account.deleteSession({ sessionId: "current" });
  set({ user: null });
  // Reset to guest state
  await usePlanStore.getState().fetchPlanStatus();
}
```

### 3. `app/(tabs)/subscription.tsx`
**Before**: Hardcoded fallback limits
**After**: Uses GUEST_LIMITS constant

```typescript
import { GUEST_LIMITS } from "@/utils/guestUsageTracker";

const planFeatures = useMemo(() => 
  getPlanFeatures(limits || GUEST_LIMITS), 
  [limits]
);
```

## Data Flow

### Guest User Journey

```
1. App Launch
   └─> authStore.checkSession() → user = null
   └─> planStore.fetchPlanStatus()
       └─> getGuestUsage() from AsyncStorage
       └─> Set limits = GUEST_LIMITS

2. Feature Usage (Ask Doubt/Questions/Notes)
   └─> Hook calls checkGuestLimit()
       └─> Read from AsyncStorage
       └─> If allowed: Make API call
       └─> incrementGuestUsage() → Save to AsyncStorage

3. Subscription Screen
   └─> planStore.fetchPlanStatus()
       └─> Read from AsyncStorage
       └─> Display usage in UsageProgressBar

4. Daily Reset
   └─> Automatic (date comparison in guestUsageTracker)
   └─> New day = usage resets to 0
```

### Logged-in User Journey

```
1. Login/Signup
   └─> authStore.login/signup()
   └─> planStore.fetchPlanStatus()
       └─> Backend API call
       └─> Returns subscription + usage data

2. Feature Usage
   └─> API call → Backend tracks usage
   └─> Optional: planStore.incrementUsage() for UI sync

3. Subscription Screen
   └─> planStore.fetchPlanStatus()
       └─> Backend API call
       └─> Display real-time usage

4. Logout
   └─> authStore.logout()
   └─> planStore.fetchPlanStatus()
       └─> Loads guest data from AsyncStorage
```

## Backend Behavior

### `get-plan-status.js`
```javascript
if (identityType === "guest") {
    return res.json({
        success: true,
        data: {
            planType: "free",
            status: "active",
            // NO usage data - client handles it
        },
    });
}
```

**Why no usage for guests?**
- No reliable guest identification
- Privacy-friendly
- Reduces backend load
- Client-side is sufficient

## Benefits

✅ **Single Source of Truth**: All guest data from `guestUsageTracker.ts`
✅ **Consistent Limits**: GUEST_LIMITS used everywhere
✅ **Persistent Tracking**: AsyncStorage survives app restarts
✅ **No Backend Overhead**: Guests don't hit backend for usage
✅ **Privacy-Friendly**: No server tracking for guests
✅ **Clean Separation**: Guest vs logged-in logic clearly separated
✅ **Synced UI**: Subscription screen shows real usage from hooks

## Files Modified

1. `store/planStore.ts` - Guest/logged-in separation
2. `store/authStore.ts` - Logout reset logic
3. `app/(tabs)/subscription.tsx` - Use GUEST_LIMITS constant

## Files Using guestUsageTracker

- `hooks/useDoubts.ts` - Checks limits before API call
- `hooks/useQuestions.ts` - Checks limits before API call
- `hooks/useNotes.ts` - Checks limits before API call
- `store/planStore.ts` - Reads usage for display
- `app/(tabs)/subscription.tsx` - Uses GUEST_LIMITS constant

## Testing Checklist

- [ ] Guest user sees correct limits (3 doubts, 5 questions, 2 notes)
- [ ] Usage increments after successful API calls
- [ ] Subscription screen shows real-time usage
- [ ] Progress bars reflect actual usage
- [ ] Daily reset works (test by changing device date)
- [ ] Usage persists after app restart
- [ ] Login transitions from guest to user data
- [ ] Logout transitions from user to guest data
- [ ] Limit reached shows upgrade modal
