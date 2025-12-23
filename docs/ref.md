🎯 CRITICAL FIXES NEEDED:
Fix 1: Match Frontend & Backend Limits
// guestUsageTracker.ts
GUEST_LIMITS = {
  questions: 1  // ← Match backend
}

Copy
typescript
Fix 2: Backend Should NOT Track Guests in DB
// generate-questions/index.js
if (identityType === "guest") {
  // Skip quota check - frontend handles it
  // Don't save to DB
  // Just generate and return
}

Copy
javascript
Fix 3: Guest Flow Should Be:
Guest → Frontend checks AsyncStorage → API call → Backend generates → Return
(No DB tracking, no quota enforcement on backend for guests)

Copy
Fix 4: Logged-in Flow Should Be:
User → API call → Backend checks DB → Enforce quota → Generate → Save to DB

Copy
Summary:
🔴 Critical Issues:

Limits mismatch (5 vs 1)

All guests share same DB quota

Frontend/backend tracking conflict

Guest data saved to DB unnecessarily

Impact: Guests can't use the feature properly, limits are confusing, and the first guest to use it blocks all other guests globally.