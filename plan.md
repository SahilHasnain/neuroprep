# complyDesk — Production MVP Plan

**Status:** MVP prototype (demo + partial Appwrite)
**Target:** Production-ready SaaS that can be sold to small businesses
**Stack:** Expo (React Native) + NativeWind + Appwrite
**Audience:** Compliance officers in SMBs (10–200 employees)

---

## Current gaps blocking production

```
Demo mode          = complete
Appwrite auth      = complete (login/register/logout)
Appwrite incidents = partial (create, list, update)
Timeline           = demo only, NOT wired to Appwrite
Tasks              = demo only, NOT wired to Appwrite
Checklists         = demo only, NOT wired to Appwrite
Templates          = demo only, NOT wired to Appwrite
Attachments        = partial (Appwrite list + upload done)
PDF export         = works (demo data only)
Search             = local filter (not server-side)
Multi-tenant       = NOT built
Roles/permissions  = NOT built
Error handling     = minimal
Production build   = NOT configured
Payments           = NOT built
```

---

## Phase 1 — Complete Appwrite Integration (Week 1)

### Goal: All features work end-to-end in Appwrite mode

- [ ] Wire timeline to Appwrite `timeline_events` collection
- [ ] Wire tasks to Appwrite `tasks` collection
- [ ] Wire checklists to Appwrite (per-incident checklist items)
- [ ] Wire templates to Appwrite `templates` collection
- [ ] Fix `create.tsx` — it still calls `demoService.addTimelineEvent()` in Appwrite mode
- [ ] Real-time subscriptions for timeline, tasks, checklist changes
- [ ] Server-side search using Appwrite `search` attribute / `contains` filter
- [ ] PDF export pulls from live Appwrite data (not demo)
- [ ] Write a setup script like `scripts/setup-appwrite.cjs` but for all collections

**Result:** Every feature works with real data. No more "works in demo, broken in live".

---

## Phase 2 — Multi-tenant & Access Control (Week 2)

### Goal: Each org sees only their own data

- [ ] Add `teamId` or `organizationId` field to every collection
- [ ] On registration, create a team in Appwrite Teams and assign the user
- [ ] All queries filter by `teamId` — no cross-org data leaks
- [ ] Appwrite document-level permissions: `read/update/delete` scoped to team members
- [ ] Create team management screen: invite members via email
- [ ] Handle invite acceptance flow (Appwrite team membership)

### Roles
- [ ] **Admin** — full access, can manage team, delete incidents
- [ ] **Member** — can create/view/update incidents, add timeline/tasks
- [ ] **Viewer** — read-only access to incidents

**Result:** A small business can sign up, invite their team, and work together without seeing other orgs' data.

---

## Phase 3 — Production Hardening (Week 3)

### Goal: The app doesn't crash, lose data, or confuse users

- [ ] Error boundaries on every screen (React ErrorBoundary)
- [ ] Network detection — show offline banner when disconnected
- [ ] Optimistic UI updates for create/update/delete with rollback on failure
- [ ] Appwrite request timeout handling (no infinite spinners)
- [ ] Form validation errors inline (not just Alert popups)
- [ ] Empty states for every screen (already done for incidents, do for others)
- [ ] Loading skeletons instead of spinner
- [ ] Confirm dialog before delete/destructive actions
- [ ] Input sanitization on text fields
- [ ] Session expiry detection — auto-redirect to login when token expires

### Security
- [ ] .env.local is in .gitignore (verify)
- [ ] No hardcoded secrets in the codebase
- [ ] Appwrite API usage limits — rate limit alerts
- [ ] HTTPS enforced (already done via Appwrite endpoint)

**Result:** Feels like a professional app, not a student project.

---

## Phase 4 — Business & Go-to-Market (Week 3–4)

### Goal: People can actually pay and use it

- [ ] Appwrite-free tier: 1 team, max 10 incidents (check in hook, show upgrade prompt)
- [ ] Stripe / Razorpay integration for subscription:
  - Free: 10 incidents, 1 team, basic features
  - Pro ($29/mo): unlimited incidents, 10 team members, PDF export, priority support
  - Enterprise ($99/mo): unlimited everything, audit log, SSO (future)
- [ ] Track subscription status in Appwrite `profiles` collection
- [ ] Feature gating based on subscription plan
- [ ] Billing portal link in Settings

### Legal
- [ ] Terms of Service screen in app
- [ ] Privacy Policy screen in app
- [ ] GDPR compliance notice (required since this is a compliance app)

### Launch prep
- [ ] App icon (not Expo default)
- [ ] Splash screen with branding
- [ ] App name, slug, scheme in `app.json`
- [ ] EAS Build config for Android + iOS
- [ ] App store screenshots generator

**Result:** A business can sign up, pay, and use the app.

---

## Phase 5 — Polish & Admin (Week 4)

### Goal: Retention and quality of life

- [ ] Push notifications for:
  - Incident assigned to you
  - Task deadline approaching
  - Status change on incidents you created
- [ ] In-app notifications center
- [ ] Filter incidents by status, severity, category, date range
- [ ] Sort incidents (newest, oldest, severity)
- [ ] Pull-to-refresh on all list screens
- [ ] Dark mode toggle
- [ ] Localization (English + Hindi/Urdu — compliance officers in India)

### Admin panel (web-based, lightweight)
- [ ] Simple React web app (or use Appwrite Console directly)
- [ ] View all teams, incidents, usage stats
- [ ] Manual subscription management

**Result:** Users keep coming back because the app is fast, convenient, and pleasant.

---

## What NOT to build (Phase 1)

❌ AI-powered risk scoring
❌ Chat / in-app messaging
❌ OCR for document scanning
❌ Custom dashboard widgets
❌ Mobile-only (web version) — future
❌ SSO / OAuth — future
❌ Audit log — future (Phase 2 enterprise)

---

## Estimated timeline

| Phase | Duration | Cost (dev time) |
|-------|----------|----------------|
| 1 — Complete Appwrite | 1 week | Free (your time) |
| 2 — Multi-tenant | 1 week | Free |
| 3 — Hardening | 1 week | Free |
| 4 — Business | 1 week | Stripe fees only |
| 5 — Polish | ongoing | Free |

**Total to production:** ~4 weeks of focused work.

---

## Revenue model

| Plan | Price | What they get |
|------|-------|---------------|
| Free | $0 | 10 incidents, 1 team | 
| Pro | $29/mo | Unlimited incidents, 10 members, PDF, priority |
| Enterprise | $99/mo | Unlimited everything, audit log, SSO (future) |

**Target:** 50 paying customers at $29 = $1,450/mo MRR
**Break-even:** 10 customers ($290/mo) covers Appwrite hosting + Stripe fees

---

## What happens to demo mode?

Keep it for **development only** — it lets you test UI changes without touching the database. But when building the payment flow, make sure demo mode can't bypass feature gating. In the production build (`app.json` → `EXPO_PUBLIC_APP_MODE=appwrite`), demo mode is disabled.

---

## Immediate next step

Start with **Phase 1**: wire `useTimeline()`, `useTasks()`, and checklist to Appwrite. Everything else is blocked until all features work with real data.
