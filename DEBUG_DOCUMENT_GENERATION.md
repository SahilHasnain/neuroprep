# Debug Guide: Document Generation Flow

## Console Logs to Check

When you generate questions or notes from a document, you should see these logs in order:

### 1. Frontend Store (React Native Console)

```
🎯 [Store] Starting question generation for: <documentId>
📄 [Store] Document: {
  id: "...",
  title: "Biology Chapter 5",
  hasOcrText: true,
  ocrTextLength: 1234
}
```

**What to check:**

- ✅ `hasOcrText` should be `true`
- ✅ `ocrTextLength` should be > 0 (not 0)
- ❌ If `ocrTextLength` is 0, OCR extraction failed during upload

### 2. Frontend Service (React Native Console)

```
🔍 [generateQuestions] Starting generation
📄 Document ID: <id>
📝 Document Title: Biology Chapter 5
📋 Document Type: pdf
📊 OCR Text Length: 1234
📖 OCR Text Preview: Cell structure and function...

📦 Document Context: {
  documentId: "...",
  documentTitle: "Biology Chapter 5",
  ocrTextLength: 1234,
  ocrTextPreview: "Cell structure and function..."
}

🚀 Sending to API: {
  subject: "Document Content",
  topic: "Biology Chapter 5",
  difficulty: "easy",
  questionCount: "5",
  documentContext: { ocrText: "1234 characters" }
}
```

**What to check:**

- ✅ OCR Text Preview shows actual content (not "NO TEXT")
- ✅ ocrTextLength matches between logs
- ❌ If preview shows "NO TEXT", document has no extracted text

### 3. Backend Function (Appwrite Logs)

```
📄 Document Context Received:
  - Document ID: <id>
  - Document Title: Biology Chapter 5
  - Document Type: pdf
  - OCR Text Length: 1234 characters
  - OCR Text Preview: Cell structure and function...

📝 Prompt Length: 1500 characters
```

**What to check:**

- ✅ OCR Text Length should match frontend
- ✅ OCR Text Preview should show actual content
- ✅ Prompt Length should be > 500 (includes document content)
- ❌ If you see "⚠️ WARNING: No OCR text found", the context is empty

### 4. Backend Response (React Native Console)

```
✅ [Store] Generation result: {
  success: true,
  hasData: true,
  dataLength: 5
}
```

**What to check:**

- ✅ `success` should be `true`
- ✅ `hasData` should be `true`
- ✅ `dataLength` should match requested count
- ❌ If `success` is `false`, check backend logs for errors

## Common Issues & Solutions

### Issue 1: OCR Text Length is 0

**Symptoms:**

```
📊 OCR Text Length: 0
📖 OCR Text Preview: NO TEXT
```

**Causes:**

- OCR extraction failed during upload
- Document is an image with no text
- PDF is scanned without OCR layer

**Solution:**

1. Check upload logs for OCR errors
2. Try re-uploading the document
3. Ensure document has readable text

### Issue 2: Document Context Not Sent

**Symptoms:**

```
ℹ️ No document context - using standard prompt
```

**Causes:**

- `documentContext` is undefined in request
- Document object missing `ocrText` field

**Solution:**

1. Check if document was fetched properly
2. Verify `getDocumentById` returns `ocrText`
3. Check database has `ocrText` field populated

### Issue 3: AI Generates Generic Content

**Symptoms:**

- Questions/notes don't match document content
- Generic "importance of key concepts" responses

**Causes:**

- OCR text is empty or very short
- Prompt doesn't include document content

**Solution:**

1. Check OCR Text Length in logs (should be > 100)
2. Verify Prompt Length includes document content
3. Check backend logs for actual prompt sent to AI

## How to Debug

### Step 1: Check Upload

```javascript
// In documents/index.js upload function
log(`Text extracted: ${ocrText.length} characters`);
```

### Step 2: Check Document Fetch

```javascript
// In frontend console
console.log("Fetched document:", document);
console.log("Has OCR text:", !!document.ocrText);
```

### Step 3: Check Generation Request

Look for the 🚀 emoji logs showing what's being sent to API

### Step 4: Check Backend Receipt

Look for the 📄 emoji logs in Appwrite function logs

### Step 5: Check AI Prompt

Look for the 📝 emoji showing prompt length - should be substantial

## Expected Values

| Metric              | Expected    | Warning       | Error       |
| ------------------- | ----------- | ------------- | ----------- |
| OCR Text Length     | > 100 chars | 10-100 chars  | 0 chars     |
| Prompt Length       | > 500 chars | 200-500 chars | < 200 chars |
| Questions Generated | 5           | 1-4           | 0           |
| Generation Time     | 5-15 sec    | 15-30 sec     | > 30 sec    |

## Quick Test

To verify the flow is working:

1. Upload a document with clear text
2. Open browser/app console
3. Click "Generate Questions"
4. Look for these emojis in order:
   - 🎯 (Store start)
   - 🔍 (Service start)
   - 📄 (Document info)
   - 🚀 (API call)
   - ✅ (Success)

If you see all 5, the flow is working correctly!
