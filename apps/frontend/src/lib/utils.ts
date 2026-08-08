import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Canonical spelling for each unit we display. Keys are lowercased input,
 * values are what the customer sees. Grams are always "g" — never "G", "gm"
 * or "gram" — while "mg" stays distinct from "g".
 */
const UNIT_ALIASES: Record<string, string> = {
  g: "g",
  gm: "g",
  gms: "g",
  gr: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kgs: "kg",
  kilo: "kg",
  kilos: "kg",
  kilogram: "kg",
  kilograms: "kg",
  mg: "mg",
  mgs: "mg",
  ml: "ml",
  mls: "ml",
  l: "l",
  ltr: "l",
  ltrs: "l",
  litre: "l",
  litres: "l",
  liter: "l",
  liters: "l",
};

/**
 * Normalises a pack size for display: one space between the number and its
 * unit, and the unit in canonical lowercase — "405G", "405gm" and "405 GM"
 * all render as "405 g". Text without a number+unit pair ("Standard",
 * "Pack of 6") is left alone, and the result is stable if re-applied.
 */
export function formatPackageSize(packageSize?: string | null) {
  return (
    packageSize?.replace(
      /(\d)\s*([a-zA-Z]+)\b/g,
      (_match, value: string, unit: string) =>
        `${value} ${UNIT_ALIASES[unit.toLowerCase()] ?? unit.toLowerCase()}`
    ) ?? ""
  );
}
