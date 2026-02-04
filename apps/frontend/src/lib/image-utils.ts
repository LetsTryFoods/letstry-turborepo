/**
 * Constructs a full CDN URL from an image key (filename).
 * If the input is already a full URL (starts with http) or a local path, it returns it as is.
 * Otherwise, it prepends the CDN domain from environment variables.
 */
export const getCdnUrl = (key: string | null | undefined): string => {
    if (!key) return '';

    // If it's already a full URL or a relative path from public folder, return it
    if (key.startsWith('http') || key.startsWith('/') || key.startsWith('data:')) {
        return key;
    }

    const cdnDomain = process.env.NEXT_PUBLIC_API_IMAGE_URL?.replace(/\/$/, '') || '';

    return `${cdnDomain}/${key}`;
};
