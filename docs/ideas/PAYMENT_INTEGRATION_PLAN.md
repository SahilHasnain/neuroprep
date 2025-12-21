# Payment Integration Plan - Razorpay

## Overview
Integrate Razorpay payment gateway for Pro subscription (₹199/month with 7-day free trial).

---

## **Phase 1: Backend Foundation**

### **1.1 Database Schema**
Create Appwrite tables:

**Table: `subscriptions`**
- `userId` (string, required)
- `planType` (enum: free, pro)
- `status` (enum: active, cancelled, expired, trial)
- `razorpaySubscriptionId` (string, nullable)
- `razorpayCustomerId` (string, nullable)
- `trialEndsAt` (datetime, nullable)
- `currentPeriodStart` (datetime)
- `currentPeriodEnd` (datetime)
- `cancelledAt` (datetime, nullable)
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Table: `payments`**
- `userId` (string, required)
- `subscriptionId` (string, required)
- `razorpayPaymentId` (string)
- `razorpayOrderId` (string)
- `amount` (number)
- `currency` (string, default: INR)
- `status` (enum: pending, success, failed)
- `createdAt` (datetime)

### **1.2 Backend Config**
Add to `neuroprep-backend/shared/config.js`:
```js
export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  planId: process.env.RAZORPAY_PLAN_ID, // Monthly plan with trial
};
```

Add to `.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_PLAN_ID=plan_xxx
APPWRITE_SUBSCRIPTIONS_TABLE_ID=xxx
APPWRITE_PAYMENTS_TABLE_ID=xxx
```

---

## **Phase 2: Backend Functions**

### **2.1 Create Subscription Function**
**File:** `neuroprep-backend/subscription/create.js`

**Input:**
```json
{
  "userId": "string"
}
```

**Logic:**
1. Check if user already has active subscription
2. Create Razorpay customer
3. Create Razorpay subscription (with 7-day trial)
4. Save to `subscriptions` table with status=trial
5. Return subscription details

**Output:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_xxx",
    "razorpaySubscriptionId": "sub_xxx",
    "status": "trial",
    "trialEndsAt": "2024-01-15T00:00:00Z"
  }
}
```

### **2.2 Verify Payment Function**
**File:** `neuroprep-backend/subscription/verify-payment.js`

**Input:**
```json
{
  "razorpayPaymentId": "string",
  "razorpayOrderId": "string",
  "razorpaySignature": "string",
  "subscriptionId": "string"
}
```

**Logic:**
1. Verify Razorpay signature
2. Update subscription status to active
3. Save payment record
4. Update user plan to pro

**Output:**
```json
{
  "success": true,
  "message": "Payment verified"
}
```

### **2.3 Get Plan Status Function**
**File:** `neuroprep-backend/subscription/get-plan-status.js`

**Input:** Headers with identity

**Logic:**
1. Fetch subscription from DB
2. Check trial/active status
3. Return plan + usage

**Output:**
```json
{
  "success": true,
  "data": {
    "planType": "pro",
    "status": "trial",
    "trialEndsAt": "2024-01-15T00:00:00Z",
    "usage": {
      "doubts": 5,
      "questions": 10,
      "notes": 3,
      "lastResetDate": "2024-01-08"
    }
  }
}
```

### **2.4 Cancel Subscription Function**
**File:** `neuroprep-backend/subscription/cancel.js`

**Input:**
```json
{
  "subscriptionId": "string"
}
```

**Logic:**
1. Cancel Razorpay subscription
2. Update DB: status=cancelled, cancelledAt=now
3. Keep access until currentPeriodEnd

**Output:**
```json
{
  "success": true,
  "message": "Subscription cancelled. Access until 2024-02-08"
}
```

### **2.5 Webhook Handler**
**File:** `neuroprep-backend/subscription/webhook.js`

**Events to handle:**
- `subscription.charged` → Update payment record
- `subscription.cancelled` → Update status
- `subscription.completed` → Downgrade to free
- `payment.failed` → Mark payment failed

---

## **Phase 3: Frontend Integration**

### **3.1 Add Razorpay SDK**
```bash
cd neuroprep-frontend
npm install react-native-razorpay
```

### **3.2 Update Constants**
Add to `constants/index.ts`:
```ts
export const API_ENDPOINTS = {
  // ... existing
  CREATE_SUBSCRIPTION: "https://xxx.appwrite.run",
  VERIFY_PAYMENT: "https://xxx.appwrite.run",
  GET_PLAN_STATUS: "https://xxx.appwrite.run",
  CANCEL_SUBSCRIPTION: "https://xxx.appwrite.run",
};

export const RAZORPAY_KEY_ID = "rzp_test_xxx";
```

### **3.3 Update planStore**
**File:** `store/planStore.ts`

Add methods:
```ts
createSubscription: async () => {
  // Call backend create-subscription
  // Return subscription details
}

initiatePayment: async (subscriptionId: string) => {
  // Open Razorpay checkout
  // On success, call verifyPayment
}

verifyPayment: async (paymentData) => {
  // Call backend verify-payment
  // Update planType to pro
}

cancelSubscription: async () => {
  // Call backend cancel
  // Update UI
}
```

### **3.4 Update UpgradeModal**
**File:** `components/modals/UpgradeModal.tsx`

Replace `handleUpgrade`:
```tsx
const handleUpgrade = async () => {
  if (!user) {
    setShowAuthPrompt(true);
    return;
  }

  setLoading(true);
  try {
    // Create subscription
    const sub = await planStore.createSubscription();
    
    // Initiate payment
    await planStore.initiatePayment(sub.subscriptionId);
    
    onClose();
  } catch (err) {
    Alert.alert("Error", err.message);
  } finally {
    setLoading(false);
  }
};
```

### **3.5 Update Subscription Screen**
**File:** `app/(tabs)/subscription.tsx`

Add cancel button handler:
```tsx
const handleCancelSubscription = async () => {
  Alert.alert(
    "Cancel Subscription",
    "You'll have access until the end of your billing period.",
    [
      { text: "Keep Subscription", style: "cancel" },
      {
        text: "Cancel",
        style: "destructive",
        onPress: async () => {
          await planStore.cancelSubscription();
        },
      },
    ]
  );
};
```

---

## **Phase 4: Testing & Deployment**

### **4.1 Test Razorpay Integration**
1. Create test subscription
2. Test payment flow
3. Test webhook events
4. Test cancellation

### **4.2 Update Quota Enforcement**
Update `shared/helpers.js`:
```js
export async function getUserPlan(tablesDB, identityType, identityId) {
  if (identityType === "guest") return "free";
  
  // Fetch subscription
  const sub = await tablesDB.listRows({
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.subscriptionsTableId,
    queries: [
      Query.equal("userId", identityId),
      Query.equal("status", ["active", "trial"]),
    ],
  });
  
  return sub.rows.length > 0 ? "pro" : "free";
}
```

### **4.3 Deploy Functions**
Deploy all subscription functions to Appwrite:
- create-subscription
- verify-payment
- get-plan-status
- cancel-subscription
- webhook

### **4.4 Update Frontend URLs**
Update `constants/index.ts` with deployed function URLs.

---

## **Phase 5: Production Readiness**

### **5.1 Switch to Live Keys**
Replace test keys with live Razorpay keys in production.

### **5.2 Add Error Handling**
- Payment failures
- Network errors
- Webhook retries

### **5.3 Add Analytics**
Track:
- Subscription creations
- Payment success/failure rates
- Cancellation reasons

### **5.4 Legal & Compliance**
- Add Terms of Service
- Add Refund Policy
- Add Privacy Policy for payment data

---

## **Summary**

**Phase 1:** Database + Config (1-2 hours)
**Phase 2:** Backend Functions (3-4 hours)
**Phase 3:** Frontend Integration (2-3 hours)
**Phase 4:** Testing (2 hours)
**Phase 5:** Production (1 hour)

**Total Estimated Time:** 9-12 hours

**Key Files to Create:**
- Backend: 5 new functions (subscription folder)
- Frontend: Update 3 files (planStore, UpgradeModal, subscription.tsx)
- Config: 2 new Appwrite tables

**Dependencies:**
- Razorpay account
- react-native-razorpay package
- Webhook URL setup
