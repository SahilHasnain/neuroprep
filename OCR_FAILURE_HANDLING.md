# OCR Failure Handling Implementation

## Overview

Graceful handling of documents where text extraction (OCR) fails or produces insufficient content.

## Detection Logic

### Frontend Checks

```typescript
// In documents.service.ts
const hasNoText = !document.ocrText || document.ocrText.trim().length === 0;
const hasShortText = document.ocrText && document.ocrText.length < 50;

// Validation before API call
if (hasNoText) {
  return {
    success: false,
    message: "Unable to generate. The document text could not be extracted...",
  };
}

if (hasShortText) {
  return {
    success: false,
    message: "The document text is too short to generate meaningful content...",
  };
}
```

## User Feedback

### 1. Document Card Warnings

**Visual Indicators:**

- ⚠️ "No text extracted" badge (orange background)
- ⚠️ "Limited text" badge (orange background)

**When Shown:**

- No text: `ocrText` is empty or null
- Limited text: `ocrText.length < 50`

### 2. Document Viewer Warnings

**Banner Messages:**

**No Text:**

```
⚠️ Text Extraction Failed
Unable to extract text from this document. AI features like
question and note generation won't work. Try uploading a
clearer image or a text-based PDF.
```

**Limited Text:**

```
⚠️ Limited Text Content
Very little text was extracted from this document. AI-generated
content may be limited or generic.
```

**Button State:**

- Generation buttons are disabled when `!canGenerate`
- Buttons show grayed out appearance

### 3. Generation Attempt Feedback

**Error Messages:**

**No Text:**

```
Unable to generate questions. The document text could not be
extracted. Please try uploading a clearer image or a text-based PDF.
```

**Short Text:**

```
The document text is too short to generate meaningful questions.
Please upload a document with more content.
```

## Flow Diagram

```
Upload Document
    ↓
OCR Extraction
    ↓
    ├─ Success (text > 50 chars)
    │   ↓
    │   ✅ Normal flow
    │   ✅ Generation buttons enabled
    │   ✅ No warnings shown
    │
    ├─ Partial (text < 50 chars)
    │   ↓
    │   ⚠️ "Limited text" warning
    │   🚫 Generation buttons disabled
    │   💬 Helpful message shown
    │
    └─ Failure (no text)
        ↓
        ⚠️ "No text extracted" warning
        🚫 Generation buttons disabled
        💬 Helpful message shown
```

## Console Logging

### When OCR Fails

```
🔍 [generateQuestions] Starting generation
📄 Document ID: abc123
📝 Document Title: My Document
📋 Document Type: pdf
📊 OCR Text Length: 0
📖 OCR Text Preview: NO TEXT
❌ [generateQuestions] No OCR text available
```

### When Text is Too Short

```
📊 OCR Text Length: 25
📖 OCR Text Preview: Some short text here
⚠️ [generateQuestions] OCR text is very short
```

## Backend Validation

### Additional Check

```javascript
if (documentContext) {
  log("📄 Document Context Received:");
  log(
    `  - OCR Text Length: ${documentContext.ocrText?.length || 0} characters`
  );

  if (!documentContext.ocrText || documentContext.ocrText.length === 0) {
    log("⚠️ WARNING: No OCR text found in document context!");
  }
}
```

## User Actions

### What Users Can Do

1. **Re-upload with Better Quality**
   - Take a clearer photo
   - Ensure good lighting
   - Avoid blurry images

2. **Use Text-Based PDF**
   - Convert scanned PDF to text-based PDF
   - Use OCR software before uploading

3. **Manual Entry**
   - Use regular question/note generation (without document)
   - Manually enter subject and topic

## Technical Details

### Thresholds

- **No Text:** `length === 0` or `null/undefined`
- **Short Text:** `length < 50` characters
- **Sufficient Text:** `length >= 50` characters

### Error Codes

- Frontend validation: Returns early with error message
- Backend validation: Logs warning but continues
- API response: `success: false` with descriptive message

## Testing Scenarios

1. **Upload image with no text** → Should show "No text extracted"
2. **Upload very short text (< 50 chars)** → Should show "Limited text"
3. **Upload normal document** → Should work normally
4. **Try to generate from failed document** → Should show error message
5. **Check console logs** → Should see appropriate warnings

## Future Improvements

1. **Retry OCR:** Allow users to retry text extraction
2. **Manual Text Input:** Let users paste text manually
3. **OCR Quality Score:** Show confidence level of extraction
4. **Alternative Services:** Try multiple OCR providers
5. **Image Enhancement:** Auto-enhance images before OCR
