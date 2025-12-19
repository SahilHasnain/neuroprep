# MVP Paid Plan — Implementation Guide

**Goal**

- Prove willingness to pay; prioritize strong signal over optimizing revenue.

**Plans**

### 🆓 Free Plan (Hook Strategy)

- **Ask Doubt**: 2/day, generic explanation, no follow-ups, no memory
- **Questions**: 1 set/day (max 5 questions), easy difficulty only
- **Notes**: 1 generation/day, brief notes only

### 💎 Student Pro (₹199/mo) - All Features Unlocked

- **Ask Doubt**: Unlimited, step-by-step, follow-ups enabled, remembers last 10 doubts, exam-oriented
- **Questions**: Unlimited sets, all difficulties (easy/medium/hard), any count (5-20)
- **Notes**: Unlimited, all lengths (brief/detailed/exam-focused)

**Scope**

- Implement gating across ALL three features (Ask Doubt + Questions + Notes).
- Consistent upgrade CTAs everywhere when limit hits.

**Backend Changes**

- **Tables** (Appwrite `TablesDB`):
  - `subscriptions`: `{ userId, plan: "free"|"student_pro", status: "active"|"inactive", renewAtISO }`
  - `doubts`: add `identityType`, `identityId` fields
  - `ai_answers`: existing
  - `questions`: add `identityType`, `identityId`, `createdAt` fields for quota tracking
  - `notes`: add `identityType`, `identityId`, `createdAt` fields for quota tracking
- **Env**: Use existing admin key; no new vars required.
- **Helpers** (inside functions - reusable across Ask Doubt, Questions, Notes):
  - `getUserPlan(identityType, identityId)`: if guest → `free`; if user → read `subscriptions`
  - `enforceDailyQuota(identityId, resource, limit)`: count today's resource usage; if ≥ limit → 402 error
  - `getRecentDoubts(userId, n=10)`: for memory in Ask Doubt (paid only)
  - `isFeatureAllowed(plan, feature)`: check plan permissions
- **AI Prompt knobs**:
  - **Ask Doubt**: tone (free=neutral, paid=exam-oriented), style (free=short, paid=step-by-step), memory (paid only)
  - **Questions**: difficulty (free=easy only, paid=all), count (free=max 5, paid=5-20)
  - **Notes**: length (free=brief only, paid=brief/detailed/exam-focused)
- **Response shape**: add `plan` + `limitInfo` to every handler response for frontend gating.

**Frontend Changes**

- **Plan check**: on app start → load identity, call backend to get plan + limits
- **UI gating** (All screens):
  - **Ask Doubt**: Free shows `2/day`, Paid shows "Pro" badge + unlimited
  - **Questions**: Free shows `1 set/day (5 Qs)`, disable difficulty/count options; Paid unlocks all
  - **Notes**: Free shows `1/day (Brief)`, disable length selector; Paid unlocks all
- **Upgrade CTA**: consistent banner/modal across all three screens when limit hits
- **Login trigger**: available in all gated screens (not just Ask Doubt)

**Payments (MVP‑practical)**

- Phase 1 (fast signal): Manual activation by support/admin — set `subscriptions` row to `student_pro` after user pays offline/UPI.
- Phase 2 (optional): Razorpay Standard Checkout → on success webhook sets `subscriptions` row. Keep this out of MVP if speed matters.

**API Contract**

- **Ask Doubt**: Request `{ identityType, identityId, doubtText }`
- **Questions**: Request `{ identityType, identityId, subject, topic, difficulty, questionCount }`
- **Notes**: Request `{ identityType, identityId, subject, topic, noteLength }`
- **Response (200)**: `{ success, plan, limitInfo: { usedToday, maxPerDay, resource }, data }`
- **Response (402 LIMIT)**: `{ success:false, plan:"free", limitInfo, message:"Daily limit reached" }`

**Gating Logic Summary**

### Free Plan

- **Ask Doubt**: 2/day, generic style, no follow-ups, no memory
- **Questions**: 1 set/day, easy only, max 5 questions
- **Notes**: 1/day, brief only

### Student Pro (₹199/mo)

- **Ask Doubt**: Unlimited, step-by-step, follow-ups, memory of 10
- **Questions**: Unlimited sets, all difficulties, 5-20 questions
- **Notes**: Unlimited, all lengths (brief/detailed/exam)

**Testing Checklist**

- New user (no subscription): defaults to free, limit enforced at 2.
- Upgrade path: set `subscriptions.plan=student_pro`; verify unlimited + follow‑up + memory.
- Memory: verify previous 10 doubts are injected into prompt only on paid.
- Tone/style difference visible between free vs paid answers.
- Limit error surfaces correctly and triggers CTA.

**Rollout**

- Seed a small cohort (10–20 users) on free.
- Manually upgrade 3–5 users and monitor engagement and NPS.
- Track conversion clicks from CTA; record basic analytics in console or a simple table.

**Files to touch**

- Backend: Add helpers to all three functions (`askDoubt/`, `generate-questions/`, `notes/`)
- Frontend: Gate all three screens with plan checks and upgrade CTAs
  - [app/(tabs)/ask-doubt.tsx](<app/(tabs)/ask-doubt.tsx>)
  - [app/(tabs)/generate-questions.tsx](<app/(tabs)/generate-questions.tsx>)
  - [app/(tabs)/notes.tsx](<app/(tabs)/notes.tsx>)

**Keep It Simple**

- Manual billing activation for MVP
- Same plan structure across all features (easier messaging)
- Consistent upgrade CTA design everywhere
  theek hai yaar, **sirf MVP ke liye** bol raha hoon —
  no future dreams, no gyaan, **seedha paisa + validation**.

---

## Authentication Strategy (Optional Free, Required Paid)

**Principle**

- Free: no login; use stable `guestId` for daily quota.
- Paid: login required; bind subscription to `userId`.

**Frontend**

- Generate and persist `guestId`: `@neuroprep_guest_id` (e.g., `guest_${Date.now()}_${Math.random().toString(36).slice(2,8)}`).
- Add `AuthModal` for paid upgrade (Appwrite email/password or magic link).
- Keep app state as `{ identityType: 'guest'|'user', identityId }`.

**Backend**

- Accept headers: `x-identity-type`, `x-identity-id`.
- For `guest`: enforce free plan (2/day) using `identityId`.
- For `user`: read `subscriptions` by `userId`; apply paid rules.
- Save `identityType` + `identityId` on `doubts` rows.

**Tables**

- `subscriptions`: `{ userId, plan, status, renewAtISO }` (only users).
- `doubts`: add `identityType`, `identityId`.

**Gating Rules**

- `guest` → plan=`free`: quota 2/day, follow‑up off, memory off.
- `user` → plan from `subscriptions`: apply paid features.

**Upgrade Flow**

1. User hits limit/taps upgrade → show `AuthModal`.
2. After login, set `subscriptions.plan='student_pro'` (manual in MVP).
3. Refresh plan state → unlock paid features.

**Security (MVP)**

- Trust headers for speed; later add Appwrite JWT verification.
- Quota + manual upgrades keep abuse risk low for MVP.

---

## MVP PAID PLAN — 100% PRACTICAL

### 🎯 Goal (clear rakho)

- ye prove karna:
  **“kya koi is cheez ke liye paise deta hai ya nahi”**
- revenue kam ho chalega, **signal strong chahiye**

---

## 🔓 FREE PLAN (sirf magnet)

**₹0**

- 2 doubts / day
- generic AI explanation
- no follow-up
- no memory
- no exam pressure logic

> free ka kaam: _aadat dalwana_

---

## 💰 PAID PLAN #1 — **Student Pro (MVP Core)**

### **₹199 / month**

ye hi tumhara **main test** hai.

### Features:

- unlimited doubts
- step-by-step explanation
- follow-up questions allowed
- AI remembers last 10 doubts
- exam-oriented tone (no theory lecture)

> price low isliye:
> “sochna band, kharidna shuru”

---

## 💰 PAID PLAN #2 — **Exam Mode (Add-on)**

### **₹99 / month (optional add-on)**

- strict exam style answers
- time-bound explanation
- no extra gyaan
- marks-oriented hints only

> ye logon ko feel deta hai:
> “ye AI serious hai”

---

## ❌ KYA MAT ADD KARNA (MVP me)

- streaks
- leaderboards
- fancy analytics
- AI personality modes
- heavy dashboards

ye sab **baad ka noise** hai

---

## 🔐 PAYMENT PSYCHOLOGY (important)

- monthly only
- yearly ❌
- lifetime ❌

kyon?

> tum testing kar rahe ho, commitment nahi maang rahe

---

## 📊 SUCCESS METRIC (simple rakho)

- 1000 free users
- 50 paid users = **product valid**
- 100+ paid = **double down**
- 10 bhi na mile = **offer galat**, idea nahi

---

## 🔥 MVP RULE (Bill Gates style)

> “pehla version sharminda kare,
> par log use karein”

agar paid user bole:

- “AI thoda slow hai”
- “UI ugly hai”

aur **phir bhi pay kare**
toh tum jeet gaye

---

## 🧠 Last hard truth

Paid plan ka kaam:

- paisa kamana ❌
- **respect earn karna** ✅

Jis din koi bole:

> “bhai paisa kaat le, doubt solve kar”

samajh lo product zinda hai.

---

Next chaho toh:

- **Razorpay setup**
- **Paywall UX**
- **first 50 paid users ka exact plan**
- **refund strategy**

bol do yaar, next kaunsa step.
