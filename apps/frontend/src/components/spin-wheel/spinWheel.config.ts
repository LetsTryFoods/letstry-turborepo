import type { SpinWheelSegment } from "./spinWheel.types";

export const SPIN_WHEEL_SEGMENTS: SpinWheelSegment[] = [
  { label: "₹100 OFF", color: "#e74c3c", textColor: "#ffffff", coupon: "LETRY100" },
  { label: "Better Luck\nNext Time!", color: "#8e44ad", textColor: "#ffffff", coupon: null },
  { label: "Free Shipping", color: "#f39c12", textColor: "#ffffff", coupon: "FREESHIP" },
  { label: "10% OFF", color: "#16a085", textColor: "#ffffff", coupon: "LETSTRY10" },
  { label: "₹200 OFF", color: "#e67e22", textColor: "#ffffff", coupon: "LETSTRY200" },
  { label: "Try Again", color: "#2980b9", textColor: "#ffffff", coupon: null },
  { label: "Free Snack", color: "#27ae60", textColor: "#ffffff", coupon: "FREESNACK" },
  { label: "5% OFF", color: "#16a085", textColor: "#ffffff", coupon: "LETSTRY5" },
];

export const SPIN_COOLDOWN_DAYS = 7;
export const SPIN_COOKIE_KEY = "spin_wheel_last";
