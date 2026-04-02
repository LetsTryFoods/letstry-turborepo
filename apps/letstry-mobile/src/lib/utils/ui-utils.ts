import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Converts width percentage to DP.
 * @param widthPercent The percentage of screen width (e.g. 10 or '10%').
 */
export const wp = (widthPercent: string | number) => {
  const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel(SCREEN_WIDTH * elemWidth / 100);
};

/**
 * Converts height percentage to DP.
 * @param heightPercent The percentage of screen height (e.g. 10 or '10%').
 */
export const hp = (heightPercent: string | number) => {
  const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel(SCREEN_HEIGHT * elemHeight / 100);
};

/**
 * Responsive Font Size (scales with screen height).
 * @param size The font size in DP.
 */
export const rf = (size: number) => {
  // Simple scaling based on standard screen height (812 is iPhone X)
  const scale = SCREEN_HEIGHT / 812;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * RFValue equivalent for more precise scaling choice.
 */
export const RFValue = (size: number) => rf(size);

/**
 * Constructs a full CDN URL from an image key (filename).
 */
export const getImageUrl = (key: string | null | undefined): string => {
  if (!key) return '';

  // If it's already a full URL or a base64 string, return it
  if (key.startsWith('http') || key.startsWith('data:')) {
    return key;
  }

  const cdnDomain = process.env.EXPO_PUBLIC_API_IMAGE_URL?.replace(/\/$/, '') || 'https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev';
  return `${cdnDomain}/${key}`;
};
