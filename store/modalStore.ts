import { create } from "zustand";

interface ModalStore {
  openModals: Set<string>;
  registerModal: (modalId: string) => void;
  unregisterModal: (modalId: string) => void;
  isAnyModalOpen: () => boolean;
}

export const useModalStore = create<ModalStore>((set, get) => ({
  openModals: new Set(),

  registerModal: (modalId: string) => {
    set((state) => {
      const newSet = new Set(state.openModals);
      newSet.add(modalId);
      return { openModals: newSet };
    });
  },

  unregisterModal: (modalId: string) => {
    set((state) => {
      const newSet = new Set(state.openModals);
      newSet.delete(modalId);
      return { openModals: newSet };
    });
  },

  isAnyModalOpen: () => {
    return get().openModals.size > 0;
  },
}));
