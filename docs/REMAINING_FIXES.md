# Remaining Fixes for Guest User Flow

## ✅ COMPLETED
- **Fix 1:** Limits now come from backend (single source of truth)
- Type mismatches resolved
- PlanLimits interface unified

---

## 🔴 REMAINING CRITICAL FIXES

### **Fix 2: Backend Should NOT Track Guests in Database**

**Current Problem:**
```javascript
// Backend: enforceDailyQuota checks DB for ALL users including guests
const usage = await tablesDB.listRows({
  queries: [
    Query.equal("identityId", "guest"),  // ← All guests share same ID
    Query.greaterThanEqual("$createdAt", today)
  ]
});

// Backend: Saves guest data to DB
await tablesDB.createRow({
  data: {
    identityId: "guest",  // ← Pollutes database
    userId: null
  }
});
```

**Issues:**
- All guests globally share `identityId = "guest"`
- Guest A generates 1 question → DB has 1 row
- Guest B tries to generate → Backend sees 1 row → **REJECTS** (limit reached)
- **First guest blocks all other guests worldwide**
- Guest data pollutes database
- Privacy concern (guest actions tracked server-side)

**Solution:**
```javascript
// In askDoubt/index.js, generate-questions/index.js, notes/index.js

// BEFORE quota check, add:
if (identityType === "guest") {
    // Skip backend quota check - frontend handles it
    // Generate content
    // Return response WITHOUT saving to DB
    const aiAnswer = await callGeminiAPI(...);
    return res.json(
        buildResponse(true, plan, null, { answer: aiAnswer }, null, null, planLimits)
    );
}

// Only logged-in users continue to quota check and DB save
```

**Benefits:**
- Each guest device tracks own usage (AsyncStorage)
- No global guest limit sharing
- No guest data in database
- Privacy-friendly
- Cleaner database

---

### **Fix 3: Remove Redundant planLimits from Feature API Responses**

**Current Problem:**
```javascript
// Backend returns planLimits in every feature API response
return res.json(
    buildResponse(true, plan, quota, data, null, null, planLimits)  // ← Redundant
);
```

**Issues:**
- Frontend already has limits from `get-plan-status`
- Sending same data repeatedly
- Unnecessary bandwidth
- Hooks no longer use it (we just removed that code)

**Solution:**
```javascript
// In askDoubt/index.js, generate-questions/index.js, notes/index.js
// Remove last parameter (planLimits) from buildResponse calls

return res.json(
    buildResponse(true, plan, quota, data, null, null)  // ← No planLimits
);
```

**Benefits:**
- Smaller API responses
- Less bandwidth
- Cleaner code
- Limits only fetched once from `get-plan-status`

---

### **Fix 4: Update Frontend API Types**

**Current Problem:**
```typescript
// lib/types/api.types.ts
interface ApiResponse {
  planLimits?: PlanLimits;  // ← No longer returned
}
```

**Solution:**
```typescript
// Remove planLimits from API response types
// It's only in get-plan-status response now
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Backend Changes:

**askDoubt/index.js:**
- [ ] Add guest bypass before quota check
- [ ] Skip DB save for guests
- [ ] Return response without planLimits
- [ ] Remove planLimits from all buildResponse calls

**generate-questions/index.js:**
- [ ] Add guest bypass before quota check
- [ ] Skip DB save for guests
- [ ] Return response without planLimits
- [ ] Remove planLimits from all buildResponse calls

**notes/index.js:**
- [ ] Add guest bypass before quota check
- [ ] Skip DB save for guests
- [ ] Return response without planLimits
- [ ] Remove planLimits from all buildResponse calls

### Frontend Changes:

**lib/types/api.types.ts:**
- [ ] Remove `planLimits?: PlanLimits` from response interfaces

---

## 🎯 EXPECTED FLOW AFTER ALL FIXES

### Guest User:
```
1. Open app → fetchPlanStatus() → Get limits from backend
2. Use feature → Frontend checks AsyncStorage
3. If allowed → API call (no DB tracking)
4. Backend generates content → Returns (no DB save)
5. Frontend increments AsyncStorage
6. Subscription screen shows AsyncStorage usage
```

### Logged-in User:
```
1. Open app → fetchPlanStatus() → Get limits + usage from backend
2. Use feature → API call
3. Backend checks DB quota
4. If allowed → Generate + Save to DB
5. Frontend calls fetchPlanStatus() → Refresh usage
6. Subscription screen shows backend usage
```

---

## 🔍 TESTING AFTER FIXES

### Guest Testing:
- [ ] Guest A generates 1 question → Success
- [ ] Guest B (different device) generates 1 question → Success (not blocked)
- [ ] Guest A tries 2nd question → Blocked by frontend (limit reached)
- [ ] Check database → No guest rows
- [ ] Restart app → Usage persists in AsyncStorage
- [ ] Next day → Usage resets

### Logged-in Testing:
- [ ] User generates content → Saved to DB
- [ ] Check database → Row exists with userId
- [ ] Usage tracked in backend
- [ ] Subscription screen shows correct usage
- [ ] Limit enforcement works

---

## 🚨 CRITICAL IMPACT

**Before Fix 2:**
- ❌ First guest worldwide blocks all other guests
- ❌ Guest data pollutes database
- ❌ Privacy violation (server tracking guests)

**After Fix 2:**
- ✅ Each guest independent
- ✅ Clean database (only logged-in users)
- ✅ Privacy-friendly (client-side tracking only)
- ✅ Scalable (no server load for guests)

---

## 📝 NOTES

- Fix 2 is **CRITICAL** - current implementation is broken for guests
- Fix 3 is optimization (already removed from frontend)
- Fix 4 is cleanup (type consistency)
- All fixes should be done together for consistency
