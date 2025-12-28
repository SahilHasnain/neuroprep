# 🚨 SUBSCRIPTION CRITICAL ISSUES - MVP BLOCKER

**Status:** MUST FIX BEFORE LAUNCH  
**Date:** January 2025  
**Severity:** HIGH - Payment & Plan enforcement broken

---

## ❌ CRITICAL BUGS (Must Fix)

### 1. PLAN TYPE MISMATCH - BREAKING BUG ⚠️

**Impact:** Pro users treated as Free users, payment collected but no features unlocked

**Problem:**

- Backend `planConfig.js` defines `pro`
- Subscription `create.js` saves `planType: "pro"`
- Feature endpoints check `plan === "pro"`
- Frontend checks `planType === "pro"`

**Files:**

- `neuroprep-backend/shared/planConfig.js` (line 11)
- `neuroprep-backend/subscription/create.js` (line 52)
- `neuroprep-backend/askDoubt/index.js` (line 50)
- `neuroprep-frontend/store/planStore.ts` (line 68)

**Fix:** Standardize to `"pro"` everywhere OR `"pro"` everywhere

---

### 2. SUBSCRIPTION STATUS NOT CHECKED IN getUserPlan()

**Impact:** Trial users don't get Pro features during 7-day trial

**Problem:**

- `get-plan-status.js` queries `status: ["active", "trial"]` ✅
- `helpers.js` getUserPlan() only checks `status: "active"` ❌
- Trial subscriptions return `status: "trial"` but getUserPlan ignores them

**Files:**

- `neuroprep-backend/shared/helpers.js` (line 30)
- `neuroprep-backend/subscription/get-plan-status.js` (line 37)

**Fix:**

```js
// helpers.js line 30
Query.equal("status", ["active", "trial"]),
```

---

### 3. RAZORPAY PAYMENT VERIFICATION WRONG ALGORITHM

**Impact:** All payments fail verification, users can't upgrade

**Problem:**

- `verify-payment.js` verifies `orderId|paymentId` signature
- Razorpay subscriptions use `subscriptionId|paymentId` format
- Signature mismatch = payment always rejected

**Files:**

- `neuroprep-backend/subscription/verify-payment.js` (line 29-32)

**Fix:**

```js
// Line 29-32
const generatedSignature = crypto
  .createHmac("sha256", razorpayConfig.keySecret)
  .update(`${razorpaySubscriptionId}|${razorpayPaymentId}`)
  .digest("hex");
```

**Also need:** Change request body to accept `razorpaySubscriptionId` instead of `razorpayOrderId`

---

### 4. WEBHOOK SIGNATURE VERIFICATION INSECURE

**Impact:** Webhook events can be spoofed, fake subscription activations

**Problem:**

- Uses `razorpayConfig.keySecret` for webhook verification
- Should use separate `RAZORPAY_WEBHOOK_SECRET`
- Razorpay docs require dedicated webhook secret

**Files:**

- `neuroprep-backend/subscription/webhook.js` (line 14)
- `neuroprep-backend/shared/config.js` (missing webhook secret)

**Fix:**

```js
// config.js - add
webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,

// webhook.js line 14
.createHmac("sha256", razorpayConfig.webhookSecret)
```

---

### 5. RAZORPAY KEY NOT CONFIGURED IN FRONTEND

**Impact:** Payment UI won't open, upgrade flow completely broken

**Problem:**

- `constants/index.ts` has `RAZORPAY_KEY_ID = "rzp_test_xxx"` placeholder
- No real key = Razorpay SDK fails to initialize

**Files:**

- `neuroprep-frontend/constants/index.ts` (line 95)

**Fix:** Replace with actual test key from Razorpay dashboard

---

### 6. SUBSCRIPTION FIELD NAME INCONSISTENCY

**Impact:** getUserPlan() returns "free" even for Pro users

**Problem:**

- `create.js` saves field `planType: "pro"`
- `getUserPlan()` reads field `plan` (doesn't exist)
- Returns undefined → defaults to "free"

**Files:**

- `neuroprep-backend/subscription/create.js` (line 52)
- `neuroprep-backend/shared/helpers.js` (line 33)

**Fix:** Change helpers.js line 33:

```js
return sub.rows[0].planType; // was: sub.rows[0].plan
```

---

### 7. PLANSTORE RETURNS WRONG SUBSCRIPTION ID

**Impact:** Payment flow breaks, can't verify payment

**Problem:**

- `createSubscription()` returns `planId: result.data.planId`
- Backend returns `razorpaySubscriptionId` not `planId`
- Frontend expects `razorpaySubscriptionId`

**Files:**

- `neuroprep-frontend/store/planStore.ts` (line 119)

**Fix:**

```js
// Line 119
razorpaySubscriptionId: result.data.razorpaySubscriptionId,
```

---

## ⚠️ HIGH PRIORITY (Should Fix)

### 8. NO EXPIRED SUBSCRIPTION CHECK

**Impact:** Users keep Pro access after subscription expires

**Problem:**

- `get-plan-status.js` doesn't check if `currentPeriodEnd < now`
- Expired subscriptions still return `status: "active"`
- No cron job to update expired subscriptions

**Fix:** Add expiry check in get-plan-status.js:

```js
if (sub.status === "active" && new Date(sub.currentPeriodEnd) < new Date()) {
    // Mark as expired
    await tablesDB.updateRow({...data: { status: "expired" }});
    return "free";
}
```

---

### 9. TRIAL SUBSCRIPTION PAYMENT FLOW UNCLEAR

**Impact:** Users might get free Pro access forever

**Problem:**

- Trial created with `start_at` 7 days in future
- No payment collected during trial
- Unclear how first payment is triggered after trial
- Webhook should handle `subscription.charged` but not tested

**Files:**

- `neuroprep-backend/subscription/create.js` (line 44-50)

**Needs:** Testing of trial → paid transition flow

---

### 10. CANCEL DOESN'T HANDLE TRIAL PROPERLY

**Impact:** Trial users can't cancel, or get charged anyway

**Problem:**

- `cancel.js` uses `cancel_at_cycle_end: 1`
- Trial subscriptions have no billing cycle yet
- Should cancel immediately for trial users

**Files:**

- `neuroprep-backend/subscription/cancel.js` (line 43)

**Fix:** Check if trial, cancel immediately:

```js
const cancelAtEnd = sub.status === "trial" ? 0 : 1;
await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, {
  cancel_at_cycle_end: cancelAtEnd,
});
```

---

### 11. GUEST USAGE NOT MIGRATED ON LOGIN

**Impact:** Users can bypass limits by logging in/out

**Problem:**

- Guest usage stored in AsyncStorage
- Login doesn't transfer guest usage to user account
- Guest can use 2 doubts → logout → login → get 2 more

**Files:**

- `neuroprep-frontend/store/authStore.ts` (login flow)
- `neuroprep-frontend/hooks/useDoubts.ts` (usage tracking)

**Fix:** On login, sync guest usage to backend

---

## 📝 MEDIUM PRIORITY (Can Fix Post-Launch)

### 12. HARDCODED API ENDPOINTS

**Problem:** All function URLs hardcoded in `constants/index.ts`
**Impact:** Can't switch dev/prod easily
**Fix:** Use environment variables

---

### 13. NO PAYMENT RETRY LOGIC

**Problem:** If payment fails, user stuck
**Impact:** Lost conversions
**Fix:** Add retry button in payment failed state

---

### 14. WEBHOOK EVENTS NOT FULLY HANDLED

**Problem:** Only handles 4 events, Razorpay sends 10+
**Impact:** Edge cases not covered
**Fix:** Add handlers for `subscription.paused`, `subscription.resumed`, etc.

---

## 🔧 QUICK FIX CHECKLIST

Before deploying MVP:

- [ ] Fix plan type to `"pro"` everywhere (Issue #1)
- [ ] Add `"trial"` status to getUserPlan query (Issue #2)
- [ ] Fix payment verification signature (Issue #3)
- [ ] Add webhook secret env var (Issue #4)
- [ ] Configure real Razorpay key in frontend (Issue #5)
- [ ] Fix field name `plan` → `planType` (Issue #6)
- [ ] Fix planStore return value (Issue #7)
- [ ] Add expiry check in get-plan-status (Issue #8)
- [ ] Test trial → paid transition (Issue #9)
- [ ] Fix trial cancellation (Issue #10)
- [ ] Add guest usage migration (Issue #11)

---

## 🧪 TESTING REQUIRED

### Payment Flow Test

1. Guest user → Sign up → Start trial
2. Verify trial status = Pro features unlocked
3. Wait 7 days (or modify start_at for testing)
4. Verify first payment charged
5. Verify subscription status = active
6. Cancel subscription
7. Verify access until period end

### Webhook Test

1. Trigger `subscription.charged` from Razorpay dashboard
2. Verify signature validation passes
3. Verify subscription status updated in DB
4. Test `subscription.cancelled` event
5. Test `payment.failed` event

### Limit Enforcement Test

1. Free user → Use 2 doubts → Verify blocked
2. Pro user → Use 100 doubts → Verify unlimited
3. Trial user → Verify Pro limits
4. Expired Pro → Verify reverted to Free

---

## 📞 SUPPORT NEEDED

- **Razorpay Setup:** Need real API keys (test mode)
- **Webhook URL:** Deploy webhook function, configure in Razorpay
- **Database Schema:** Verify subscriptions table has correct fields
- **Environment Variables:** Set all required env vars in Appwrite

---

## 🎯 ESTIMATED FIX TIME

- Critical bugs (1-7): **4-6 hours**
- High priority (8-11): **3-4 hours**
- Testing: **2-3 hours**

**Total:** ~10 hours before safe to launch

---

## 📚 RELATED DOCS

- [RAZORPAY_SETUP.md](neuroprep-backend/RAZORPAY_SETUP.md)
- [PLAN_ENFORCEMENT_FIX.md](neuroprep-backend/PLAN_ENFORCEMENT_FIX.md)
- Razorpay Subscriptions API: https://razorpay.com/docs/api/subscriptions/

---

**Last Updated:** January 2025  
**Next Review:** After fixes implemented
