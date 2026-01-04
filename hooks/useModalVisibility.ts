import { useEffect } from "react";
import { useModalStore } from "@/store/modalStore";

/**
 * Hook to register modal visibility with the global modal store
 * This automatically hides the tab bar when the modal is open
 *
 * @param modalId - Unique identifier for the modal
 * @param isVisible - Whether the modal is currently visible
 *
 * @example
 * const [visible, setVisible] = useState(false);
 * useModalVisibility('auth-modal', visible);
 */
export function useModalVisibility(modalId: string, isVisible: boolean) {
  const { registerModal, unregisterModal } = useModalStore();

  useEffect(() => {
    if (isVisible) {
      registerModal(modalId);
    } else {
      unregisterModal(modalId);
    }

    // Cleanup on unmount
    return () => {
      unregisterModal(modalId);
    };
  }, [isVisible, modalId, registerModal, unregisterModal]);
}
