# 🚀 V1 Launch Bypass Guide

## What Was Done

A simple, clean bypass system to give all users Pro features without login for the V1 launch.

## Changes Made

### 1. **Added Launch Flag** ([constants/index.ts](neuroprep-frontend/constants/index.ts))

```typescript
export const LAUNCH_V1_BYPASS = true; // Set to false for V2
```

### 2. **Modified Plan Store** ([store/planStore.ts](neuroprep-frontend/store/planStore.ts))

- When `LAUNCH_V1_BYPASS` is `true`, everyone gets Pro plan with:
  - 1000 doubts/day
  - 1000 questions/day
  - 1000 notes/day
  - All difficulties (easy, medium, hard)
  - All note lengths (brief, detailed, exam)
  - Max 20 questions per set

### 3. **Hid Subscription Tab** ([app/(tabs)/\_layout.tsx](<neuroprep-frontend/app/(tabs)/_layout.tsx>))

- Subscription tab is automatically hidden when bypass is enabled

## How It Works

**V1 Launch (Current):**

- Users open app → Instantly have Pro features
- No login prompt, no paywall, no limits
- Subscription tab is hidden
- All existing features work normally

**V2 (Future):**

```typescript
// In constants/index.ts, change this line:
export const LAUNCH_V1_BYPASS = false;
```

- App reverts to normal auth + subscription flow
- All your existing code works as designed
- Nothing breaks!

## What's NOT Changed

✅ All backend functions work normally  
✅ All UI components render correctly  
✅ Usage tracking still functions (just with high limits)  
✅ Database schema unchanged  
✅ API endpoints untouched  
✅ All hooks (useDoubts, useQuestions, useNotes) work as before

## Benefits

1. **Zero Breaking Changes** - All code remains intact
2. **One-Line Toggle** - Just flip the flag for V2
3. **Clean & Simple** - No hacky workarounds
4. **Fully Reversible** - V2 rollout is just a config change
5. **Maintains Analytics** - Usage tracking still works

## Testing V1 Launch

1. Restart your app
2. You should see 4 tabs (Home, Doubt, Questions, Notes)
3. No subscription/Pro tab visible
4. Try all features - should work without limits
5. Check usage badges - should show "Pro ✨"

## Switching to V2

When ready to enable auth + subscriptions:

```typescript
// constants/index.ts
export const LAUNCH_V1_BYPASS = false;
```

That's it! Everything else auto-activates.

## Notes

- This approach is production-ready
- No temporary hacks or commented code
- Clean separation of concerns
- Easy to understand and maintain
