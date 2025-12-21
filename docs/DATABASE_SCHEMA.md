# Appwrite Database Schema - Subscriptions

## Table: `subscriptions`

### Attributes

| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `userId` | String | 255 | ✅ Yes | - | User's unique ID |
| `planType` | Enum | - | ✅ Yes | `free` | Plan type: `free`, `pro` |
| `status` | Enum | - | ✅ Yes | `active` | Status: `active`, `cancelled`, `expired`, `trial` |
| `razorpaySubscriptionId` | String | 255 | ❌ No | null | Razorpay subscription ID |
| `razorpayCustomerId` | String | 255 | ❌ No | null | Razorpay customer ID |
| `trialEndsAt` | DateTime | - | ❌ No | null | Trial period end date |
| `currentPeriodStart` | DateTime | - | ✅ Yes | - | Current billing period start |
| `currentPeriodEnd` | DateTime | - | ✅ Yes | - | Current billing period end |
| `cancelledAt` | DateTime | - | ❌ No | null | Cancellation timestamp |
| `cancellationReason` | String | 500 | ❌ No | null | Reason for cancellation |
| `createdAt` | DateTime | - | ✅ Yes | - | Record creation timestamp |
| `updatedAt` | DateTime | - | ✅ Yes | - | Last update timestamp |

### Indexes

| Index Name | Type | Attributes |
|------------|------|------------|
| `userId_idx` | Key | `userId` |
| `status_idx` | Key | `status` |

### Enum Values

**planType:**
- `free`
- `pro`

**status:**
- `active` - Active paid subscription
- `trial` - In trial period
- `cancelled` - Cancelled but still has access
- `expired` - Subscription ended

---

## Table: `payments` *(Optional - Future Use)*

### Attributes

| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `userId` | String | 255 | ✅ Yes | - | User's unique ID |
| `subscriptionId` | String | 255 | ✅ Yes | - | Related subscription ID |
| `razorpayPaymentId` | String | 255 | ✅ Yes | - | Razorpay payment ID |
| `razorpayOrderId` | String | 255 | ✅ Yes | - | Razorpay order ID |
| `amount` | Integer | - | ✅ Yes | - | Amount in paise (₹199 = 19900) |
| `currency` | String | 10 | ✅ Yes | `INR` | Currency code |
| `status` | Enum | - | ✅ Yes | `pending` | Status: `pending`, `success`, `failed` |
| `createdAt` | DateTime | - | ✅ Yes | - | Payment timestamp |

### Indexes

| Index Name | Type | Attributes |
|------------|------|------------|
| `userId_idx` | Key | `userId` |
| `subscriptionId_idx` | Key | `subscriptionId` |

### Enum Values

**status:**
- `pending` - Payment initiated
- `success` - Payment successful
- `failed` - Payment failed

---

## Setup Instructions

### 1. Create Database
```
Database Name: neuroprep
Database ID: (auto-generated or custom)
```

### 2. Create `subscriptions` Table

1. Go to Appwrite Console → Databases → Create Collection
2. Name: `subscriptions`
3. Add attributes as per table above
4. Create indexes on `userId` and `status`
5. Set permissions:
   - Read: Users (own documents)
   - Create: Users
   - Update: Users (own documents)
   - Delete: None

### 3. Create `payments` Table (Optional)

Follow same steps as subscriptions table.

---

## Environment Variables

Add to backend `.env`:

```env
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_SUBSCRIPTIONS_TABLE_ID=subscriptions
APPWRITE_PAYMENTS_TABLE_ID=payments
```

---

## Notes

- ✅ **`subscriptions` table is REQUIRED** for current implementation
- ⏸️ **`payments` table is OPTIONAL** - not used in current code
- 🔒 All datetime fields use ISO 8601 format
- 💡 `cancellationReason` helps track why users cancel (analytics)
