import { useCallback } from "react";
import { SPIN_WHEEL_SEGMENTS } from "./spinWheel.config";
import { useSpinWheelStore } from "./spinWheel.store";

const SPIN_DURATION = 4000;
const EXTRA_ROTATIONS = 5;

export function useSpinWheel() {
  const { setPhase, setResult, setRotation, rotation } = useSpinWheelStore();

  const spin = useCallback(() => {
    const segmentAngle = 360 / SPIN_WHEEL_SEGMENTS.length;
    const randomIndex = Math.floor(Math.random() * SPIN_WHEEL_SEGMENTS.length);
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const newRotation = rotation + EXTRA_ROTATIONS * 360 + targetAngle;

    setRotation(newRotation);
    setPhase("spinning");

    setTimeout(() => {
      setResult(SPIN_WHEEL_SEGMENTS[randomIndex]);
      setPhase("result");
    }, SPIN_DURATION);
  }, [rotation, setRotation, setPhase, setResult]);

  return { spin, spinDuration: SPIN_DURATION };
}
