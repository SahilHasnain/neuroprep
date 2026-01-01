# Document Generation UX Implementation

## Overview

Streamlined UX for generating questions and notes from documents with reduced cognitive load.

## Key Improvements

### 1. **Upload Flow - Auto-Generation Options**

**Before:** Upload → View → Navigate to feature → Generate
**After:** Upload → Choose auto-generate → Done

- Checkboxes during upload for auto-generating questions/notes
- Default settings (5 easy questions, brief notes)
- Background generation with notifications

### 2. **Document Context Only**

**Before:** Required subject/topic selection even with document
**After:** AI infers everything from document content

```javascript
// Frontend sends only document context
{
  documentContext: {
    documentId: "...",
    documentTitle: "Biology Chapter 5",
    ocrText: "Cell structure and function..."
  },
  difficulty: "easy",
  questionCount: 5
}

// Backend uses ONLY document content
userPrompt = `Generate questions based on this document:
Document Title: ${documentContext.documentTitle}
Document Content: ${documentContext.ocrText}
Requirements: Infer subject from content...`
```

### 3. **Inline Status & Progress**

**Before:** Navigate away to check status
**After:** See everything in context

- Document cards show generation badges
- Real-time progress bars (10% → 100%)
- Preview of generated content
- "View All" button when ready

### 4. **Document Viewer Integration**

**Before:** Separate action sheet, forced navigation
**After:** Inline generation panel

- Bottom panel with "Generate Questions" and "Generate Notes" buttons
- Status cards show progress/preview inline
- Optional "View All" navigation
- Retry on error

## User Flows

### Flow 1: Upload with Auto-Generation

```
1. Tap "Upload Document"
2. Select source (Camera/Gallery/PDF)
3. See options screen:
   ☑️ Generate Questions (5 easy)
   ☑️ Generate Notes (brief)
4. Enter title → Upload
5. Document card shows progress badges
6. Notification when ready
7. Tap card → See preview → Optional "View All"
```

### Flow 2: Generate from Existing Document

```
1. Open document
2. Scroll to bottom panel
3. Tap "Generate Questions" or "Generate Notes"
4. See inline progress card
5. Preview appears when ready
6. Optional "View All Questions/Notes"
```

### Flow 3: View Generated Content

```
1. Document card shows "Ready" badges
2. Tap document
3. See preview in status cards
4. Tap "View All Questions" → Navigate to questions tab
5. Or tap "View All Notes" → Navigate to notes tab
```

## Technical Implementation

### State Management

```typescript
// Document Store
generationStates: {
  [documentId]: {
    questions: { status: "generating", progress: 45, data: [...] },
    notes: { status: "success", progress: 100, data: {...} }
  }
}
```

### Components

- `DocumentUploadModal` - Two-step with auto-gen options
- `DocumentCard` - Status badges + progress bars
- `GenerationStatusCard` - Inline progress/preview
- `DocumentViewer` - Bottom panel with generation

### API Changes

- Frontend: Sends generic subject "Document Content"
- Backend: Ignores subject/topic when documentContext present
- AI: Infers subject from document content

## Benefits

1. **Reduced Steps:** 6-7 steps → 2-3 steps
2. **No Context Switching:** Everything happens in place
3. **Automatic Processing:** Set and forget
4. **Clear Feedback:** Always know what's happening
5. **Smart Defaults:** Works great out of the box

## Future Enhancements

1. **Customizable Defaults:** Let users set preferred difficulty/length
2. **Batch Generation:** Generate for multiple documents at once
3. **Smart Scheduling:** Generate during idle time
4. **Quality Indicators:** Show confidence scores
5. **Incremental Updates:** Stream results as they generate
