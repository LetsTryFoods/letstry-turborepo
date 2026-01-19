/**
 * Get initials from a full name
 * @param name - Full name of the person
 * @returns Uppercase initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format number as Indian Rupee currency
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Parse device info from a string (User-Agent) or an object
 * @param deviceInfo - Raw device info from backend
 * @returns Parsed platform name or "Unknown"
 */
export const parseDeviceInfo = (deviceInfo: any): string => {
  if (!deviceInfo) return "Unknown";

  if (typeof deviceInfo === "object" && deviceInfo.platform) {
    return deviceInfo.platform;
  }

  if (typeof deviceInfo === "string") {
    const ua = deviceInfo.toLowerCase();
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod"))
      return "iOS";
    if (ua.includes("android")) return "Android";
    if (ua.includes("macintosh") || ua.includes("mac os x")) return "macOS";
    if (ua.includes("windows")) return "Windows";
    if (ua.includes("linux")) return "Linux";
    return "Web Client";
  }

  return "Unknown";
};
