/**
 * [NEW] [image-utils](file:///Users/apple/letstry-turborepo/apps/admin/lib/utils/image-utils.ts)
 * Constructs a full CDN URL from an image key (filename), matching the frontend logic.
 */
export const getCdnUrl = (key: string | null | undefined): string => {
  if (!key) return "";

  // If it's already a full URL or a relative path from public folder, return it
  if (
    key.startsWith("http") ||
    key.startsWith("/") ||
    key.startsWith("data:") ||
    key.startsWith("blob:")
  ) {
    return key;
  }

  // Handle raw base64 strings (JPEG starts with /9j/, PNG with iVBOR)
  const trimmedKey = key.trim();
  if (trimmedKey.length > 500 && (trimmedKey.startsWith("/9j/") || trimmedKey.startsWith("iVBOR"))) {
    return `data:image/jpeg;base64,${trimmedKey.replace(/[\r\n]+/g, "")}`;
  }

  const cdnDomain =
    process.env.NEXT_PUBLIC_API_IMAGE_URL?.replace(/\/$/, "") || "";

  return `${cdnDomain}/${key}`;
};
