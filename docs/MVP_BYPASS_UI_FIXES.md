# MVP Bypass UI Fixes

## Issue

In the MVP bypass version, some UI elements related to authentication and subscription limits were still visible:

1. Login button showing in the ask-doubt screen
2. Limit-related UI elements appearing in the app

## Root Cause

The `LAUNCH_V1_BYPASS` constant was not defined in the constants file, causing it to be `undefined`. Since `!undefined` evaluates to `true`, the conditional UI elements were being displayed.

## Changes Made

### 1. Added LAUNCH_V1_BYPASS Constant

**File:** `neuroprep-frontend/constants/index.ts`

- Added `export const LAUNCH_V1_BYPASS = true;` to properly define the bypass flag
- This ensures all conditional UI elements respect the bypass mode

### 2. Fixed Ask Doubt Screen

**File:** `neuroprep-frontend/app/(tabs)/ask-doubt.tsx`

- Removed reference to `plan` property from `useDoubts` hook (no longer returned in MVP bypass)
- Simplified the login/user badge button logic to remove Pro plan references
- The login button and usage indicator are now properly hidden when `LAUNCH_V1_BYPASS` is true

## UI Elements Now Hidden in MVP Bypass Mode

### Ask Doubt Screen

- ✅ Login/User Badge Button (Free/Pro indicator)
- ✅ Usage Indicator (X/Y doubts used today)
- ✅ Progress Bar
- ✅ Upgrade button
- ✅ Limit Reached Modal

### Notes Screen

- ✅ Auth Modal
- ✅ Free/Pro badge in header
- ✅ Daily Usage display (already commented out)

### Generate Questions Screen

- ✅ Auth Modal
- ✅ Free/Pro badge in header
- ✅ Daily Usage display (already commented out)

### Home Screen

- ✅ ProBanner
- ✅ Usage progress bars
- ✅ Pro Member status card

### Subscription Tab

- ✅ Hidden from tab bar navigation (via `href: null`)
- ✅ Deep links redirect to home

## Testing

To verify the fixes:

1. Ensure `LAUNCH_V1_BYPASS = true` in `constants/index.ts`
2. Check that no login buttons appear in any screen
3. Verify no usage/limit indicators are visible
4. Confirm no subscription-related UI elements are shown
5. Test that the app functions without authentication prompts

## Reverting to Full Version

To restore authentication and subscription features:

1. Set `LAUNCH_V1_BYPASS = false` in `constants/index.ts`
2. All conditional UI elements will automatically reappear
3. Uncomment the usage displays in notes and generate-questions screens if needed
