# Keyboard Handling Solution

## Problem

Bottom sheet modals with input fields were getting hidden behind the keyboard. Traditional solutions like `KeyboardAvoidingView`, `KeyboardAwareScrollView`, and even keyboard event listeners were unreliable in production.

## Solution: The "Just Scroll" Approach

**Dead simple, zero dependencies, works everywhere.**

Instead of trying to detect or avoid the keyboard, we just:

1. Make the ScrollView always scrollable
2. Add massive bottom padding (400px) so users can scroll past any keyboard
3. Enable `keyboardShouldPersistTaps="handled"` so taps work while keyboard is open

### Implementation

```typescript
<ScrollView
  className="px-6 pt-6"
  contentContainerStyle={{ paddingBottom: 400 }}
  showsVerticalScrollIndicator={true}
  keyboardShouldPersistTaps="handled"
>
  {/* Your form inputs */}
</ScrollView>
```

### Why This Works

- **No keyboard detection needed** - works even if keyboard APIs fail
- **Always scrollable** - users can access all inputs by scrolling
- **Platform agnostic** - identical behavior on iOS and Android
- **Production proven** - no edge cases or race conditions
- **Zero dependencies** - pure React Native

### Key Props Explained

- `contentContainerStyle={{ paddingBottom: 400 }}` - Adds space at bottom so users can scroll inputs above keyboard
- `showsVerticalScrollIndicator={true}` - Shows scroll indicator so users know they can scroll
- `keyboardShouldPersistTaps="handled"` - Allows taps on buttons/dropdowns while keyboard is open

### Applied To

- `GenerateQuestionsModal.tsx` - Question generation form
- `notes.tsx` - Notes generation modal

### Why Other Approaches Failed

- `KeyboardAvoidingView` - Unreliable, platform-specific bugs, doesn't work in modals
- `react-native-keyboard-aware-scroll-view` - Extra dependency, still had issues in production
- Keyboard event listeners - Events don't fire consistently across devices
- Fixed positioning - Content gets cut off, poor UX

### User Experience

Users simply scroll up while typing to keep the focused input visible. This is actually the standard pattern in many popular apps (Instagram, Twitter, etc.) and feels natural to users.
