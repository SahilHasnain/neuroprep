# Tab Bar Modal Integration

## Overview

The tab bar automatically hides when any modal or bottom sheet is open in the app, providing a cleaner user experience.

## How It Works

### 1. Modal Store (`store/modalStore.ts`)

A global Zustand store tracks which modals are currently open:

- `openModals`: Set of modal IDs currently visible
- `registerModal(id)`: Registers a modal as open
- `unregisterModal(id)`: Unregisters a modal when closed
- `isAnyModalOpen()`: Returns true if any modal is open

### 2. Modal Visibility Hook (`hooks/useModalVisibility.ts`)

A simple hook that automatically registers/unregisters modals:

```typescript
useModalVisibility("modal-id", isVisible);
```

### 3. Tab Bar Layout

The tab bar layout subscribes to the modal store and hides when any modal is open:

```typescript
const isAnyModalOpen = useModalStore((state) => state.isAnyModalOpen());

tabBarStyle: {
  display: isAnyModalOpen ? "none" : "flex",
}
```

## Usage in Modal Components

Simply add the hook at the top of your modal component:

```typescript
export default function MyModal({ visible, onClose }: Props) {
  useModalVisibility("my-modal", visible);

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      {/* Modal content */}
    </Modal>
  );
}
```

## Updated Components

All modal components have been updated:

- ✅ AuthModal
- ✅ LimitReachedModal
- ✅ ComingSoonModal
- ✅ UpgradeModal
- ✅ DocumentUploadModal
- ✅ GenerateQuestionsModal
- ✅ AskDoubtModal
- ✅ GenerateFlashcardsModal

## Adding New Modals

When creating a new modal:

1. Import the hook: `import { useModalVisibility } from "@/hooks/useModalVisibility";`
2. Add the hook with a unique ID: `useModalVisibility("unique-modal-id", visible);`
3. That's it! The tab bar will automatically hide when your modal opens.

## Benefits

- Clean, distraction-free modal experience
- Automatic cleanup on unmount
- No manual tab bar management needed
- Works with any React Native Modal or bottom sheet
