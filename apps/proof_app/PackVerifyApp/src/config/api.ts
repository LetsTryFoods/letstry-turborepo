// export const API_URL = "https://apiv3.letstryfoods.com/graphql";
export const API_URL = "http://192.168.1.40:5000/graphql";

export const CDN_URL = "https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev";

export const getCdnUrl = (key: string | null | undefined): string => {
    if (!key) return '';
    if (key.startsWith('http') || key.startsWith('/') || key.startsWith('data:')) {
        return key;
    }
    return `${CDN_URL}/${key}`;
};

