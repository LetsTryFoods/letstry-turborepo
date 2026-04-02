export type SpinWheelSegment = {
  label: string;
  color: string;
  textColor: string;
  coupon: string | null;
};

export type SpinWheelPhase = "form" | "spinning" | "result";

export type SpinWheelState = {
  phase: SpinWheelPhase;
  email: string;
  result: SpinWheelSegment | null;
  isOpen: boolean;
  rotation: number;
  setPhase: (phase: SpinWheelPhase) => void;
  setEmail: (email: string) => void;
  setResult: (result: SpinWheelSegment | null) => void;
  setOpen: (open: boolean) => void;
  setRotation: (rotation: number) => void;
  reset: () => void;
};
