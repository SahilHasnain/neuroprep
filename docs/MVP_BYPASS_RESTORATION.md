# MVP Bypass Mode Restoration Guide

This document provides step-by-step instructions to restore full authentication and subscription functionality after the MVP launch bypass period.

## Overview

The MVP bypass mode was implemented to launch quickly without authentication and subscription features. All changes are marked with `MVP_BYPASS` comments for easy identification and restoration.

## Quick Restoration Steps

### 1. Disable MVP Bypass Mode

**File**: `neuroprep-frontend/config/featureFlags.ts`

```typescript
// Change this line:
MVP_BYPASS_MODE: true,

// To:
MVP_BYPASS_MODE: false,
```

This single change will automatically restore most functionality.

---

## Files Modified with MVP_BYPASS Markers

### Frontend Files

#### 1. **config/featureFlags.ts**

- **Changes**: Added MVP_BYPASS_MODE flag and MVP_LIMITS constants
- **Restoration**: Set `MVP_BYPASS_MODE: false`
- **Location**: Lines with `MVP_BYPASS` comments

#### 2. **app/\_layout.tsx**

- **Changes**: Added deep link redirect for subscription routes
- **Restoration**: Remove the useEffect that redirects subscription deep links (marked with MVP_BYPASS comments)
- **Location**: Import statements and useEffect hook

#### 3. **app/(tabs)/\_layout.tsx**

- **Changes**: Conditionally hide subscription tab
- **Restoration**: Remove conditional check or set flag to false
- **Location**: Subscription Tabs.Screen wrapped in conditional

#### 4. **app/(tabs)/index.tsx**

- **Changes**:
  - Hidden ProBanner component
  - Removed Pro Member status card
  - Removed usage progress bars
  - Simplified welcome message
- **Restoration**: Uncomment all sections marked with MVP_BYPASS comments
- **Location**: Multiple sections throughout the file

#### 5. **hooks/useDoubts.ts**

- **Changes**:
  - Removed auth user checks
  - Use ComingSoonModal instead of upgrade prompts
  - Removed free/pro badge logic
- **Restoration**: Restore original auth checks and upgrade prompts
- **Location**: Throughout the hook logic

#### 6. **hooks/useQuestions.ts** (if exists)

- **Changes**: Similar to useDoubts
- **Restoration**: Restore auth checks and upgrade prompts
- **Location**: Throughout the hook logic

#### 7. **hooks/useNotes.ts** (if exists)

- **Changes**: Similar to useDoubts
- **Restoration**: Restore auth checks and upgrade prompts
- **Location**: Throughout the hook logic

#### 8. **store/planStore.ts**

- **Changes**:
  - Force planType to "free" in bypass mode
  - Use hardcoded MVP limits
  - Skip backend subscription API calls
  - Disable subscription creation/payment
- **Restoration**: Remove all MVP_BYPASS conditional logic
- **Location**: Multiple functions with MVP_BYPASS checks

#### 9. **store/authStore.ts**

- **Changes**:
  - Disable checkSession in bypass mode
  - Make login/signup/logout no-op in bypass mode
  - Keep user always null
- **Restoration**: Remove all MVP_BYPASS conditional logic
- **Location**: Multiple functions with MVP_BYPASS checks

#### 10. **utils/guestUsageTracker.ts**

- **Changes**: Use MVP limits (20 for all features)
- **Restoration**: Restore original guest limits
- **Location**: getGuestLimits() function

#### 11. **app/(tabs)/ask-doubt.tsx**

- **Changes**: Use ComingSoonModal instead of upgrade prompts
- **Restoration**: Restore original upgrade prompt logic
- **Location**: Modal usage and limit handling

#### 12. **app/(tabs)/generate-questions.tsx**

- **Changes**: Use ComingSoonModal instead of upgrade prompts
- **Restoration**: Restore original upgrade prompt logic
- **Location**: Modal usage and limit handling

#### 13. **app/(tabs)/notes.tsx**

- **Changes**: Use ComingSoonModal instead of upgrade prompts
- **Restoration**: Restore original upgrade prompt logic
- **Location**: Modal usage and limit handling

### Backend Files

#### 14. **shared/planConfig.js**

- **Changes**:
  - Set free plan limits to 20 for all features
  - Enabled all difficulties and note lengths
- **Restoration**: Restore original free plan limits
- **Location**: FREE plan configuration object

---

## Detailed Restoration Process

### Phase 1: Configuration (5 minutes)

1. Open `neuroprep-frontend/config/featureFlags.ts`
2. Set `MVP_BYPASS_MODE: false`
3. Commit this change

### Phase 2: Backend Restoration (10 minutes)

1. Open `neuroprep-backend/shared/planConfig.js`
2. Find the FREE plan configuration
3. Restore original limits:
   ```javascript
   FREE: {
     dailyDoubts: 5,        // Was 20
     dailyQuestions: 5,     // Was 20
     dailyNotes: 5,         // Was 20
     maxQuestions: 10,      // Was 20
     allowedDifficulties: ['easy'],  // Was ['easy', 'medium', 'hard']
     allowedNoteLengths: ['brief'],  // Was ['brief', 'detailed', 'exam']
   }
   ```
4. Test backend API endpoints
5. Deploy backend changes

### Phase 3: Frontend Cleanup (15 minutes)

1. Search for all `MVP_BYPASS` comments in the frontend codebase
2. Review each marked section
3. Either:
   - Remove the conditional logic (if flag is false, code won't execute anyway)
   - Or uncomment hidden features
4. Optional: Remove ComingSoonModal component if no longer needed
5. Test all navigation flows

### Phase 4: Testing (30 minutes)

Use the testing checklist below to verify all functionality is restored.

---

## Testing Checklist

### Authentication Tests

- [ ] Login flow works correctly
- [ ] Signup flow works correctly
- [ ] Logout works correctly
- [ ] Session persistence works
- [ ] Auth state updates correctly across app

### Subscription Tests

- [ ] Subscription tab is visible in navigation
- [ ] Can navigate to subscription screen
- [ ] Deep links to subscription work
- [ ] Plan status displays correctly
- [ ] Free/Pro badges show correctly
- [ ] Upgrade prompts appear when limits reached

### Feature Limit Tests

- [ ] Free users see correct limits (5/day for each feature)
- [ ] Pro users see correct limits (unlimited or higher)
- [ ] Daily reset works correctly
- [ ] Limit enforcement works for doubts
- [ ] Limit enforcement works for questions
- [ ] Limit enforcement works for notes

### UI/UX Tests

- [ ] ProBanner displays correctly
- [ ] Pro Member status card shows for pro users
- [ ] Usage progress bars display correctly
- [ ] Welcome message includes user name
- [ ] All 5 tabs visible (including subscription)
- [ ] No "Coming Soon" modals appear

### Navigation Tests

- [ ] All tabs accessible
- [ ] Deep links work correctly
- [ ] No unexpected redirects
- [ ] Back navigation works
- [ ] Tab switching works smoothly

### Payment Tests (if applicable)

- [ ] Payment flow initiates correctly
- [ ] Razorpay integration works
- [ ] Subscription creation works
- [ ] Payment success/failure handled correctly

---

## Rollback Plan

If issues occur after restoration:

1. **Immediate Rollback**:
   - Set `MVP_BYPASS_MODE: true` in `config/featureFlags.ts`
   - Redeploy frontend
   - This will revert to MVP bypass mode

2. **Investigate Issues**:
   - Check error logs
   - Review specific failing functionality
   - Test in development environment

3. **Gradual Restoration**:
   - Instead of disabling bypass mode entirely, consider:
   - Restoring features one at a time
   - Testing each feature before moving to next
   - Using feature flags for individual features

---

## Common Issues and Solutions

### Issue: Users stuck in guest mode

**Solution**: Clear app storage/cache and restart app

### Issue: Subscription tab not appearing

**Solution**: Verify `isMVPBypassMode()` returns false, check tab layout conditional

### Issue: Limits not enforcing correctly

**Solution**: Verify backend planConfig.js was restored, check API responses

### Issue: Auth not working

**Solution**: Check authStore.ts has MVP_BYPASS conditionals removed, verify backend auth endpoints

### Issue: Payment flow broken

**Solution**: Verify Razorpay keys are configured, check planStore.ts payment methods restored

---

## Support and Maintenance

### Code Search Commands

Find all MVP_BYPASS markers:

```bash
# Frontend
grep -r "MVP_BYPASS" neuroprep-frontend/

# Backend
grep -r "MVP_BYPASS" neuroprep-backend/
```

### Key Files Quick Reference

**Frontend**:

- `config/featureFlags.ts` - Main bypass flag
- `store/authStore.ts` - Authentication logic
- `store/planStore.ts` - Subscription logic
- `app/(tabs)/_layout.tsx` - Tab visibility
- `app/_layout.tsx` - Deep link handling

**Backend**:

- `shared/planConfig.js` - Plan limits configuration

---

## Timeline Estimate

- **Quick Restoration**: 1 hour (just flip the flag and basic testing)
- **Full Restoration**: 2-3 hours (including cleanup and thorough testing)
- **Production Deployment**: Add 1-2 hours for deployment and monitoring

---

## Notes

- The MVP bypass mode was designed to be easily reversible
- Most functionality is controlled by the single `MVP_BYPASS_MODE` flag
- All changes are marked with comments for easy identification
- Backend and frontend changes are independent and can be restored separately
- Consider keeping the ComingSoonModal component for future use

---

## Version History

- **v1.0** - Initial MVP bypass implementation
- **v1.1** - Added deep link handling
- **v1.2** - This restoration guide created

---

## Contact

For questions or issues during restoration, contact the development team.
