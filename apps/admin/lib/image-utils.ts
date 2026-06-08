export const getCdnUrl = (key: string | null | undefined): string => {
  if (!key) return "";

  if (
    key.startsWith("http") ||
    key.startsWith("/") ||
    key.startsWith("data:")
  ) {
    return key;
  }

  const cdnDomain =
    process.env.NEXT_PUBLIC_API_IMAGE_URL?.replace(/\/$/, "") ||
    "https://d2tmwt8yl5m7qh.cloudfront.net";

  return `${cdnDomain}/${key}`;
};

export const extractKeyFromUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (!url.startsWith("http")) return url;

  const parts = url.split("/");
  return parts[parts.length - 1];
};
