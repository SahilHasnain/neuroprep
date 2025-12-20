Summarized conversation history

Read [](file:///c%3A/Users/MD%20SAHIL%20HASNAIN/Desktop/Projects/neuroprep/neuroprep-frontend/components/ui/AuthModal.tsx#1-1), lines 1 to 100

I have analyzed the current state of the frontend. Since `planStore.ts` and `PlanComponents.tsx` are missing, we need to build the foundation for managing subscription state before creating the UI.

Here is the **Frontend Implementation Plan for Paid Pro Plan**:

### Phase 1: State Management (The Foundation)
**Goal:** accurate tracking of the user's plan (Free vs. Pro), daily limits, and current usage.
1.  **Create `store/planStore.ts`**: A Zustand store to:
    *   Store `planType` ('free' | 'pro').
    *   Store `limits` (e.g., `{ doubts: 5, questions: 10 }`).
    *   Store `usage` (e.g., `{ doubts: 2, questions: 0 }`).
    *   Action `fetchPlanStatus()`: Calls the backend to get current usage/limits.
    *   Action `incrementUsage(feature)`: Optimistically updates usage after a successful API call.
2.  **Update `AuthStore`**: Ensure plan status is fetched immediately after login.

### Phase 2: UI Components (The Visuals)
**Goal:** Inform the user of their limits and present the upgrade option.
1.  **Create `components/ui/UsageBadge.tsx`**: A small component to display "3/5 used" or "Pro Unlimited" in the header of feature screens.
2.  **Create `components/modals/UpgradeModal.tsx`**: The "Paywall" modal.
    *   Triggered when a 402 error occurs.
    *   Shows "Limit Reached".
    *   Displays "Go Pro" button.
3.  **Create `app/subscription/plans.tsx`**: A dedicated screen for comparing Free vs. Pro features and pricing.

### Phase 3: Integration & Gating (The Wiring)
**Goal:** Connect the UI to the Backend logic.
1.  **Integrate into Screens**:
    *   Update `ask-doubt.tsx`, `generate-questions.tsx`, and `notes.tsx`.
    *   Add `UsageBadge` to the UI.
    *   **Error Handling**: Intercept `402 Payment Required` responses to automatically open the `UpgradeModal`.
    *   **Success Handling**: Call `planStore.incrementUsage()` on success.

### Phase 4: Payments (The Transaction)
**Goal:** Enable actual purchase flow.
1.  **Payment Gateway**: Integrate (likely Razorpay for India or RevenueCat for IAP).
2.  **Purchase Flow**:
    *   Initiate payment from `UpgradeModal`.
    *   Handle success callback -> Call backend to upgrade user -> Refresh `planStore`.

---

**Shall I proceed with Phase 1 (Creating the `planStore` and basic types)?**