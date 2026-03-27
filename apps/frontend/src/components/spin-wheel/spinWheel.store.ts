import { create } from "zustand";
import type { SpinWheelState } from "./spinWheel.types";

export const useSpinWheelStore = create<SpinWheelState>((set) => ({
  phase: "form",
  email: "",
  result: null,
  isOpen: false,
  rotation: 0,
  setPhase: (phase) => set({ phase }),
  setEmail: (email) => set({ email }),
  setResult: (result) => set({ result }),
  setOpen: (isOpen) => set({ isOpen }),
  setRotation: (rotation) => set({ rotation }),
  reset: () => set({ phase: "form", email: "", result: null, rotation: 0 }),
}));
