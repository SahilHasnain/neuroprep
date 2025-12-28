# Keyboard Handling Solution

## Problem

Bottom sheet modals with input fields were getting hidden behind the keyboard. Traditional solutions like `KeyboardAvoidingView` and `KeyboardAwareScrollView` were unreliable and inconsistent across iOS/Android.

## Solution

We implemented a **dynamic height adjustment** approach using React Native's Keyboard API:

### How It Works

1. **Listen to keyboard events** - Detect when keyboard shows/hides and capture its height
2. **Adjust modal height dynamically** - Reduce ScrollView's maxHeight when keyboard is visible
3. **Keep content scrollable** - Users can scroll to access all inputs even with keyboard open

### Implementation

```typescript
const [keyboardHeight, setKeyboardHeight] = useState(0);

useEffect(() => {
  const showSubscription = Keyboard.addListener(
    Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
    (e) => setKeyboardHeight(e.endCoordinates.height)
  );
  const hideSubscription = Keyboard.addListener(
    Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
    () => setKeyboardHeight(0)
  );

  return () => {
    showSubscription.remove();
    hideSubscription.remove();
  };
}, []);

// Dynamic height: 300px when keyboard is visible, 500px when hidden
const maxScrollHeight = keyboardHeight > 0 ? 300 : 500;
```

### Benefits

- ✅ Works consistently on iOS and Android
- ✅ No external dependencies needed
- ✅ Simple and maintainable
- ✅ Smooth user experience
- ✅ Content remains accessible via scrolling

### Applied To

- `GenerateQuestionsModal.tsx` - Question generation form
- `notes.tsx` - Notes generation modal

### Alternative Approaches Considered

- `KeyboardAvoidingView` - Unreliable, platform-specific issues
- `react-native-keyboard-aware-scroll-view` - Extra dependency, still had edge cases
- Fixed positioning - Poor UX, content gets cut off

### Future Improvements

If needed, we could:

- Make the height adjustment more granular based on actual keyboard height
- Add smooth animations during height transitions
- Auto-scroll to focused input field
