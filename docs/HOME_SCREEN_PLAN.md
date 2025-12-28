# Home Screen MVP Plan

## Current State
- Placeholder home with hardcoded stats (24 questions, 87% accuracy, 15 day streak)
- 4 quick action buttons (Ask Doubt, Generate Questions, Notes, View Progress - non-functional)
- Generic "Welcome Champ" greeting
- No real data integration

## MVP Home Screen Goals
**Launch-ready, minimal, functional**

### 1. Hero Section
**Keep it simple:**
- Personalized greeting (use user name if logged in, else "Welcome Champ")
- Motivational tagline: "Ready to ace your exam?"
- Clean, minimal design

### 2. Quick Actions (Already Good)
**No changes needed** - current 4 buttons work:
- Ask Doubt → `/ask-doubt`
- Generate Questions → `/generate-questions`
- Convert Notes → `/notes`
- View Progress → Remove or link to subscription tab for now

**Action:** Remove "View Progress" button (not MVP) OR redirect to subscription tab

### 3. Today's Usage (Real Data)
**Replace fake stats with actual usage:**
- Show real daily usage from `usePlanStore`:
  - Doubts used: `X/2` (free) or `Unlimited` (pro)
  - Questions generated: `X/1` (free) or `Unlimited` (pro)
  - Notes converted: `X/1` (free) or `Unlimited` (pro)
- Use existing `UsageProgressBar` component (already built)
- Hide for Pro users (show "Unlimited Access" badge instead)

### 4. Recent Activity (Optional - Skip for MVP)
**Skip this** - adds complexity, not critical for launch

### 5. Pro Upsell Banner (Free Users Only)
**Simple banner:**
- Show only if user is on free plan
- "Upgrade to Pro for unlimited access"
- CTA button → opens subscription tab or upgrade modal
- Dismissible (store in AsyncStorage)

## Implementation Checklist

### Phase 1: Clean Up (5 min)
- [ ] Remove or fix "View Progress" button
- [ ] Remove hardcoded stats

### Phase 2: Real Usage Data (15 min)
- [ ] Import `usePlanStore` 
- [ ] Replace stats section with real usage data
- [ ] Show usage bars for free users
- [ ] Show "Pro" badge for pro users

### Phase 3: Pro Upsell (10 min)
- [ ] Create simple `ProBanner` component
- [ ] Show only for free users
- [ ] Make dismissible with AsyncStorage
- [ ] Link to subscription tab

### Phase 4: Polish (5 min)
- [ ] Update greeting to use real user name if available
- [ ] Test on both free and pro accounts
- [ ] Ensure smooth navigation

## Components Needed

### New Components
1. **ProBanner** (simple)
   - Props: `onDismiss`, `onUpgrade`
   - Dismissible with X button
   - Gradient background, crown icon

### Existing Components (Reuse)
- `QuickActionButton` ✅
- `UsageProgressBar` ✅ (from subscription screen)
- `StatsCard` ❌ (remove, replace with usage)

## Data Sources
- **User info:** `useAuthStore` → `user.name`
- **Plan & usage:** `usePlanStore` → `planType`, `usage`, `limits`
- **Banner dismissed:** AsyncStorage → `@home_pro_banner_dismissed`

## Design Principles
- **Minimal:** Only show what's needed
- **Functional:** Everything must work
- **Fast:** No unnecessary API calls
- **Clear:** User knows what to do next

## What We're NOT Building (Post-MVP)
- ❌ Streak tracking
- ❌ Accuracy metrics
- ❌ Recent activity feed
- ❌ Progress charts/graphs
- ❌ Achievements/badges
- ❌ Study reminders
- ❌ Calendar integration

## Final Home Screen Structure

```
┌─────────────────────────────────┐
│ Welcome [Name]                  │
│ Ready to ace your exam?         │
├─────────────────────────────────┤
│ [Pro Banner] (if free user)     │
├─────────────────────────────────┤
│ Quick Actions                   │
│ ┌──────┐ ┌──────┐              │
│ │Doubt │ │Quest │              │
│ └──────┘ └──────┘              │
│ ┌──────┐                       │
│ │Notes │                       │
│ └──────┘                       │
├─────────────────────────────────┤
│ Today's Usage (if free)         │
│ OR                              │
│ Pro Badge (if pro)              │
│ ━━━━━━━━━━ Doubts: 1/2         │
│ ━━━━━━━━━━ Questions: 0/1      │
│ ━━━━━━━━━━ Notes: 1/1          │
└─────────────────────────────────┘
```

## Estimated Time: 35 minutes total
**Launch-ready, no bloat, fully functional.**
