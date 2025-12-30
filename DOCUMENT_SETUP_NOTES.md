# Document Hub Setup Notes

## Implementation Status

Tasks 2.4, 2.5, and 2.6 have been completed:

✅ **Task 2.4: Document Card Component**

- Created `components/documents/DocumentCard.tsx`
- Displays thumbnail, title, type icon, and relative date
- Supports dark mode and loading states

✅ **Task 2.5: Upload Modal Component**

- Created `components/documents/DocumentUploadModal.tsx`
- Three upload options: Camera, Gallery, PDF
- Handles permissions properly
- Uses `expo-image-picker` and `expo-document-picker`

✅ **Task 2.6: Upload Flow Implementation**

- Updated `app/(tabs)/documents.tsx` with full upload flow
- Shows loading indicators during upload and processing
- Displays success/error messages
- Auto-refreshes document list after upload

## Required Configuration

Before testing the document upload feature, you need to:

### 1. Deploy Backend Functions

The backend functions are already created in `neuroprep-backend/documents/`:

- `index.js` - Upload document endpoint
- `get-all.js` - List documents endpoint
- `get-detail.js` - Get document detail endpoint
- `delete.js` - Delete document endpoint

Deploy these functions to Appwrite and note their URLs.

### 2. Update Frontend Constants

Update `neuroprep-frontend/constants/index.ts` with the deployed function URLs:

```typescript
export const API_ENDPOINTS = {
  // ... other endpoints
  DOCUMENTS: "https://YOUR_FUNCTION_ID.fra.appwrite.run",
  DOCUMENTS_UPLOAD: "https://YOUR_UPLOAD_FUNCTION_ID.fra.appwrite.run",
};
```

### 3. Verify Backend Configuration

Ensure `neuroprep-backend/.env` has:

- `APPWRITE_DOCUMENTS_TABLE_ID=documents`
- `APPWRITE_STORAGE_BUCKET_ID=documents`

### 4. Test Permissions

Make sure the Appwrite storage bucket has proper permissions for:

- File uploads
- File reads
- File deletes

## Features Implemented

### DocumentCard Component

- Responsive grid layout (2 columns)
- Thumbnail display with fallback icon
- Document type indicator (PDF/Image)
- Relative date formatting (Today, Yesterday, 2d ago, etc.)
- Loading skeleton state
- Dark mode support
- Tap to view document

### DocumentUploadModal Component

- Bottom sheet modal design
- Camera option with permission handling
- Gallery option with permission handling
- PDF picker option
- User-friendly error messages
- Auto-dismiss after selection

### Upload Flow

- File selection from modal
- Title input dialog
- Upload progress indicators
- Success/error notifications
- Auto-refresh document list
- Proper error handling

## Testing Checklist

Once endpoints are configured, test:

- [ ] Camera upload (request permissions)
- [ ] Gallery upload (request permissions)
- [ ] PDF upload
- [ ] Title input and validation
- [ ] Upload progress indicators
- [ ] Success message display
- [ ] Document list refresh
- [ ] Error handling for failed uploads
- [ ] Dark mode appearance
- [ ] Document card tap navigation

## Dependencies Added

The following packages were installed:

- `expo-image-picker` - For camera and gallery access
- `expo-document-picker` - For PDF file selection

These are compatible with Expo SDK 54.

## Next Steps

After configuration:

1. Deploy backend functions to Appwrite
2. Update API endpoint URLs in constants
3. Test upload flow end-to-end
4. Proceed to Task 2.7 (Document Viewer Component)
