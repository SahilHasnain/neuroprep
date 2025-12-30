# Documents Components

This folder contains components for the Document Hub feature.

## Components

### DocumentCard

A card component that displays document information in a grid layout.

**Props:**

- `document: Document` - The document object to display
- `onPress: (document: Document) => void` - Callback when card is tapped
- `isLoading?: boolean` - Shows loading skeleton state

**Features:**

- Displays thumbnail or icon based on document type
- Shows document title and relative date
- Supports dark mode
- Loading skeleton state

### DocumentUploadModal

A bottom sheet modal for selecting document upload source.

**Props:**

- `visible: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `onFileSelected: (file) => void` - Callback when file is selected

**Features:**

- Three upload options: Camera, Gallery, PDF
- Handles permissions for camera and media library
- User-friendly error messages
- Dismisses automatically after file selection

## Usage

```tsx
import { DocumentCard, DocumentUploadModal } from "@/components/documents";

// In your component
<DocumentCard
  document={document}
  onPress={handleDocumentPress}
/>

<DocumentUploadModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onFileSelected={handleFileSelected}
/>
```

## Dependencies

- `expo-image-picker` - For camera and gallery access
- `expo-document-picker` - For PDF file selection
- `expo-image` - For optimized image rendering
