import { create } from "zustand";

type LoginModalStore = {
  isOpen: boolean;
  backendUrl: string;
  onSuccess?: () => void;
  openModal: (backendUrl: string, onSuccess?: () => void) => void;
  closeModal: () => void;
};

export const useLoginModalStore = create<LoginModalStore>((set) => ({
  isOpen: false,
  backendUrl: "",
  onSuccess: undefined,
  openModal: (backendUrl: string, onSuccess?: () => void) =>
    set({ isOpen: true, backendUrl, onSuccess }),
  closeModal: () => set({ isOpen: false, onSuccess: undefined }),
}));
