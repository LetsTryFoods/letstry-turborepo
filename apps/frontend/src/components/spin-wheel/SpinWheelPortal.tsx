"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SpinWheelModal } from "./SpinWheelModal";
import { useSpinWheelStore } from "./spinWheel.store";

export function SpinWheelPortal() {
  const { isOpen } = useSpinWheelStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(<SpinWheelModal />, document.body);
}
