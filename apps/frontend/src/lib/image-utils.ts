/**
 * Constructs a full CDN URL from an image key (filename).
 * If the input is already a full URL (starts with http) or a local path, it returns it as is.
 * Otherwise, it prepends the CDN domain from environment variables.
 */
export const getCdnUrl = (key: unknown): string => {
    if (!key) return '';

    if (typeof key === 'object') {
        if (key && typeof (key as any).url === 'string') key = (key as any).url;
        else if (key && typeof (key as any).src === 'string') key = (key as any).src;
        else return '';
    }

    const strKey = String(key);

    // If it's already a full URL or a relative path from public folder, return it
    if (strKey.startsWith('http') || strKey.startsWith('/') || strKey.startsWith('data:')) {
        return strKey;
    }

    const cdnDomain = process.env.NEXT_PUBLIC_API_IMAGE_URL?.replace(/\/$/, '') || '';

    return `${cdnDomain}/${strKey}`;
};
