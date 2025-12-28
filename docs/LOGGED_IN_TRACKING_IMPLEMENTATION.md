# Logged-in User Tracking Implementation

## Changes Made

### **Problem Fixed: Dual Tracking System**

**Before:**

- Backend tracks in DB ✅
- Zustand also increments ❌ (redundant, lost on restart)
- Display shows stale data after app restart

**After:**

- Backend tracks in DB ✅ (ONLY source)
- Zustand reads from backend via `fetchPlanStatus()` ✅
- Display always shows fresh backend data

## Files Modified

### 1. `hooks/useDoubts.ts`

```typescript
// BEFORE
if (!user) {
  await incrementGuestUsage("doubts");
}

// AFTER
if (!user) {
  // Guest: Increment AsyncStorage
  await incrementGuestUsage("doubts");
} else {
  // Logged-in: Refresh from backend
  await usePlanStore.getState().fetchPlanStatus();
}
```

### 2. `hooks/useQuestions.ts`

```typescript
// BEFORE
if (!user) {
  await incrementGuestUsage("questions");
}

// AFTER
if (!user) {
  // Guest: Increment AsyncStorage
  await incrementGuestUsage("questions");
} else {
  // Logged-in: Refresh from backend
  await usePlanStore.getState().fetchPlanStatus();
}
```

### 3. `hooks/useNotes.ts`

```typescript
// BEFORE
incrementUsage("notes"); // ← Called for everyone
if (!user) {
  await incrementGuestUsage("notes");
}

// AFTER
if (!user) {
  // Guest: Increment AsyncStorage
  await incrementGuestUsage("notes");
} else {
  // Logged-in: Refresh from backend
  await usePlanStore.getState().fetchPlanStatus();
}
```

## Data Flow

### Guest User

```
Feature Usage
  ↓
checkGuestLimit() (AsyncStorage)
  ↓
API Call
  ↓
incrementGuestUsage() → AsyncStorage
  ↓
Subscription Screen reads from AsyncStorage
```

### Logged-in User

```
Feature Usage
  ↓
API Call → Backend saves to DB
  ↓
fetchPlanStatus() → Backend counts from DB
  ↓
planStore updates with backend data
  ↓
Subscription Screen shows backend data
```

## Benefits

✅ **Single Source of Truth**

- Guest: AsyncStorage
- Logged-in: Backend DB

✅ **No Stale Data**

- Always fresh from source after each action

✅ **Consistent Display**

- Subscription screen matches actual usage

✅ **No Redundant Tracking**

- Removed Zustand increment for logged-in users

✅ **Persistent State**

- Guest: AsyncStorage persists
- Logged-in: Backend persists

## Backend Note

**Hardcoded plan in `askDoubt/index.js` left intentionally for development:**

```javascript
const plan = "pro"; // ← Intentional for dev
```

This bypasses subscription checks during development. Will be uncommented for production:

```javascript
const plan = await getUserPlan(tablesDB, identityType, identityId);
```

## Testing Checklist

- [ ] Guest: Usage increments in AsyncStorage
- [ ] Guest: Subscription screen shows correct usage
- [ ] Guest: Usage persists after app restart
- [ ] Logged-in: Usage tracked in backend DB
- [ ] Logged-in: Subscription screen shows backend data
- [ ] Logged-in: Usage updates immediately after feature use
- [ ] Logged-in: Usage persists after app restart
- [ ] Login: Transitions from guest to user data
- [ ] Logout: Transitions from user to guest data
