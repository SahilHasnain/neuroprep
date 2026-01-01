# Integrated Title Input - UX Improvement

## Problem

Previously, the upload flow required users to interact with **two separate modals**:

1. DocumentUploadModal - for selecting the file source
2. Title Input Modal - for entering the document title

This created a disjointed experience with:

- ❌ Modal stacking (one modal on top of another)
- ❌ Broken visual flow
- ❌ Extra steps and cognitive load
- ❌ Inconsistent navigation

## Solution

Integrated the title input directly into the DocumentUploadModal as a **single, unified flow** with clear steps.

## Implementation

### Modal Flow States

```typescript
type Step = "select" | "title";

// Step 1: Select file source (camera, gallery, PDF)
currentStep === "select";

// Step 2: Enter title and upload
currentStep === "title";
```

### Key Changes

#### 1. **Unified Modal Interface**

**Before**:

```typescript
interface DocumentUploadModalProps {
  onFileSelected: (file, options) => void;
}
```

**After**:

```typescript
interface DocumentUploadModalProps {
  onUpload: (file, title, options) => void;
}
```

#### 2. **Step-Based Navigation**

- Back button appears in title step
- Header title changes based on step
- Contextual subtitle for each step

#### 3. **Auto-Fill Title**

```typescript
const proceedWithFile = (file) => {
  // Auto-fill from filename (without extension)
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
  setDocumentTitle(nameWithoutExt);
  setCurrentStep("title");
};
```

#### 4. **Enhanced Title Input Screen**

- Selected file card at top (with checkmark)
- Title input with auto-focus
- PDF processing info (if applicable)
- Progress indicator showing completed steps
- Disabled upload button until title is entered

#### 5. **Visual Progress Indicators**

```tsx
// Step 1: Upload & Process (blue, numbered)
<View className="bg-blue-600">1</View>

// Step 2: Title Added (green, checkmark) ✓
<View className="bg-green-500">
  <CheckCircle2 />
</View>

// Step 3: Generate Content (gray, numbered)
<View className="bg-gray-700">3</View>
```

## User Experience Flow

### Before (2 Modals)

```
1. Open DocumentUploadModal
2. Select file source (camera/gallery/PDF)
3. Pick file
4. Modal closes
5. NEW MODAL opens for title
6. Enter title
7. Click upload
8. Modal closes
```

### After (1 Modal, 2 Steps)

```
1. Open DocumentUploadModal
2. Select file source (camera/gallery/PDF)
3. Pick file
4. → Transition to title step (same modal)
5. Title auto-filled, edit if needed
6. Click "Upload Now"
7. Modal closes
```

## Visual Improvements

### Title Input Step

```tsx
<ScrollView keyboardShouldPersistTaps="handled">
  {/* Selected File Card */}
  <View className="border-blue-600/50 shadow-blue-600/20">
    <FileText /> + Filename + <CheckCircle2 />
  </View>

  {/* Title Input */}
  <TextInput
    autoFocus
    value={documentTitle}
    placeholder="Enter document title"
  />

  {/* PDF Info (if PDF) */}
  {isPDF && <PDFProcessingInfo />}

  {/* Progress Steps */}
  <WhatHappensNext currentStep={2} />

  {/* Actions */}
  <Button onPress={handleBack}>Back</Button>
  <Button onPress={handleUpload} disabled={!documentTitle.trim()}>
    Upload Now
  </Button>
</ScrollView>
```

### Dynamic Header

```tsx
{
  currentStep === "select" && (
    <>
      <Text>Upload Document</Text>
      <Text>Choose a source for your document</Text>
    </>
  );
}

{
  currentStep === "title" && (
    <>
      <ArrowLeft onPress={handleBack} />
      <Text>Name Your Document</Text>
      <Text>Give it a memorable name</Text>
    </>
  );
}
```

### Smart Upload Button

```tsx
<Pressable
  className={
    documentTitle.trim()
      ? "bg-blue-600 shadow-blue-600/30"
      : "bg-gray-700 opacity-50"
  }
  disabled={!documentTitle.trim()}
>
  <Upload /> Upload Now
</Pressable>
```

## Benefits

### User Experience

- ✅ **Single modal flow** - no modal stacking
- ✅ **Clear progression** - visual steps show progress
- ✅ **Auto-filled title** - saves typing
- ✅ **Contextual guidance** - subtitle changes per step
- ✅ **Easy navigation** - back button to change file
- ✅ **Visual feedback** - disabled state when title empty

### Code Quality

- ✅ **Simpler state management** - one modal instead of two
- ✅ **Better separation of concerns** - modal handles entire flow
- ✅ **Cleaner parent component** - less state to manage
- ✅ **Easier to maintain** - single source of truth

### Performance

- ✅ **Fewer re-renders** - no modal unmounting/mounting
- ✅ **Smoother transitions** - step changes vs modal swaps
- ✅ **Better memory usage** - one modal instance

## Technical Details

### State Management

```typescript
// Modal internal state
const [currentStep, setCurrentStep] = useState<"select" | "title">("select");
const [pendingFile, setPendingFile] = useState(null);
const [documentTitle, setDocumentTitle] = useState("");

// Parent component simplified
const [uploadModalVisible, setUploadModalVisible] = useState(false);
// Removed: titleModalVisible, selectedFile, uploadOptions, documentTitle
```

### Keyboard Handling

```tsx
<ScrollView keyboardShouldPersistTaps="handled">
  <TextInput returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
</ScrollView>
```

### Error Handling

```typescript
const handleUpload = () => {
  if (!pendingFile || !documentTitle.trim()) {
    Alert.alert("Error", "Please enter a document title");
    return;
  }
  // Proceed with upload
};
```

## Comparison

| Aspect         | Before (2 Modals) | After (1 Modal) |
| -------------- | ----------------- | --------------- |
| **Modals**     | 2 separate        | 1 unified       |
| **Steps**      | Unclear           | Clear (1 → 2)   |
| **Navigation** | Confusing         | Intuitive       |
| **State**      | Complex           | Simple          |
| **Code**       | ~150 lines        | ~120 lines      |
| **UX**         | Disjointed        | Seamless        |

## Files Modified

1. `components/documents/DocumentUploadModal.tsx` - Added title step
2. `app/(tabs)/documents.tsx` - Simplified to use new interface

## Testing Checklist

- [ ] Select file from camera
- [ ] Select file from gallery
- [ ] Select PDF file
- [ ] Title auto-fills from filename
- [ ] Edit title
- [ ] Upload button disabled when title empty
- [ ] Upload button enabled when title entered
- [ ] Back button returns to file selection
- [ ] Close button works from both steps
- [ ] Keyboard dismisses properly
- [ ] Upload succeeds with title
- [ ] Error handling for empty title

## Future Enhancements

- [ ] Add character counter for title (e.g., "32/100")
- [ ] Add title suggestions based on content
- [ ] Add emoji picker for title
- [ ] Add tags/categories in this step
- [ ] Add folder selection
- [ ] Remember last used settings

## Conclusion

By integrating the title input into the upload modal, we've created a **smoother, more intuitive upload experience** that feels like a natural progression rather than disconnected steps. Users now have a clear sense of where they are in the process and can easily navigate back if needed.

The change reduces cognitive load, improves visual flow, and simplifies the codebase—a win for both users and developers.
