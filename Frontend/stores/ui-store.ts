import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  currentModal: string | null;
  toggleSidebar: () => void;
  openModal: (modalName: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  modalOpen: false,
  currentModal: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (modalName) => set({ modalOpen: true, currentModal: modalName }),
  closeModal: () => set({ modalOpen: false, currentModal: null }),
}));
