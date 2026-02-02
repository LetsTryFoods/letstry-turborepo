/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AddProductsToCategoryInput = {
  categoryId: Scalars['ID']['input'];
  productIds: Array<Scalars['ID']['input']>;
};

export type AddToCartInput = {
  attributes?: InputMaybe<Scalars['JSON']['input']>;
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type Address = {
  __typename?: 'Address';
  _id: Scalars['ID']['output'];
  addressCountry: Scalars['String']['output'];
  addressLocality: Scalars['String']['output'];
  addressRegion: Scalars['String']['output'];
  addressType: Scalars['String']['output'];
  buildingName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  floor?: Maybe<Scalars['String']['output']>;
  formattedAddress: Scalars['String']['output'];
  identityId: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  landmark?: Maybe<Scalars['String']['output']>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  placeId?: Maybe<Scalars['String']['output']>;
  postalCode: Scalars['String']['output'];
  recipientName: Scalars['String']['output'];
  recipientPhone: Scalars['String']['output'];
  streetArea?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AddressInput = {
  addressLine1: Scalars['String']['input'];
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  alternatePhone?: InputMaybe<Scalars['String']['input']>;
  city: Scalars['String']['input'];
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  pincode: Scalars['String']['input'];
  state: Scalars['String']['input'];
};

export type AdminOrdersResponse = {
  __typename?: 'AdminOrdersResponse';
  meta: PaginationMeta;
  orders: Array<OrderWithUserInfo>;
  summary: OrdersSummary;
};

export enum AuthMethod {
  Firebase = 'FIREBASE',
  Whatsapp = 'WHATSAPP'
}

export type Banner = {
  __typename?: 'Banner';
  _id: Scalars['ID']['output'];
  backgroundColor?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  ctaText: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  headline: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  mobileImageUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Float']['output'];
  startDate?: Maybe<Scalars['DateTime']['output']>;
  subheadline: Scalars['String']['output'];
  textColor?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
};

export type BatchItemResult = {
  __typename?: 'BatchItemResult';
  ean: Scalars['String']['output'];
  errorType?: Maybe<Scalars['String']['output']>;
  isValid: Scalars['Boolean']['output'];
  itemName?: Maybe<Scalars['String']['output']>;
};

export type BatchScanInput = {
  items: Array<BatchScanItem>;
  packingOrderId: Scalars['String']['input'];
};

export type BatchScanItem = {
  ean: Scalars['String']['input'];
};

export type BatchScanResult = {
  __typename?: 'BatchScanResult';
  failureCount: Scalars['Int']['output'];
  results: Array<BatchItemResult>;
  successCount: Scalars['Int']['output'];
  totalProcessed: Scalars['Int']['output'];
};

export type BoxDimensions = {
  __typename?: 'BoxDimensions';
  h: Scalars['Float']['output'];
  l: Scalars['Float']['output'];
  w: Scalars['Float']['output'];
};

export type BoxDimensionsInput = {
  h: Scalars['Float']['input'];
  l: Scalars['Float']['input'];
  w: Scalars['Float']['input'];
};

export type BoxInfo = {
  __typename?: 'BoxInfo';
  code: Scalars['String']['output'];
  dimensions: BoxDimensions;
};

export type BoxSize = {
  __typename?: 'BoxSize';
  code: Scalars['String']['output'];
  cost: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  internalDimensions: BoxDimensions;
  isActive: Scalars['Boolean']['output'];
  maxWeight: Scalars['Float']['output'];
  name: Scalars['String']['output'];
};

export type CancelOrderInput = {
  orderId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type CancelShipmentInput = {
  awbNumber: Scalars['String']['input'];
};

export type Cart = {
  __typename?: 'Cart';
  _id: Scalars['ID']['output'];
  couponCode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  identityId: Scalars['ID']['output'];
  items: Array<CartItem>;
  shippingAddressId?: Maybe<Scalars['String']['output']>;
  shippingMethodId?: Maybe<Scalars['String']['output']>;
  status: CartStatus;
  totalsSummary: CartTotals;
  updatedAt: Scalars['DateTime']['output'];
};

export type CartItem = {
  __typename?: 'CartItem';
  attributes?: Maybe<Scalars['JSON']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  mrp: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  productId: Scalars['ID']['output'];
  quantity: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
  totalPrice: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
  variantId?: Maybe<Scalars['ID']['output']>;
};

export type CartSnapshotAddressType = {
  __typename?: 'CartSnapshotAddressType';
  addressCountry: Scalars['String']['output'];
  addressLocality: Scalars['String']['output'];
  addressRegion: Scalars['String']['output'];
  buildingName: Scalars['String']['output'];
  floor?: Maybe<Scalars['String']['output']>;
  formattedAddress: Scalars['String']['output'];
  landmark?: Maybe<Scalars['String']['output']>;
  postalCode: Scalars['String']['output'];
  recipientName: Scalars['String']['output'];
  recipientPhone: Scalars['String']['output'];
  streetArea?: Maybe<Scalars['String']['output']>;
};

export type CartSnapshotItemType = {
  __typename?: 'CartSnapshotItemType';
  imageUrl?: Maybe<Scalars['String']['output']>;
  mrp: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
  sku: Scalars['String']['output'];
  totalPrice: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type CartSnapshotTotalsType = {
  __typename?: 'CartSnapshotTotalsType';
  discountAmount: Scalars['Float']['output'];
  estimatedTax: Scalars['Float']['output'];
  grandTotal: Scalars['Float']['output'];
  handlingCharge: Scalars['Float']['output'];
  shippingCost: Scalars['Float']['output'];
  subtotal: Scalars['Float']['output'];
};

export type CartSnapshotType = {
  __typename?: 'CartSnapshotType';
  items: Array<CartSnapshotItemType>;
  shippingAddress?: Maybe<CartSnapshotAddressType>;
  totals: CartSnapshotTotalsType;
};

export enum CartStatus {
  Active = 'ACTIVE',
  Expired = 'EXPIRED',
  Merged = 'MERGED',
  Ordered = 'ORDERED'
}

export type CartTotals = {
  __typename?: 'CartTotals';
  discountAmount: Scalars['Float']['output'];
  estimatedTax: Scalars['Float']['output'];
  grandTotal: Scalars['Float']['output'];
  handlingCharge: Scalars['Float']['output'];
  shippingCost: Scalars['Float']['output'];
  subtotal: Scalars['Float']['output'];
};

export type Category = {
  __typename?: 'Category';
  _id: Scalars['ID']['output'];
  children?: Maybe<Array<Category>>;
  codeValue?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  favourite?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  inCodeSet?: Maybe<Scalars['String']['output']>;
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  productCount: Scalars['Float']['output'];
  products: Array<Product>;
  seo?: Maybe<CategorySeo>;
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CategorySeo = {
  __typename?: 'CategorySeo';
  _id: Scalars['ID']['output'];
  canonicalUrl?: Maybe<Scalars['String']['output']>;
  categoryId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  metaDescription?: Maybe<Scalars['String']['output']>;
  metaKeywords?: Maybe<Array<Scalars['String']['output']>>;
  metaTitle?: Maybe<Scalars['String']['output']>;
  ogDescription?: Maybe<Scalars['String']['output']>;
  ogImage?: Maybe<Scalars['String']['output']>;
  ogTitle?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CategorySeoInput = {
  canonicalUrl?: InputMaybe<Scalars['String']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  metaTitle?: InputMaybe<Scalars['String']['input']>;
  ogDescription?: InputMaybe<Scalars['String']['input']>;
  ogImage?: InputMaybe<Scalars['String']['input']>;
  ogTitle?: InputMaybe<Scalars['String']['input']>;
};

export type Charges = {
  __typename?: 'Charges';
  _id: Scalars['String']['output'];
  active: Scalars['Boolean']['output'];
  deliveryDelhiBelowThreshold: Scalars['Float']['output'];
  deliveryRestBelowThreshold: Scalars['Float']['output'];
  freeDeliveryThreshold: Scalars['Float']['output'];
  gstPercentage: Scalars['Float']['output'];
  handlingCharge: Scalars['Float']['output'];
};

export type CleanupResult = {
  __typename?: 'CleanupResult';
  checked: Scalars['Int']['output'];
  removed: Scalars['Int']['output'];
};

export type Coupon = {
  __typename?: 'Coupon';
  _id: Scalars['ID']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  discountType: DiscountType;
  discountValue: Scalars['Float']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  hasInfiniteValidity: Scalars['Boolean']['output'];
  isActive: Scalars['Boolean']['output'];
  maxDiscountAmount?: Maybe<Scalars['Float']['output']>;
  minCartValue?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  platform: CouponPlatform;
  startDate: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usageCount: Scalars['Int']['output'];
  usageLimit?: Maybe<Scalars['Int']['output']>;
};

export enum CouponPlatform {
  Both = 'BOTH',
  Desktop = 'DESKTOP',
  Mobile = 'MOBILE'
}

export type CreateAddressInput = {
  addressCountry: Scalars['String']['input'];
  addressLocality: Scalars['String']['input'];
  addressRegion: Scalars['String']['input'];
  addressType: Scalars['String']['input'];
  buildingName: Scalars['String']['input'];
  floor?: InputMaybe<Scalars['String']['input']>;
  formattedAddress: Scalars['String']['input'];
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  landmark?: InputMaybe<Scalars['String']['input']>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  placeId?: InputMaybe<Scalars['String']['input']>;
  postalCode: Scalars['String']['input'];
  recipientName: Scalars['String']['input'];
  recipientPhone: Scalars['String']['input'];
  streetArea?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBannerInput = {
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  ctaText: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  headline: Scalars['String']['input'];
  imageUrl: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  mobileImageUrl: Scalars['String']['input'];
  name: Scalars['String']['input'];
  position: Scalars['Float']['input'];
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  subheadline: Scalars['String']['input'];
  textColor?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type CreateBoxSizeInput = {
  code: Scalars['String']['input'];
  cost: Scalars['Float']['input'];
  internalDimensions: DimensionsInput;
  maxWeight: Scalars['Float']['input'];
  name: Scalars['String']['input'];
};

export type CreateCategoryInput = {
  codeValue?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  favourite?: InputMaybe<Scalars['Boolean']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  inCodeSet?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  seo?: InputMaybe<SeoBaseInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type CreateChargesInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  deliveryDelhiBelowThreshold: Scalars['Float']['input'];
  deliveryRestBelowThreshold: Scalars['Float']['input'];
  freeDeliveryThreshold: Scalars['Float']['input'];
  gstPercentage: Scalars['Float']['input'];
  handlingCharge: Scalars['Float']['input'];
};

export type CreateCouponInput = {
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
  discountType: DiscountType;
  discountValue: Scalars['Float']['input'];
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  hasInfiniteValidity?: Scalars['Boolean']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxDiscountAmount?: InputMaybe<Scalars['Float']['input']>;
  minCartValue?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  platform?: CouponPlatform;
  startDate: Scalars['DateTime']['input'];
  usageLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateGuestInput = {
  deviceInfo?: InputMaybe<Scalars['JSON']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePackerInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type CreatePackerResponse = {
  __typename?: 'CreatePackerResponse';
  generatedPassword: Scalars['String']['output'];
  packer: Packer;
};

export type CreatePolicyInput = {
  content: Scalars['String']['input'];
  seo?: InputMaybe<SeoBaseInput>;
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type CreateProductInput = {
  allergens?: InputMaybe<Scalars['String']['input']>;
  brand: Scalars['String']['input'];
  categoryIds: Array<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  favourite?: InputMaybe<Scalars['Boolean']['input']>;
  gtin?: InputMaybe<Scalars['String']['input']>;
  ingredients: Scalars['String']['input'];
  isGlutenFree?: InputMaybe<Scalars['Boolean']['input']>;
  isVegetarian?: InputMaybe<Scalars['Boolean']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  mpn?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  rating?: InputMaybe<Scalars['Float']['input']>;
  ratingCount?: InputMaybe<Scalars['Int']['input']>;
  seo?: InputMaybe<ProductSeoInput>;
  shelfLife: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  variants: Array<CreateProductVariantInput>;
};

export type CreateProductVariantInput = {
  availabilityStatus?: Scalars['String']['input'];
  breadth: Scalars['Float']['input'];
  discountPercent: Scalars['Float']['input'];
  discountSource?: Scalars['String']['input'];
  height: Scalars['Float']['input'];
  images: Array<ProductImageInput>;
  isActive?: Scalars['Boolean']['input'];
  isDefault?: Scalars['Boolean']['input'];
  length: Scalars['Float']['input'];
  mrp: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  packageSize: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  sku: Scalars['String']['input'];
  stockQuantity?: Scalars['Int']['input'];
  thumbnailUrl: Scalars['String']['input'];
  weight: Scalars['Float']['input'];
  weightUnit?: Scalars['String']['input'];
};

export type CreateRedirectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fromPath: Scalars['String']['input'];
  isActive?: Scalars['Boolean']['input'];
  source?: Scalars['String']['input'];
  statusCode?: Scalars['Int']['input'];
  toPath: Scalars['String']['input'];
};

export type CreateShipmentInput = {
  codAmount?: InputMaybe<Scalars['Float']['input']>;
  codCollectionMode?: InputMaybe<Scalars['String']['input']>;
  commodityId: Scalars['String']['input'];
  declaredValue: Scalars['Float']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  destinationDetails: AddressInput;
  dimensions: DimensionInput;
  ewayBill?: InputMaybe<Scalars['String']['input']>;
  invoiceDate?: InputMaybe<Scalars['String']['input']>;
  invoiceNumber?: InputMaybe<Scalars['String']['input']>;
  loadType?: Scalars['String']['input'];
  numPieces?: Scalars['Int']['input'];
  orderId?: InputMaybe<Scalars['String']['input']>;
  originDetails: AddressInput;
  piecesDetail?: InputMaybe<Array<PieceDetailInput>>;
  serviceType: Scalars['String']['input'];
  weight: Scalars['Float']['input'];
};

export type CreateShipmentResponse = {
  __typename?: 'CreateShipmentResponse';
  awbNumber: Scalars['String']['output'];
  labelUrl?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  shipment: ShipmentResponse;
  success: Scalars['Boolean']['output'];
};

export type CreateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firebaseUid: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastIp?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  marketingSmsOptIn?: InputMaybe<Scalars['Boolean']['input']>;
  phoneNumber: Scalars['String']['input'];
  signupSource?: InputMaybe<Scalars['JSON']['input']>;
};

export type CustomerDetails = {
  __typename?: 'CustomerDetails';
  _id: Scalars['ID']['output'];
  activeCart?: Maybe<Scalars['JSON']['output']>;
  addresses: Array<Address>;
  createdAt: Scalars['DateTime']['output'];
  currentSessionId?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  deviceInfo?: Maybe<Scalars['JSON']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firebaseUid?: Maybe<Scalars['String']['output']>;
  firstAuthMethod?: Maybe<AuthMethod>;
  firstName?: Maybe<Scalars['String']['output']>;
  identityId: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  isEmailVerified: Scalars['Boolean']['output'];
  isGuest: Scalars['Boolean']['output'];
  isPhoneVerified: Scalars['Boolean']['output'];
  lastActiveAt?: Maybe<Scalars['DateTime']['output']>;
  lastAuthMethod?: Maybe<AuthMethod>;
  lastIp?: Maybe<Scalars['String']['output']>;
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  lifetimeValue: Scalars['Float']['output'];
  marketingSmsOptIn?: Maybe<Scalars['Boolean']['output']>;
  mergedGuestIds: Array<Scalars['String']['output']>;
  orders: Scalars['JSON']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  registeredAt?: Maybe<Scalars['DateTime']['output']>;
  role: Scalars['String']['output'];
  sessionIds: Array<Scalars['String']['output']>;
  signupSource?: Maybe<Scalars['JSON']['output']>;
  status: IdentityStatus;
  totalOrders: Scalars['Int']['output'];
  totalSpent: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum CustomerPlatform {
  Android = 'ANDROID',
  Desktop = 'DESKTOP',
  Ios = 'IOS',
  Macos = 'MACOS',
  Web = 'WEB'
}

export enum CustomerSortField {
  CreatedAt = 'CREATED_AT',
  LastActive = 'LAST_ACTIVE',
  TotalOrders = 'TOTAL_ORDERS',
  TotalSpent = 'TOTAL_SPENT'
}

export type CustomerSummary = {
  __typename?: 'CustomerSummary';
  newThisMonth: Scalars['Int']['output'];
  platformStats: PlatformStats;
  statusStats: StatusStats;
  totalCustomers: Scalars['Int']['output'];
  totalGuests: Scalars['Int']['output'];
  totalRegistered: Scalars['Int']['output'];
  totalRevenue: Scalars['Int']['output'];
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  activeBanners: Scalars['Float']['output'];
  archivedProducts: Scalars['Float']['output'];
  inStockProducts: Scalars['Float']['output'];
  outOfStockProducts: Scalars['Float']['output'];
  totalAdmins: Scalars['Float']['output'];
  totalCategories: Scalars['Float']['output'];
  totalProducts: Scalars['Float']['output'];
  totalUsers: Scalars['Float']['output'];
};

export type DimensionInput = {
  height: Scalars['Float']['input'];
  length: Scalars['Float']['input'];
  width: Scalars['Float']['input'];
};

export type DimensionsInput = {
  h: Scalars['Float']['input'];
  l: Scalars['Float']['input'];
  w: Scalars['Float']['input'];
};

export enum DiscountType {
  Fixed = 'FIXED',
  Percentage = 'PERCENTAGE'
}

export type EnrichedCustomer = {
  __typename?: 'EnrichedCustomer';
  _id: Scalars['ID']['output'];
  activeCartItemsCount?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentSessionId?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  deviceInfo?: Maybe<Scalars['JSON']['output']>;
  displayPhone?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firebaseUid?: Maybe<Scalars['String']['output']>;
  firstAuthMethod?: Maybe<AuthMethod>;
  firstName?: Maybe<Scalars['String']['output']>;
  identityId: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  isEmailVerified: Scalars['Boolean']['output'];
  isGuest: Scalars['Boolean']['output'];
  isPhoneVerified: Scalars['Boolean']['output'];
  lastActiveAt?: Maybe<Scalars['DateTime']['output']>;
  lastAuthMethod?: Maybe<AuthMethod>;
  lastIp?: Maybe<Scalars['String']['output']>;
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  lifetimeValue: Scalars['Float']['output'];
  marketingSmsOptIn?: Maybe<Scalars['Boolean']['output']>;
  mergedGuestIds: Array<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  registeredAt?: Maybe<Scalars['DateTime']['output']>;
  role: Scalars['String']['output'];
  sessionIds: Array<Scalars['String']['output']>;
  signupSource?: Maybe<Scalars['JSON']['output']>;
  status: IdentityStatus;
  totalOrders: Scalars['Int']['output'];
  totalSpent: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum ErrorSeverity {
  Critical = 'CRITICAL',
  Major = 'MAJOR',
  Minor = 'MINOR'
}

export type ErrorStat = {
  __typename?: 'ErrorStat';
  count: Scalars['Int']['output'];
  errorType: Scalars['String']['output'];
};

export type FlagErrorInput = {
  ean?: InputMaybe<Scalars['String']['input']>;
  errorType: Scalars['String']['input'];
  notes: Scalars['String']['input'];
  packingOrderId: Scalars['String']['input'];
  severity: ErrorSeverity;
  source: Scalars['String']['input'];
};

export type GeocodeAddressInput = {
  address: Scalars['String']['input'];
};

export type GetAllOrdersInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<OrderStatus>;
  userSearch?: InputMaybe<Scalars['String']['input']>;
};

export type GetCustomersInput = {
  endDate?: InputMaybe<Scalars['JSON']['input']>;
  limit?: Scalars['Int']['input'];
  maxSpent?: InputMaybe<Scalars['Float']['input']>;
  minSpent?: InputMaybe<Scalars['Float']['input']>;
  page?: Scalars['Int']['input'];
  platform?: InputMaybe<CustomerPlatform>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<CustomerSortField>;
  sortOrder?: InputMaybe<SortOrder>;
  startDate?: InputMaybe<Scalars['JSON']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type GetMyOrdersInput = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  page?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<OrderStatus>;
};

export type GetPaymentsListInput = {
  filters?: InputMaybe<PaymentFiltersInput>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type GoogleMapsAddressOutput = {
  __typename?: 'GoogleMapsAddressOutput';
  country?: Maybe<Scalars['String']['output']>;
  extendedAddress?: Maybe<Scalars['String']['output']>;
  formattedAddress: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  locality?: Maybe<Scalars['String']['output']>;
  longitude: Scalars['Float']['output'];
  postalCode?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  streetAddress?: Maybe<Scalars['String']['output']>;
};

export type Guest = {
  __typename?: 'Guest';
  _id: Scalars['ID']['output'];
  convertedToUserId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deviceInfo?: Maybe<Scalars['JSON']['output']>;
  guestId: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  lastActiveAt: Scalars['DateTime']['output'];
  sessionId: Scalars['String']['output'];
};

export enum IdentityStatus {
  Active = 'ACTIVE',
  Guest = 'GUEST',
  Merged = 'MERGED',
  Registered = 'REGISTERED',
  Suspended = 'SUSPENDED',
  Verified = 'VERIFIED'
}

export type InitiateAdminRefundInput = {
  paymentOrderId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  refundAmount: Scalars['String']['input'];
};

export type InitiatePaymentInput = {
  cartId: Scalars['String']['input'];
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
};

export type InitiatePaymentResponse = {
  __typename?: 'InitiatePaymentResponse';
  paymentOrderId: Scalars['String']['output'];
  redirectUrl: Scalars['String']['output'];
};

export type ItemDimensions = {
  __typename?: 'ItemDimensions';
  height: Scalars['Float']['output'];
  length: Scalars['Float']['output'];
  unit: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
  width: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addProductVariant: Product;
  addProductsToCategory: Scalars['Boolean']['output'];
  addToCart: Cart;
  adminLogin: Scalars['String']['output'];
  adminLogout: Scalars['String']['output'];
  applyCoupon: Cart;
  archiveCategory: Category;
  archiveProduct: Product;
  batchScanItems: BatchScanResult;
  cancelOrder: OrderType;
  cancelShipment: ShipmentResponse;
  cleanupOrphanedJobs: CleanupResult;
  clearCart: Cart;
  completePacking: PackingOrder;
  createAddress: Address;
  createAdmin: Scalars['String']['output'];
  createBanner: Banner;
  createBoxSize: BoxSize;
  createCategory: Category;
  createCoupon: Coupon;
  createGuest: Guest;
  createOrUpdateCharges: Charges;
  createPacker: CreatePackerResponse;
  createPolicy: Policy;
  createProduct: Product;
  createRedirect: RedirectType;
  createShipment: CreateShipmentResponse;
  deleteAddress: Address;
  deleteBanner: Banner;
  deleteBoxSize: Scalars['Boolean']['output'];
  deleteCategorySeo: Scalars['Boolean']['output'];
  deleteCoupon: Coupon;
  deletePacker: Scalars['Boolean']['output'];
  deletePolicy: Policy;
  deletePolicySeo: Scalars['Boolean']['output'];
  deleteProduct: Product;
  deleteRedirect: Scalars['Boolean']['output'];
  flagPackingError: ScanLog;
  initiateAdminRefund: RefundInitiateResponse;
  initiatePayment: InitiatePaymentResponse;
  logout: Scalars['String']['output'];
  packerLogin: PackerLoginResponse;
  processRefund: RefundResponse;
  removeCoupon: Cart;
  removeFromCart: Cart;
  removeProductVariant: Product;
  removeProductsFromCategory: Scalars['Boolean']['output'];
  scanItem: ScanLog;
  sendOtp: Scalars['String']['output'];
  setDefaultProductVariant: Product;
  setShippingAddress: Cart;
  startPacking: PackingOrder;
  subscribeNewsletter: SubscribeNewsletterResponse;
  unarchiveCategory: Category;
  unarchiveProduct: Product;
  unsubscribeNewsletter: SubscribeNewsletterResponse;
  updateAddress: Address;
  updateBanner: Banner;
  updateBoxSize: BoxSize;
  updateCartItem: Cart;
  updateCategory: Category;
  updateCategorySeo: CategorySeo;
  updateGuest: Guest;
  updateOrderStatus: OrderType;
  updatePacker: Packer;
  updatePolicy: Policy;
  updatePolicySeo: PolicySeo;
  updateProduct: Product;
  updateProductStock: Product;
  updateProductVariant: Product;
  updateProductVariantStock: Product;
  updateRedirect: RedirectType;
  updateUser: User;
  updateUserActivity: Scalars['Boolean']['output'];
  uploadEvidence: PackingOrder;
  verifyOtpAndLogin: Scalars['String']['output'];
  verifyWhatsAppOtp: Scalars['String']['output'];
};


export type MutationAddProductVariantArgs = {
  input: CreateProductVariantInput;
  productId: Scalars['ID']['input'];
};


export type MutationAddProductsToCategoryArgs = {
  input: AddProductsToCategoryInput;
};


export type MutationAddToCartArgs = {
  input: AddToCartInput;
};


export type MutationAdminLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationApplyCouponArgs = {
  code: Scalars['String']['input'];
};


export type MutationArchiveCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationBatchScanItemsArgs = {
  input: BatchScanInput;
};


export type MutationCancelOrderArgs = {
  input: CancelOrderInput;
};


export type MutationCancelShipmentArgs = {
  input: CancelShipmentInput;
};


export type MutationCompletePackingArgs = {
  packingOrderId: Scalars['String']['input'];
};


export type MutationCreateAddressArgs = {
  input: CreateAddressInput;
};


export type MutationCreateAdminArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationCreateBannerArgs = {
  input: CreateBannerInput;
};


export type MutationCreateBoxSizeArgs = {
  input: CreateBoxSizeInput;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateCouponArgs = {
  input: CreateCouponInput;
};


export type MutationCreateGuestArgs = {
  input: CreateGuestInput;
};


export type MutationCreateOrUpdateChargesArgs = {
  input: CreateChargesInput;
};


export type MutationCreatePackerArgs = {
  input: CreatePackerInput;
};


export type MutationCreatePolicyArgs = {
  input: CreatePolicyInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateRedirectArgs = {
  input: CreateRedirectInput;
};


export type MutationCreateShipmentArgs = {
  input: CreateShipmentInput;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBannerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBoxSizeArgs = {
  boxId: Scalars['String']['input'];
};


export type MutationDeleteCategorySeoArgs = {
  categoryId: Scalars['ID']['input'];
};


export type MutationDeleteCouponArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePackerArgs = {
  packerId: Scalars['String']['input'];
};


export type MutationDeletePolicyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePolicySeoArgs = {
  policyId: Scalars['ID']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRedirectArgs = {
  id: Scalars['String']['input'];
};


export type MutationFlagPackingErrorArgs = {
  input: FlagErrorInput;
};


export type MutationInitiateAdminRefundArgs = {
  input: InitiateAdminRefundInput;
};


export type MutationInitiatePaymentArgs = {
  input: InitiatePaymentInput;
};


export type MutationPackerLoginArgs = {
  input: PackerLoginInput;
};


export type MutationProcessRefundArgs = {
  input: ProcessRefundInput;
};


export type MutationRemoveFromCartArgs = {
  productId: Scalars['ID']['input'];
};


export type MutationRemoveProductVariantArgs = {
  productId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationRemoveProductsFromCategoryArgs = {
  input: RemoveProductsFromCategoryInput;
};


export type MutationScanItemArgs = {
  input: ScanItemInput;
};


export type MutationSendOtpArgs = {
  phoneNumber: Scalars['String']['input'];
};


export type MutationSetDefaultProductVariantArgs = {
  productId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationSetShippingAddressArgs = {
  input: SetShippingAddressInput;
};


export type MutationStartPackingArgs = {
  packingOrderId: Scalars['String']['input'];
};


export type MutationSubscribeNewsletterArgs = {
  input: SubscribeNewsletterInput;
};


export type MutationUnarchiveCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnarchiveProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnsubscribeNewsletterArgs = {
  email: Scalars['String']['input'];
};


export type MutationUpdateAddressArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAddressInput;
};


export type MutationUpdateBannerArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBannerInput;
};


export type MutationUpdateBoxSizeArgs = {
  boxId: Scalars['String']['input'];
  input: UpdateBoxSizeInput;
};


export type MutationUpdateCartItemArgs = {
  input: UpdateCartItemInput;
};


export type MutationUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
};


export type MutationUpdateCategorySeoArgs = {
  categoryId: Scalars['ID']['input'];
  input: CategorySeoInput;
};


export type MutationUpdateGuestArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGuestInput;
};


export type MutationUpdateOrderStatusArgs = {
  input: UpdateOrderStatusInput;
};


export type MutationUpdatePackerArgs = {
  input: UpdatePackerInput;
  packerId: Scalars['String']['input'];
};


export type MutationUpdatePolicyArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePolicyInput;
};


export type MutationUpdatePolicySeoArgs = {
  input: PolicySeoInput;
  policyId: Scalars['ID']['input'];
};


export type MutationUpdateProductArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProductInput;
};


export type MutationUpdateProductStockArgs = {
  id: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};


export type MutationUpdateProductVariantArgs = {
  input: UpdateProductVariantInput;
  productId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationUpdateProductVariantStockArgs = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationUpdateRedirectArgs = {
  id: Scalars['String']['input'];
  input: UpdateRedirectInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUploadEvidenceArgs = {
  input: UploadEvidenceInput;
};


export type MutationVerifyOtpAndLoginArgs = {
  idToken: Scalars['String']['input'];
  input?: InputMaybe<CreateUserInput>;
};


export type MutationVerifyWhatsAppOtpArgs = {
  input?: InputMaybe<CreateUserInput>;
  otp: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type NewsletterSubscription = {
  __typename?: 'NewsletterSubscription';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  source?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type OrderCustomerType = {
  __typename?: 'OrderCustomerType';
  _id: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type OrderItemType = {
  __typename?: 'OrderItemType';
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Float']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  totalPrice?: Maybe<Scalars['String']['output']>;
  variant?: Maybe<Scalars['String']['output']>;
  variantId?: Maybe<Scalars['String']['output']>;
};

export type OrderPaymentType = {
  __typename?: 'OrderPaymentType';
  _id: Scalars['String']['output'];
  amount: Scalars['String']['output'];
  method?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  status: PaymentStatus;
  transactionId?: Maybe<Scalars['String']['output']>;
};

export type OrderShippingAddressType = {
  __typename?: 'OrderShippingAddressType';
  addressLine1: Scalars['String']['output'];
  addressLine2?: Maybe<Scalars['String']['output']>;
  addressType?: Maybe<Scalars['String']['output']>;
  city: Scalars['String']['output'];
  floor?: Maybe<Scalars['String']['output']>;
  formattedAddress?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  landmark?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  phone: Scalars['String']['output'];
  pincode: Scalars['String']['output'];
  state: Scalars['String']['output'];
};

export enum OrderStatus {
  Confirmed = 'CONFIRMED',
  Delivered = 'DELIVERED',
  InTransit = 'IN_TRANSIT',
  Packed = 'PACKED',
  Shipped = 'SHIPPED'
}

export type OrderStatusCount = {
  __typename?: 'OrderStatusCount';
  confirmed: Scalars['Int']['output'];
  delivered: Scalars['Int']['output'];
  inTransit: Scalars['Int']['output'];
  packed: Scalars['Int']['output'];
  shipped: Scalars['Int']['output'];
};

export type OrderType = {
  __typename?: 'OrderType';
  _id: Scalars['String']['output'];
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  cartId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customer?: Maybe<OrderCustomerType>;
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  deliveryCharge: Scalars['String']['output'];
  discount: Scalars['String']['output'];
  identityId: Scalars['String']['output'];
  items: Array<OrderItemType>;
  orderId: Scalars['String']['output'];
  orderStatus: OrderStatus;
  payment?: Maybe<OrderPaymentType>;
  paymentOrderId: Scalars['String']['output'];
  shippingAddress?: Maybe<OrderShippingAddressType>;
  shippingAddressId?: Maybe<Scalars['String']['output']>;
  subtotal: Scalars['String']['output'];
  totalAmount: Scalars['String']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type OrderUserInfo = {
  __typename?: 'OrderUserInfo';
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  identityId: Scalars['String']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type OrderWithUserInfo = {
  __typename?: 'OrderWithUserInfo';
  _id: Scalars['String']['output'];
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  cartId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customer?: Maybe<OrderCustomerType>;
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  deliveryCharge: Scalars['String']['output'];
  discount: Scalars['String']['output'];
  identityId: Scalars['String']['output'];
  items: Array<OrderItemType>;
  orderId: Scalars['String']['output'];
  orderStatus: OrderStatus;
  payment?: Maybe<OrderPaymentType>;
  paymentOrderId: Scalars['String']['output'];
  shippingAddress?: Maybe<OrderShippingAddressType>;
  shippingAddressId?: Maybe<Scalars['String']['output']>;
  subtotal: Scalars['String']['output'];
  totalAmount: Scalars['String']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userInfo?: Maybe<OrderUserInfo>;
};

export type OrdersSummary = {
  __typename?: 'OrdersSummary';
  statusCounts: OrderStatusCount;
  totalOrders: Scalars['Int']['output'];
  totalRevenue: Scalars['String']['output'];
};

export type Packer = {
  __typename?: 'Packer';
  accuracyRate: Scalars['Float']['output'];
  assignedOrders: Scalars['Int']['output'];
  averagePackTime: Scalars['Float']['output'];
  completedOrders: Scalars['Int']['output'];
  email?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  inProgressOrders: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  lastActiveAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  totalOrdersPacked: Scalars['Int']['output'];
};

export type PackerLoginInput = {
  employeeId: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type PackerLoginResponse = {
  __typename?: 'PackerLoginResponse';
  accessToken: Scalars['String']['output'];
  packer: Packer;
};

export type PackerStats = {
  __typename?: 'PackerStats';
  accuracyRate: Scalars['Float']['output'];
  averagePackTime: Scalars['Float']['output'];
  errorsByType: Array<ErrorStat>;
  ordersPackedToday: Scalars['Int']['output'];
  packerId: Scalars['ID']['output'];
  totalOrders: Scalars['Int']['output'];
};

export type PackingEvidence = {
  __typename?: 'PackingEvidence';
  actualBox?: Maybe<BoxInfo>;
  boxMismatch: Scalars['Boolean']['output'];
  detectedBoxDimensions?: Maybe<BoxDimensions>;
  dimensionConfidence?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  packerId: Scalars['String']['output'];
  packingOrderId: Scalars['String']['output'];
  postPackImages: Array<Scalars['String']['output']>;
  prePackImages: Array<Scalars['String']['output']>;
  recommendedBox?: Maybe<BoxInfo>;
  uploadedAt: Scalars['DateTime']['output'];
};

export type PackingItem = {
  __typename?: 'PackingItem';
  dimensions: ItemDimensions;
  ean: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isFragile: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
};

export type PackingOrder = {
  __typename?: 'PackingOrder';
  assignedAt?: Maybe<Scalars['DateTime']['output']>;
  assignedTo?: Maybe<Scalars['String']['output']>;
  estimatedPackTime?: Maybe<Scalars['Float']['output']>;
  hasErrors: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isExpress: Scalars['Boolean']['output'];
  items: Array<PackingItem>;
  orderId: Scalars['String']['output'];
  orderNumber: Scalars['String']['output'];
  packerName?: Maybe<Scalars['String']['output']>;
  packingCompletedAt?: Maybe<Scalars['DateTime']['output']>;
  packingStartedAt?: Maybe<Scalars['DateTime']['output']>;
  priority: Scalars['Float']['output'];
  specialInstructions?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type PaginatedCategories = {
  __typename?: 'PaginatedCategories';
  items: Array<Category>;
  meta: PaginationMeta;
};

export type PaginatedCustomersResponse = {
  __typename?: 'PaginatedCustomersResponse';
  customers: Array<EnrichedCustomer>;
  meta: PaginationMeta;
  summary: CustomerSummary;
};

export type PaginatedOrdersResponse = {
  __typename?: 'PaginatedOrdersResponse';
  meta: PaginationMeta;
  orders: Array<OrderType>;
};

export type PaginatedProducts = {
  __typename?: 'PaginatedProducts';
  items: Array<Product>;
  meta: PaginationMeta;
};

export type PaginatedRedirects = {
  __typename?: 'PaginatedRedirects';
  data: Array<RedirectType>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PaginationInput = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type PaginationMeta = {
  __typename?: 'PaginationMeta';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaymentDetailType = {
  __typename?: 'PaymentDetailType';
  _id: Scalars['String']['output'];
  amount: Scalars['String']['output'];
  bankId?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  bankTxnId?: Maybe<Scalars['String']['output']>;
  cardHashId?: Maybe<Scalars['String']['output']>;
  cardNumber?: Maybe<Scalars['String']['output']>;
  cardScheme?: Maybe<Scalars['String']['output']>;
  cardToken?: Maybe<Scalars['String']['output']>;
  cardType?: Maybe<Scalars['String']['output']>;
  cartSnapshot?: Maybe<CartSnapshotType>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  customerEmail?: Maybe<Scalars['String']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  executedAt?: Maybe<Scalars['DateTime']['output']>;
  failureReason?: Maybe<Scalars['String']['output']>;
  identityId?: Maybe<Scalars['String']['output']>;
  ledgerUpdated?: Maybe<Scalars['Boolean']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  paymentEventId?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentMethodId?: Maybe<Scalars['String']['output']>;
  paymentMode?: Maybe<Scalars['String']['output']>;
  paymentOrderId: Scalars['String']['output'];
  paymentOrderStatus: PaymentStatus;
  productDescription?: Maybe<Scalars['String']['output']>;
  pspOrderId?: Maybe<Scalars['String']['output']>;
  pspResponseCode?: Maybe<Scalars['String']['output']>;
  pspResponseMessage?: Maybe<Scalars['String']['output']>;
  pspToken?: Maybe<Scalars['String']['output']>;
  pspTxnId?: Maybe<Scalars['String']['output']>;
  pspTxnTime?: Maybe<Scalars['DateTime']['output']>;
  refunds?: Maybe<Array<PaymentRefundType>>;
  retryCount?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PaymentFiltersInput = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  identityId?: InputMaybe<Scalars['String']['input']>;
  maxAmount?: InputMaybe<Scalars['String']['input']>;
  minAmount?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  paymentMethods?: InputMaybe<Array<PaymentMethod>>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<PaymentStatus>>;
};

export type PaymentListItemType = {
  __typename?: 'PaymentListItemType';
  _id: Scalars['String']['output'];
  amount: Scalars['String']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  identityId?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  paymentOrderId: Scalars['String']['output'];
  paymentOrderStatus: Scalars['String']['output'];
  pspTxnId?: Maybe<Scalars['String']['output']>;
};

export enum PaymentMethod {
  Card = 'CARD',
  CreditCard = 'CREDIT_CARD',
  DebitCard = 'DEBIT_CARD',
  NetBanking = 'NET_BANKING',
  Upi = 'UPI',
  Wallet = 'WALLET'
}

export type PaymentOrderType = {
  __typename?: 'PaymentOrderType';
  _id: Scalars['String']['output'];
  amount: Scalars['String']['output'];
  bankId?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  bankTxnId?: Maybe<Scalars['String']['output']>;
  cardHashId?: Maybe<Scalars['String']['output']>;
  cardNumber?: Maybe<Scalars['String']['output']>;
  cardScheme?: Maybe<Scalars['String']['output']>;
  cardToken?: Maybe<Scalars['String']['output']>;
  cardType?: Maybe<Scalars['String']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  executedAt?: Maybe<Scalars['DateTime']['output']>;
  failureReason?: Maybe<Scalars['String']['output']>;
  identityId?: Maybe<Scalars['String']['output']>;
  ledgerUpdated?: Maybe<Scalars['Boolean']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  paymentEventId?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<PaymentMethod>;
  paymentMethodId?: Maybe<Scalars['String']['output']>;
  paymentMode?: Maybe<Scalars['String']['output']>;
  paymentOrderId: Scalars['String']['output'];
  paymentOrderStatus: PaymentStatus;
  productDescription?: Maybe<Scalars['String']['output']>;
  pspOrderId?: Maybe<Scalars['String']['output']>;
  pspResponseCode?: Maybe<Scalars['String']['output']>;
  pspResponseMessage?: Maybe<Scalars['String']['output']>;
  pspToken?: Maybe<Scalars['String']['output']>;
  pspTxnId?: Maybe<Scalars['String']['output']>;
  pspTxnTime?: Maybe<Scalars['DateTime']['output']>;
  retryCount?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PaymentRefundType = {
  __typename?: 'PaymentRefundType';
  _id: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  paymentOrderId: Scalars['String']['output'];
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  pspRefundId?: Maybe<Scalars['String']['output']>;
  pspResponseCode?: Maybe<Scalars['String']['output']>;
  pspResponseMessage?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  refundAmount: Scalars['String']['output'];
  refundId: Scalars['String']['output'];
  refundStatus: PaymentStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export enum PaymentStatus {
  Executing = 'EXECUTING',
  Failed = 'FAILED',
  NotStarted = 'NOT_STARTED',
  PartiallyRefunded = 'PARTIALLY_REFUNDED',
  Pending = 'PENDING',
  Refunded = 'REFUNDED',
  Success = 'SUCCESS'
}

export type PaymentStatusResponse = {
  __typename?: 'PaymentStatusResponse';
  message?: Maybe<Scalars['String']['output']>;
  paymentOrder: PaymentOrderType;
  paymentOrderId: Scalars['String']['output'];
  status: PaymentStatus;
};

export type PaymentsListResponse = {
  __typename?: 'PaymentsListResponse';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  payments: Array<PaymentListItemType>;
  summary: PaymentsSummaryType;
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaymentsSummaryType = {
  __typename?: 'PaymentsSummaryType';
  failedCount: Scalars['Float']['output'];
  pendingCount: Scalars['Float']['output'];
  successCount: Scalars['Float']['output'];
  totalAmount: Scalars['String']['output'];
  totalPayments: Scalars['Int']['output'];
  totalRefunded: Scalars['String']['output'];
};

export type PhoneCheckOutput = {
  __typename?: 'PhoneCheckOutput';
  exists: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  requiresLogin: Scalars['Boolean']['output'];
};

export type PieceDetailInput = {
  declaredValue: Scalars['Float']['input'];
  description: Scalars['String']['input'];
  height: Scalars['Float']['input'];
  length: Scalars['Float']['input'];
  weight: Scalars['Float']['input'];
  width: Scalars['Float']['input'];
};

export type PlaceDetailsInput = {
  placeId: Scalars['String']['input'];
  sessionToken?: InputMaybe<Scalars['String']['input']>;
};

export type PlaceDetailsOutput = {
  __typename?: 'PlaceDetailsOutput';
  country?: Maybe<Scalars['String']['output']>;
  formattedAddress: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  locality?: Maybe<Scalars['String']['output']>;
  longitude: Scalars['Float']['output'];
  placeId: Scalars['String']['output'];
  postalCode?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  streetAddress?: Maybe<Scalars['String']['output']>;
};

export type PlacePredictionOutput = {
  __typename?: 'PlacePredictionOutput';
  description: Scalars['String']['output'];
  mainText: Scalars['String']['output'];
  placeId: Scalars['String']['output'];
  secondaryText: Scalars['String']['output'];
};

export type PlatformStats = {
  __typename?: 'PlatformStats';
  android: Scalars['Int']['output'];
  desktop: Scalars['Int']['output'];
  ios: Scalars['Int']['output'];
  macos: Scalars['Int']['output'];
  web: Scalars['Int']['output'];
};

export type Policy = {
  __typename?: 'Policy';
  _id: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  seo?: Maybe<PolicySeo>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PolicySeo = {
  __typename?: 'PolicySeo';
  _id: Scalars['ID']['output'];
  canonicalUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  metaDescription?: Maybe<Scalars['String']['output']>;
  metaKeywords?: Maybe<Array<Scalars['String']['output']>>;
  metaTitle?: Maybe<Scalars['String']['output']>;
  ogDescription?: Maybe<Scalars['String']['output']>;
  ogImage?: Maybe<Scalars['String']['output']>;
  ogTitle?: Maybe<Scalars['String']['output']>;
  policyId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PolicySeoInput = {
  canonicalUrl?: InputMaybe<Scalars['String']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  metaTitle?: InputMaybe<Scalars['String']['input']>;
  ogDescription?: InputMaybe<Scalars['String']['input']>;
  ogImage?: InputMaybe<Scalars['String']['input']>;
  ogTitle?: InputMaybe<Scalars['String']['input']>;
};

export type PriceRange = {
  __typename?: 'PriceRange';
  max: Scalars['Float']['output'];
  min: Scalars['Float']['output'];
};

export type ProcessRefundInput = {
  paymentOrderId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  refundAmount: Scalars['String']['input'];
};

export type Product = {
  __typename?: 'Product';
  _id: Scalars['ID']['output'];
  allergens?: Maybe<Scalars['String']['output']>;
  availableVariants: Array<ProductVariant>;
  brand: Scalars['String']['output'];
  categories?: Maybe<Array<Category>>;
  category?: Maybe<Category>;
  categoryIds: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  defaultVariant?: Maybe<ProductVariant>;
  description?: Maybe<Scalars['String']['output']>;
  favourite?: Maybe<Scalars['Boolean']['output']>;
  gtin?: Maybe<Scalars['String']['output']>;
  ingredients: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  isGlutenFree: Scalars['Boolean']['output'];
  isVegetarian: Scalars['Boolean']['output'];
  keywords: Array<Scalars['String']['output']>;
  mpn?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  priceRange: PriceRange;
  rating?: Maybe<Scalars['Float']['output']>;
  ratingCount: Scalars['Int']['output'];
  seo?: Maybe<ProductSeo>;
  shelfLife: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  variants: Array<ProductVariant>;
};

export type ProductImage = {
  __typename?: 'ProductImage';
  alt: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ProductImageInput = {
  alt: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type ProductSeo = {
  __typename?: 'ProductSeo';
  _id: Scalars['ID']['output'];
  canonicalUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  metaDescription?: Maybe<Scalars['String']['output']>;
  metaKeywords?: Maybe<Array<Scalars['String']['output']>>;
  metaTitle?: Maybe<Scalars['String']['output']>;
  ogDescription?: Maybe<Scalars['String']['output']>;
  ogImage?: Maybe<Scalars['String']['output']>;
  ogTitle?: Maybe<Scalars['String']['output']>;
  productId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductSeoInput = {
  canonicalUrl?: InputMaybe<Scalars['String']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  metaTitle?: InputMaybe<Scalars['String']['input']>;
  ogDescription?: InputMaybe<Scalars['String']['input']>;
  ogImage?: InputMaybe<Scalars['String']['input']>;
  ogTitle?: InputMaybe<Scalars['String']['input']>;
};

export type ProductVariant = {
  __typename?: 'ProductVariant';
  _id: Scalars['ID']['output'];
  availabilityStatus: Scalars['String']['output'];
  breadth: Scalars['Float']['output'];
  discountPercent: Scalars['Float']['output'];
  discountSource: Scalars['String']['output'];
  height: Scalars['Float']['output'];
  images: Array<ProductImage>;
  isActive: Scalars['Boolean']['output'];
  isDefault: Scalars['Boolean']['output'];
  length: Scalars['Float']['output'];
  mrp: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  packageSize: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  sku: Scalars['String']['output'];
  stockQuantity: Scalars['Int']['output'];
  thumbnailUrl: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
  weightUnit: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  activeBanners: Array<Banner>;
  activeCoupons: Array<Coupon>;
  address: Address;
  allActiveRedirects: Array<RedirectType>;
  banner?: Maybe<Banner>;
  banners: Array<Banner>;
  categories: PaginatedCategories;
  category?: Maybe<Category>;
  categoryBySlug?: Maybe<Category>;
  categoryChildren: PaginatedCategories;
  charges?: Maybe<Charges>;
  checkPhoneExists: PhoneCheckOutput;
  coupon: Coupon;
  coupons: Array<Coupon>;
  dashboardStats: DashboardStats;
  geocodeAddress: GoogleMapsAddressOutput;
  getActiveBoxSizes: Array<BoxSize>;
  getAdminPaymentDetail: PaymentDetailType;
  getAdminPaymentsByIdentity: Array<PaymentListItemType>;
  getAdminPaymentsByOrder: Array<PaymentListItemType>;
  getAdminPaymentsList: PaymentsListResponse;
  getAllBoxSizes: Array<BoxSize>;
  getAllCustomers: PaginatedCustomersResponse;
  getAllNewsletterSubscriptions: Array<NewsletterSubscription>;
  getAllOrders: AdminOrdersResponse;
  getAllPackers: Array<Packer>;
  getAllPackingOrders: Array<PackingOrder>;
  getAssignedOrder: PackingOrder;
  getBoxRecommendation: BoxSize;
  getCustomerDetails: CustomerDetails;
  getEvidenceByOrder: PackingEvidence;
  getMyAssignedOrders: Array<PackingOrder>;
  getMyOrders: PaginatedOrdersResponse;
  getNewsletterSubscriptionCount: Scalars['Float']['output'];
  getOrderById: OrderType;
  getPackerById: Packer;
  getPackerStats: PackerStats;
  getPaymentOrderById: PaymentOrderType;
  getPaymentStatus: PaymentStatusResponse;
  getPlaceDetails: PlaceDetailsOutput;
  getShipmentByAwb?: Maybe<ShipmentResponse>;
  getShipmentById?: Maybe<ShipmentResponse>;
  getShipmentWithTracking: ShipmentWithTrackingResponse;
  guest?: Maybe<Guest>;
  guestByGuestId?: Maybe<Guest>;
  hello: Scalars['String']['output'];
  listShipments: ShipmentListResponse;
  me?: Maybe<User>;
  myAddresses: Array<Address>;
  myCart?: Maybe<Cart>;
  myPayments: Array<PaymentOrderType>;
  policies: Array<Policy>;
  policiesByType: Array<Policy>;
  policy?: Maybe<Policy>;
  product?: Maybe<Product>;
  productBySlug?: Maybe<Product>;
  productVariant?: Maybe<ProductVariant>;
  products: PaginatedProducts;
  productsByCategory: PaginatedProducts;
  redirect: RedirectType;
  redirectByPath?: Maybe<RedirectType>;
  redirects: PaginatedRedirects;
  reverseGeocode: GoogleMapsAddressOutput;
  rootCategories: PaginatedCategories;
  searchCategories: PaginatedCategories;
  searchPlaces: Array<PlacePredictionOutput>;
  searchProducts: PaginatedProducts;
};


export type QueryAddressArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBannerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCategoriesArgs = {
  includeArchived?: Scalars['Boolean']['input'];
  pagination?: PaginationInput;
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
  includeArchived?: Scalars['Boolean']['input'];
};


export type QueryCategoryBySlugArgs = {
  includeArchived?: Scalars['Boolean']['input'];
  slug: Scalars['String']['input'];
};


export type QueryCategoryChildrenArgs = {
  includeArchived?: Scalars['Boolean']['input'];
  pagination?: PaginationInput;
  parentId: Scalars['ID']['input'];
};


export type QueryCheckPhoneExistsArgs = {
  phoneNumber: Scalars['String']['input'];
};


export type QueryCouponArgs = {
  code: Scalars['String']['input'];
};


export type QueryGeocodeAddressArgs = {
  input: GeocodeAddressInput;
};


export type QueryGetAdminPaymentDetailArgs = {
  paymentOrderId: Scalars['String']['input'];
};


export type QueryGetAdminPaymentsByIdentityArgs = {
  identityId: Scalars['String']['input'];
};


export type QueryGetAdminPaymentsByOrderArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryGetAdminPaymentsListArgs = {
  input: GetPaymentsListInput;
};


export type QueryGetAllCustomersArgs = {
  input: GetCustomersInput;
};


export type QueryGetAllNewsletterSubscriptionsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetAllOrdersArgs = {
  input: GetAllOrdersInput;
};


export type QueryGetAllPackersArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetAllPackingOrdersArgs = {
  packerId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetBoxRecommendationArgs = {
  packingOrderId: Scalars['String']['input'];
};


export type QueryGetCustomerDetailsArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetEvidenceByOrderArgs = {
  packingOrderId: Scalars['String']['input'];
};


export type QueryGetMyOrdersArgs = {
  input: GetMyOrdersInput;
};


export type QueryGetNewsletterSubscriptionCountArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetOrderByIdArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryGetPackerByIdArgs = {
  packerId: Scalars['String']['input'];
};


export type QueryGetPackerStatsArgs = {
  endDate: Scalars['DateTime']['input'];
  packerId: Scalars['String']['input'];
  startDate: Scalars['DateTime']['input'];
};


export type QueryGetPaymentOrderByIdArgs = {
  paymentOrderId: Scalars['String']['input'];
};


export type QueryGetPaymentStatusArgs = {
  paymentOrderId: Scalars['String']['input'];
};


export type QueryGetPlaceDetailsArgs = {
  input: PlaceDetailsInput;
};


export type QueryGetShipmentByAwbArgs = {
  awbNumber: Scalars['String']['input'];
};


export type QueryGetShipmentByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetShipmentWithTrackingArgs = {
  awbNumber: Scalars['String']['input'];
};


export type QueryGuestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGuestByGuestIdArgs = {
  guestId: Scalars['String']['input'];
};


export type QueryListShipmentsArgs = {
  filters?: InputMaybe<ShipmentFiltersInput>;
};


export type QueryPoliciesByTypeArgs = {
  type: Scalars['String']['input'];
};


export type QueryPolicyArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryProductVariantArgs = {
  productId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type QueryProductsArgs = {
  includeArchived?: Scalars['Boolean']['input'];
  includeOutOfStock?: Scalars['Boolean']['input'];
  pagination?: PaginationInput;
};


export type QueryProductsByCategoryArgs = {
  categoryId: Scalars['ID']['input'];
  pagination?: PaginationInput;
};


export type QueryRedirectArgs = {
  id: Scalars['String']['input'];
};


export type QueryRedirectByPathArgs = {
  fromPath: Scalars['String']['input'];
};


export type QueryRedirectsArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryReverseGeocodeArgs = {
  input: ReverseGeocodeInput;
};


export type QueryRootCategoriesArgs = {
  includeArchived?: Scalars['Boolean']['input'];
  pagination?: PaginationInput;
};


export type QuerySearchCategoriesArgs = {
  includeArchived?: Scalars['Boolean']['input'];
  pagination?: PaginationInput;
  searchTerm: Scalars['String']['input'];
};


export type QuerySearchPlacesArgs = {
  input: SearchPlacesInput;
};


export type QuerySearchProductsArgs = {
  nameOnly?: Scalars['Boolean']['input'];
  pagination?: PaginationInput;
  searchTerm: Scalars['String']['input'];
};

export type RedirectType = {
  __typename?: 'RedirectType';
  _id: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fromPath: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  source: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  toPath: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type RefundInitiateResponse = {
  __typename?: 'RefundInitiateResponse';
  message?: Maybe<Scalars['String']['output']>;
  refundId: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type RefundResponse = {
  __typename?: 'RefundResponse';
  message?: Maybe<Scalars['String']['output']>;
  refundId: Scalars['String']['output'];
  status: PaymentStatus;
};

export type RemoveProductsFromCategoryInput = {
  categoryId: Scalars['ID']['input'];
  productIds: Array<Scalars['ID']['input']>;
};

export type ReverseGeocodeInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type ScanItemInput = {
  ean: Scalars['String']['input'];
  packingOrderId: Scalars['String']['input'];
};

export type ScanLog = {
  __typename?: 'ScanLog';
  ean: Scalars['String']['output'];
  errorType?: Maybe<Scalars['String']['output']>;
  expectedQuantity?: Maybe<Scalars['Int']['output']>;
  flaggedAt?: Maybe<Scalars['DateTime']['output']>;
  flaggedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isRetrospective: Scalars['Boolean']['output'];
  isValid: Scalars['Boolean']['output'];
  matchedProductId?: Maybe<Scalars['String']['output']>;
  matchedSku?: Maybe<Scalars['String']['output']>;
  packerId: Scalars['String']['output'];
  packingOrderId: Scalars['String']['output'];
  retrospectiveNotes?: Maybe<Scalars['String']['output']>;
  scannedAt: Scalars['DateTime']['output'];
  scannedQuantity?: Maybe<Scalars['Int']['output']>;
};

export type SearchPlacesInput = {
  query: Scalars['String']['input'];
  sessionToken?: InputMaybe<Scalars['String']['input']>;
};

export type SeoBase = {
  __typename?: 'SeoBase';
  canonicalUrl?: Maybe<Scalars['String']['output']>;
  metaDescription?: Maybe<Scalars['String']['output']>;
  metaKeywords?: Maybe<Array<Scalars['String']['output']>>;
  metaTitle?: Maybe<Scalars['String']['output']>;
  ogDescription?: Maybe<Scalars['String']['output']>;
  ogImage?: Maybe<Scalars['String']['output']>;
  ogTitle?: Maybe<Scalars['String']['output']>;
};

export type SeoBaseInput = {
  canonicalUrl?: InputMaybe<Scalars['String']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  metaTitle?: InputMaybe<Scalars['String']['input']>;
  ogDescription?: InputMaybe<Scalars['String']['input']>;
  ogImage?: InputMaybe<Scalars['String']['input']>;
  ogTitle?: InputMaybe<Scalars['String']['input']>;
};

export type SetShippingAddressInput = {
  addressId: Scalars['ID']['input'];
};

export type ShipmentFiltersInput = {
  awbNumber?: InputMaybe<Scalars['String']['input']>;
  bookedFrom?: InputMaybe<Scalars['String']['input']>;
  bookedTo?: InputMaybe<Scalars['String']['input']>;
  customerCode?: InputMaybe<Scalars['String']['input']>;
  isCancelled?: InputMaybe<Scalars['Boolean']['input']>;
  isDelivered?: InputMaybe<Scalars['Boolean']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  referenceNumber?: InputMaybe<Scalars['String']['input']>;
  statusCode?: InputMaybe<Scalars['String']['input']>;
};

export type ShipmentListResponse = {
  __typename?: 'ShipmentListResponse';
  shipments: Array<ShipmentResponse>;
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type ShipmentResponse = {
  __typename?: 'ShipmentResponse';
  bookedOn: Scalars['DateTime']['output'];
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  codAmount?: Maybe<Scalars['Float']['output']>;
  codCollectionMode?: Maybe<Scalars['String']['output']>;
  commodityId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentLocation?: Maybe<Scalars['String']['output']>;
  currentStatusCode?: Maybe<Scalars['String']['output']>;
  currentStatusDescription?: Maybe<Scalars['String']['output']>;
  customerCode: Scalars['String']['output'];
  declaredValue?: Maybe<Scalars['Float']['output']>;
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  destinationCity?: Maybe<Scalars['String']['output']>;
  destinationDetails?: Maybe<Scalars['JSON']['output']>;
  dimensions?: Maybe<Scalars['JSON']['output']>;
  dtdcAwbNumber: Scalars['String']['output'];
  dtdcReferenceNumber?: Maybe<Scalars['String']['output']>;
  ewayBill?: Maybe<Scalars['String']['output']>;
  expectedDeliveryDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  invoiceDate?: Maybe<Scalars['DateTime']['output']>;
  invoiceNumber?: Maybe<Scalars['String']['output']>;
  isCancelled: Scalars['Boolean']['output'];
  isDelivered: Scalars['Boolean']['output'];
  isRto: Scalars['Boolean']['output'];
  labelUrl?: Maybe<Scalars['String']['output']>;
  loadType: Scalars['String']['output'];
  numPieces: Scalars['Int']['output'];
  orderId?: Maybe<Scalars['String']['output']>;
  originCity: Scalars['String']['output'];
  originDetails?: Maybe<Scalars['JSON']['output']>;
  piecesDetail?: Maybe<Scalars['JSON']['output']>;
  revisedExpectedDeliveryDate?: Maybe<Scalars['DateTime']['output']>;
  rtoNumber?: Maybe<Scalars['String']['output']>;
  serviceType: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  webhookLastReceivedAt?: Maybe<Scalars['DateTime']['output']>;
  weight: Scalars['Float']['output'];
};

export type ShipmentWithTrackingResponse = {
  __typename?: 'ShipmentWithTrackingResponse';
  bookedOn: Scalars['DateTime']['output'];
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  codAmount?: Maybe<Scalars['Float']['output']>;
  codCollectionMode?: Maybe<Scalars['String']['output']>;
  commodityId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentLocation?: Maybe<Scalars['String']['output']>;
  currentStatusCode?: Maybe<Scalars['String']['output']>;
  currentStatusDescription?: Maybe<Scalars['String']['output']>;
  customerCode: Scalars['String']['output'];
  declaredValue?: Maybe<Scalars['Float']['output']>;
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  destinationCity?: Maybe<Scalars['String']['output']>;
  destinationDetails?: Maybe<Scalars['JSON']['output']>;
  dimensions?: Maybe<Scalars['JSON']['output']>;
  dtdcAwbNumber: Scalars['String']['output'];
  dtdcReferenceNumber?: Maybe<Scalars['String']['output']>;
  ewayBill?: Maybe<Scalars['String']['output']>;
  expectedDeliveryDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  invoiceDate?: Maybe<Scalars['DateTime']['output']>;
  invoiceNumber?: Maybe<Scalars['String']['output']>;
  isCancelled: Scalars['Boolean']['output'];
  isDelivered: Scalars['Boolean']['output'];
  isRto: Scalars['Boolean']['output'];
  labelUrl?: Maybe<Scalars['String']['output']>;
  loadType: Scalars['String']['output'];
  numPieces: Scalars['Int']['output'];
  orderId?: Maybe<Scalars['String']['output']>;
  originCity: Scalars['String']['output'];
  originDetails?: Maybe<Scalars['JSON']['output']>;
  piecesDetail?: Maybe<Scalars['JSON']['output']>;
  revisedExpectedDeliveryDate?: Maybe<Scalars['DateTime']['output']>;
  rtoNumber?: Maybe<Scalars['String']['output']>;
  serviceType: Scalars['String']['output'];
  trackingHistory: Array<TrackingHistoryResponse>;
  updatedAt: Scalars['DateTime']['output'];
  webhookLastReceivedAt?: Maybe<Scalars['DateTime']['output']>;
  weight: Scalars['Float']['output'];
};

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type StatusStats = {
  __typename?: 'StatusStats';
  active: Scalars['Int']['output'];
  guest: Scalars['Int']['output'];
  registered: Scalars['Int']['output'];
  suspended: Scalars['Int']['output'];
  verified: Scalars['Int']['output'];
};

export type SubscribeNewsletterInput = {
  email: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
};

export type SubscribeNewsletterResponse = {
  __typename?: 'SubscribeNewsletterResponse';
  email?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type TrackingHistoryResponse = {
  __typename?: 'TrackingHistoryResponse';
  actionDate: Scalars['DateTime']['output'];
  actionDatetime: Scalars['DateTime']['output'];
  actionTime: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  manifestNumber?: Maybe<Scalars['String']['output']>;
  ndcOtp?: Maybe<Scalars['Boolean']['output']>;
  remarks?: Maybe<Scalars['String']['output']>;
  scdOtp?: Maybe<Scalars['Boolean']['output']>;
  shipmentId: Scalars['String']['output'];
  statusCode: Scalars['String']['output'];
  statusDescription: Scalars['String']['output'];
};

export type UpdateAddressInput = {
  addressCountry?: InputMaybe<Scalars['String']['input']>;
  addressLocality?: InputMaybe<Scalars['String']['input']>;
  addressRegion?: InputMaybe<Scalars['String']['input']>;
  addressType?: InputMaybe<Scalars['String']['input']>;
  buildingName?: InputMaybe<Scalars['String']['input']>;
  floor?: InputMaybe<Scalars['String']['input']>;
  formattedAddress?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  landmark?: InputMaybe<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  placeId?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  recipientName?: InputMaybe<Scalars['String']['input']>;
  recipientPhone?: InputMaybe<Scalars['String']['input']>;
  streetArea?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBannerInput = {
  backgroundColor?: InputMaybe<Scalars['String']['input']>;
  ctaText?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  headline?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  mobileImageUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Float']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  subheadline?: InputMaybe<Scalars['String']['input']>;
  textColor?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBoxSizeInput = {
  cost?: InputMaybe<Scalars['Float']['input']>;
  internalDimensions?: InputMaybe<DimensionsInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxWeight?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCartItemInput = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type UpdateCategoryInput = {
  codeValue?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  favourite?: InputMaybe<Scalars['Boolean']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  inCodeSet?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  seo?: InputMaybe<SeoBaseInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGuestInput = {
  deviceInfo?: InputMaybe<Scalars['JSON']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderStatusInput = {
  orderId: Scalars['String']['input'];
  status: OrderStatus;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePackerInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePolicyInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  seo?: InputMaybe<SeoBaseInput>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductInput = {
  allergens?: InputMaybe<Scalars['String']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  categoryIds?: InputMaybe<Array<Scalars['String']['input']>>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  favourite?: InputMaybe<Scalars['Boolean']['input']>;
  gtin?: InputMaybe<Scalars['String']['input']>;
  ingredients?: InputMaybe<Scalars['String']['input']>;
  isGlutenFree?: InputMaybe<Scalars['Boolean']['input']>;
  isVegetarian?: InputMaybe<Scalars['Boolean']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  mpn?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Float']['input']>;
  ratingCount?: InputMaybe<Scalars['Int']['input']>;
  seo?: InputMaybe<ProductSeoInput>;
  shelfLife?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  variants?: InputMaybe<Array<UpdateProductVariantInput>>;
};

export type UpdateProductVariantInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  availabilityStatus?: InputMaybe<Scalars['String']['input']>;
  breadth?: InputMaybe<Scalars['Float']['input']>;
  discountPercent?: InputMaybe<Scalars['Float']['input']>;
  discountSource?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  images?: InputMaybe<Array<ProductImageInput>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['Float']['input']>;
  mrp?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  packageSize?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRedirectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fromPath?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  statusCode?: InputMaybe<Scalars['Int']['input']>;
  toPath?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  dateOfBirth?: InputMaybe<Scalars['JSON']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UploadEvidenceInput = {
  actualBoxCode?: InputMaybe<Scalars['String']['input']>;
  packingOrderId: Scalars['String']['input'];
  postPackImages?: InputMaybe<Array<Scalars['String']['input']>>;
  prePackImages?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstAuthMethod?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  isPhoneVerified: Scalars['Boolean']['output'];
  lastAuthMethod?: Maybe<Scalars['String']['output']>;
  lastIp?: Maybe<Scalars['String']['output']>;
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  lifetimeValue?: Maybe<Scalars['Float']['output']>;
  marketingSmsOptIn?: Maybe<Scalars['Boolean']['output']>;
  mergedGuestIds: Array<Scalars['String']['output']>;
  phoneNumber: Scalars['String']['output'];
  role: Scalars['String']['output'];
  signupSource?: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type GetAllProductsForSitemapQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllProductsForSitemapQuery = { __typename?: 'Query', products: { __typename?: 'PaginatedProducts', items: Array<{ __typename?: 'Product', slug: string, updatedAt: any }> } };

export type GetAllCategoriesForSitemapQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllCategoriesForSitemapQuery = { __typename?: 'Query', categories: { __typename?: 'PaginatedCategories', items: Array<{ __typename?: 'Category', slug: string, updatedAt: any }> } };

export type SearchPlacesQueryVariables = Exact<{
  query: Scalars['String']['input'];
  sessionToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchPlacesQuery = { __typename?: 'Query', searchPlaces: Array<{ __typename?: 'PlacePredictionOutput', placeId: string, description: string, mainText: string, secondaryText: string }> };

export type GetPlaceDetailsQueryVariables = Exact<{
  placeId: Scalars['String']['input'];
  sessionToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPlaceDetailsQuery = { __typename?: 'Query', getPlaceDetails: { __typename?: 'PlaceDetailsOutput', placeId: string, formattedAddress: string, streetAddress?: string | null, locality?: string | null, region?: string | null, postalCode?: string | null, country?: string | null, latitude: number, longitude: number } };

export type GetMyAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyAddressesQuery = { __typename?: 'Query', myAddresses: Array<{ __typename?: 'Address', _id: string, addressType: string, recipientPhone: string, recipientName: string, buildingName: string, floor?: string | null, streetArea?: string | null, landmark?: string | null, addressLocality: string, addressRegion: string, postalCode: string, addressCountry: string, isDefault: boolean, latitude: number, longitude: number, formattedAddress: string, placeId?: string | null }> };

export type CreateAddressMutationVariables = Exact<{
  input: CreateAddressInput;
}>;


export type CreateAddressMutation = { __typename?: 'Mutation', createAddress: { __typename?: 'Address', _id: string, addressType: string, formattedAddress: string, isDefault: boolean } };

export type CheckPhoneExistsQueryVariables = Exact<{
  phoneNumber: Scalars['String']['input'];
}>;


export type CheckPhoneExistsQuery = { __typename?: 'Query', checkPhoneExists: { __typename?: 'PhoneCheckOutput', exists: boolean, requiresLogin: boolean, message?: string | null } };

export type AdminLogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type AdminLogoutMutation = { __typename?: 'Mutation', adminLogout: string };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', _id: string, firstName: string, lastName: string, email?: string | null, phoneNumber: string, dateOfBirth?: any | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', _id: string, phoneNumber: string, firstName: string, lastName: string, email?: string | null, dateOfBirth?: any | null } | null };

export type GetActiveBannersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveBannersQuery = { __typename?: 'Query', activeBanners: Array<{ __typename?: 'Banner', _id: string, name: string, headline: string, subheadline: string, description?: string | null, imageUrl: string, mobileImageUrl: string, thumbnailUrl?: string | null, url: string, ctaText: string, position: number, isActive: boolean, startDate?: any | null, endDate?: any | null, backgroundColor?: string | null, textColor?: string | null }> };

export type GetMyCartQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyCartQuery = { __typename?: 'Query', myCart?: { __typename?: 'Cart', _id: string, status: CartStatus, couponCode?: string | null, createdAt: any, updatedAt: any, items: Array<{ __typename?: 'CartItem', productId: string, variantId?: string | null, sku: string, name: string, quantity: number, unitPrice: number, totalPrice: number, mrp: number, imageUrl?: string | null, attributes?: any | null }>, totalsSummary: { __typename?: 'CartTotals', subtotal: number, discountAmount: number, shippingCost: number, estimatedTax: number, handlingCharge: number, grandTotal: number } } | null };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { __typename?: 'Mutation', addToCart: { __typename?: 'Cart', _id: string, items: Array<{ __typename?: 'CartItem', productId: string, name: string, quantity: number, unitPrice: number, totalPrice: number, attributes?: any | null }>, totalsSummary: { __typename?: 'CartTotals', subtotal: number, discountAmount: number, grandTotal: number } } };

export type UpdateCartItemMutationVariables = Exact<{
  input: UpdateCartItemInput;
}>;


export type UpdateCartItemMutation = { __typename?: 'Mutation', updateCartItem: { __typename?: 'Cart', _id: string, items: Array<{ __typename?: 'CartItem', productId: string, quantity: number, totalPrice: number }>, totalsSummary: { __typename?: 'CartTotals', grandTotal: number } } };

export type RemoveFromCartMutationVariables = Exact<{
  productId: Scalars['ID']['input'];
}>;


export type RemoveFromCartMutation = { __typename?: 'Mutation', removeFromCart: { __typename?: 'Cart', _id: string, items: Array<{ __typename?: 'CartItem', productId: string, name: string, quantity: number }>, totalsSummary: { __typename?: 'CartTotals', grandTotal: number } } };

export type SetShippingAddressMutationVariables = Exact<{
  input: SetShippingAddressInput;
}>;


export type SetShippingAddressMutation = { __typename?: 'Mutation', setShippingAddress: { __typename?: 'Cart', _id: string, shippingAddressId?: string | null, totalsSummary: { __typename?: 'CartTotals', subtotal: number, discountAmount: number, shippingCost: number, estimatedTax: number, handlingCharge: number, grandTotal: number } } };

export type GetRootCategoriesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetRootCategoriesQuery = { __typename?: 'Query', rootCategories: { __typename?: 'PaginatedCategories', items: Array<{ __typename?: 'Category', id: string, name: string, slug: string, imageUrl?: string | null, favourite?: boolean | null }>, meta: { __typename?: 'PaginationMeta', totalCount: number, totalPages: number, page: number, limit: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetCategoryWithProductsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCategoryWithProductsQuery = { __typename?: 'Query', category?: { __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, imageUrl?: string | null, codeValue?: string | null, inCodeSet?: string | null, productCount: number, isArchived: boolean, favourite?: boolean | null, createdAt: any, updatedAt: any, products: Array<{ __typename?: 'Product', _id: string, name: string, slug: string, brand: string, defaultVariant?: { __typename?: 'ProductVariant', sku: string, price: number, mrp: number, discountPercent: number, thumbnailUrl: string, availabilityStatus: string, stockQuantity: number } | null, availableVariants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, price: number, mrp: number, packageSize: string, weight: number, weightUnit: string }> }> } | null };

export type GetCategoryBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCategoryBySlugQuery = { __typename?: 'Query', categoryBySlug?: { __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, productCount: number, imageUrl?: string | null, seo?: { __typename?: 'CategorySeo', metaTitle?: string | null, metaDescription?: string | null, metaKeywords?: Array<string> | null, canonicalUrl?: string | null, ogTitle?: string | null, ogDescription?: string | null, ogImage?: string | null } | null, products: Array<{ __typename?: 'Product', _id: string, name: string, slug: string, tags: Array<string>, defaultVariant?: { __typename?: 'ProductVariant', thumbnailUrl: string, price: number, mrp: number, packageSize: string } | null, availableVariants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, price: number, mrp: number, packageSize: string, weight: number, weightUnit: string }> }> } | null };

export type GetCategoryWithChildrenQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCategoryWithChildrenQuery = { __typename?: 'Query', categoryBySlug?: { __typename?: 'Category', id: string, name: string, slug: string, imageUrl?: string | null, children?: Array<{ __typename?: 'Category', id: string, name: string, slug: string, imageUrl?: string | null, productCount: number }> | null } | null };

export type GetActiveCouponsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveCouponsQuery = { __typename?: 'Query', activeCoupons: Array<{ __typename?: 'Coupon', _id: string, code: string, description: string, name: string, discountType: DiscountType, discountValue: number, minCartValue?: number | null, endDate?: any | null }> };

export type ApplyCouponMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type ApplyCouponMutation = { __typename?: 'Mutation', applyCoupon: { __typename?: 'Cart', _id: string, couponCode?: string | null, totalsSummary: { __typename?: 'CartTotals', subtotal: number, discountAmount: number, grandTotal: number } } };

export type RemoveCouponMutationVariables = Exact<{ [key: string]: never; }>;


export type RemoveCouponMutation = { __typename?: 'Mutation', removeCoupon: { __typename?: 'Cart', _id: string, couponCode?: string | null, totalsSummary: { __typename?: 'CartTotals', subtotal: number, discountAmount: number, grandTotal: number } } };

export type CreateGuestMutationVariables = Exact<{
  input: CreateGuestInput;
}>;


export type CreateGuestMutation = { __typename?: 'Mutation', createGuest: { __typename?: 'Guest', _id: string, guestId: string, sessionId: string } };

export type UpdateGuestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateGuestInput;
}>;


export type UpdateGuestMutation = { __typename?: 'Mutation', updateGuest: { __typename?: 'Guest', _id: string, lastActiveAt: any } };

export type GetMyOrdersQueryVariables = Exact<{
  input: GetMyOrdersInput;
}>;


export type GetMyOrdersQuery = { __typename?: 'Query', getMyOrders: { __typename?: 'PaginatedOrdersResponse', orders: Array<{ __typename?: 'OrderType', _id: string, orderId: string, orderStatus: OrderStatus, totalAmount: string, subtotal: string, discount: string, deliveryCharge: string, currency: string, trackingNumber?: string | null, createdAt: any, deliveredAt?: any | null, cancelledAt?: any | null, cancellationReason?: string | null, items: Array<{ __typename?: 'OrderItemType', variantId?: string | null, quantity: number, price?: string | null, totalPrice?: string | null, name?: string | null, sku?: string | null, variant?: string | null, image?: string | null }>, payment?: { __typename?: 'OrderPaymentType', _id: string, status: PaymentStatus, method?: string | null, transactionId?: string | null, amount: string, paidAt?: any | null } | null, shippingAddress?: { __typename?: 'OrderShippingAddressType', fullName: string, phone: string, addressType?: string | null, addressLine1: string, addressLine2?: string | null, floor?: string | null, city: string, state: string, pincode: string, landmark?: string | null, formattedAddress?: string | null } | null, customer?: { __typename?: 'OrderCustomerType', _id: string, name: string, email?: string | null, phone?: string | null } | null }>, meta: { __typename?: 'PaginationMeta', totalCount: number, page: number, limit: number, totalPages: number } } };

export type CancelOrderMutationVariables = Exact<{
  input: CancelOrderInput;
}>;


export type CancelOrderMutation = { __typename?: 'Mutation', cancelOrder: { __typename?: 'OrderType', _id: string, orderId: string, orderStatus: OrderStatus, cancelledAt?: any | null, cancellationReason?: string | null } };

export type InitiatePaymentMutationVariables = Exact<{
  input: InitiatePaymentInput;
}>;


export type InitiatePaymentMutation = { __typename?: 'Mutation', initiatePayment: { __typename?: 'InitiatePaymentResponse', paymentOrderId: string, redirectUrl: string } };

export type GetPoliciesByTypeQueryVariables = Exact<{
  type: Scalars['String']['input'];
}>;


export type GetPoliciesByTypeQuery = { __typename?: 'Query', policiesByType: Array<{ __typename?: 'Policy', _id: string, title: string, content: string, type: string, createdAt: any, updatedAt: any, seo?: { __typename?: 'PolicySeo', metaTitle?: string | null, metaDescription?: string | null, metaKeywords?: Array<string> | null, canonicalUrl?: string | null, ogTitle?: string | null, ogDescription?: string | null, ogImage?: string | null } | null }> };

export type GetProductsByCategoryQueryVariables = Exact<{
  categoryId: Scalars['ID']['input'];
  pagination: PaginationInput;
}>;


export type GetProductsByCategoryQuery = { __typename?: 'Query', productsByCategory: { __typename?: 'PaginatedProducts', items: Array<{ __typename?: 'Product', _id: string, name: string, slug: string, description?: string | null, brand: string, currency: string, isArchived: boolean, favourite?: boolean | null, createdAt: any, updatedAt: any, defaultVariant?: { __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, discountSource: string, weight: number, weightUnit: string, packageSize: string, stockQuantity: number, availabilityStatus: string, thumbnailUrl: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> } | null, priceRange: { __typename?: 'PriceRange', min: number, max: number } }>, meta: { __typename?: 'PaginationMeta', totalCount: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetProductBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetProductBySlugQuery = { __typename?: 'Query', productBySlug?: { __typename?: 'Product', _id: string, name: string, slug: string, description?: string | null, shelfLife: string, isVegetarian: boolean, categoryIds: Array<string>, ingredients: string, seo?: { __typename?: 'ProductSeo', metaTitle?: string | null, metaDescription?: string | null, metaKeywords?: Array<string> | null, canonicalUrl?: string | null, ogTitle?: string | null, ogDescription?: string | null, ogImage?: string | null } | null, variants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, weight: number, weightUnit: string, packageSize: string, stockQuantity: number, availabilityStatus: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> }>, defaultVariant?: { __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, weight: number, weightUnit: string, packageSize: string, stockQuantity: number, availabilityStatus: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> } | null, priceRange: { __typename?: 'PriceRange', min: number, max: number }, availableVariants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, weight: number, weightUnit: string, packageSize: string, stockQuantity: number, availabilityStatus: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> }> } | null };

export type SearchProductsQueryVariables = Exact<{
  searchTerm: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
  nameOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type SearchProductsQuery = { __typename?: 'Query', searchProducts: { __typename?: 'PaginatedProducts', items: Array<{ __typename?: 'Product', _id: string, name: string, slug: string, description?: string | null, categoryIds: Array<string>, brand: string, currency: string, isArchived: boolean, favourite?: boolean | null, tags: Array<string>, createdAt: any, updatedAt: any, defaultVariant?: { __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, discountSource: string, weight: number, weightUnit: string, packageSize: string, length: number, height: number, breadth: number, stockQuantity: number, availabilityStatus: string, thumbnailUrl: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> } | null, availableVariants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, discountSource: string, weight: number, weightUnit: string, packageSize: string, length: number, height: number, breadth: number, stockQuantity: number, availabilityStatus: string, thumbnailUrl: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> }>, priceRange: { __typename?: 'PriceRange', min: number, max: number } }>, meta: { __typename?: 'PaginationMeta', totalCount: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GetAllProductsForSitemapDocument = new TypedDocumentString(`
    query GetAllProductsForSitemap {
  products(pagination: {page: 1, limit: 1000}) {
    items {
      slug
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<GetAllProductsForSitemapQuery, GetAllProductsForSitemapQueryVariables>;
export const GetAllCategoriesForSitemapDocument = new TypedDocumentString(`
    query GetAllCategoriesForSitemap {
  categories(pagination: {page: 1, limit: 1000}) {
    items {
      slug
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<GetAllCategoriesForSitemapQuery, GetAllCategoriesForSitemapQueryVariables>;
export const SearchPlacesDocument = new TypedDocumentString(`
    query SearchPlaces($query: String!, $sessionToken: String) {
  searchPlaces(input: {query: $query, sessionToken: $sessionToken}) {
    placeId
    description
    mainText
    secondaryText
  }
}
    `) as unknown as TypedDocumentString<SearchPlacesQuery, SearchPlacesQueryVariables>;
export const GetPlaceDetailsDocument = new TypedDocumentString(`
    query GetPlaceDetails($placeId: String!, $sessionToken: String) {
  getPlaceDetails(input: {placeId: $placeId, sessionToken: $sessionToken}) {
    placeId
    formattedAddress
    streetAddress
    locality
    region
    postalCode
    country
    latitude
    longitude
  }
}
    `) as unknown as TypedDocumentString<GetPlaceDetailsQuery, GetPlaceDetailsQueryVariables>;
export const GetMyAddressesDocument = new TypedDocumentString(`
    query GetMyAddresses {
  myAddresses {
    _id
    addressType
    recipientPhone
    recipientName
    buildingName
    floor
    streetArea
    landmark
    addressLocality
    addressRegion
    postalCode
    addressCountry
    isDefault
    latitude
    longitude
    formattedAddress
    placeId
  }
}
    `) as unknown as TypedDocumentString<GetMyAddressesQuery, GetMyAddressesQueryVariables>;
export const CreateAddressDocument = new TypedDocumentString(`
    mutation CreateAddress($input: CreateAddressInput!) {
  createAddress(input: $input) {
    _id
    addressType
    formattedAddress
    isDefault
  }
}
    `) as unknown as TypedDocumentString<CreateAddressMutation, CreateAddressMutationVariables>;
export const CheckPhoneExistsDocument = new TypedDocumentString(`
    query CheckPhoneExists($phoneNumber: String!) {
  checkPhoneExists(phoneNumber: $phoneNumber) {
    exists
    requiresLogin
    message
  }
}
    `) as unknown as TypedDocumentString<CheckPhoneExistsQuery, CheckPhoneExistsQueryVariables>;
export const AdminLogoutDocument = new TypedDocumentString(`
    mutation AdminLogout {
  adminLogout
}
    `) as unknown as TypedDocumentString<AdminLogoutMutation, AdminLogoutMutationVariables>;
export const UpdateUserDocument = new TypedDocumentString(`
    mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    _id
    firstName
    lastName
    email
    phoneNumber
    dateOfBirth
  }
}
    `) as unknown as TypedDocumentString<UpdateUserMutation, UpdateUserMutationVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    _id
    phoneNumber
    firstName
    lastName
    email
    dateOfBirth
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const GetActiveBannersDocument = new TypedDocumentString(`
    query GetActiveBanners {
  activeBanners {
    _id
    name
    headline
    subheadline
    description
    imageUrl
    mobileImageUrl
    thumbnailUrl
    url
    ctaText
    position
    isActive
    startDate
    endDate
    backgroundColor
    textColor
  }
}
    `) as unknown as TypedDocumentString<GetActiveBannersQuery, GetActiveBannersQueryVariables>;
export const GetMyCartDocument = new TypedDocumentString(`
    query GetMyCart {
  myCart {
    _id
    status
    couponCode
    items {
      productId
      variantId
      sku
      name
      quantity
      unitPrice
      totalPrice
      mrp
      imageUrl
      attributes
    }
    totalsSummary {
      subtotal
      discountAmount
      shippingCost
      estimatedTax
      handlingCharge
      grandTotal
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<GetMyCartQuery, GetMyCartQueryVariables>;
export const AddToCartDocument = new TypedDocumentString(`
    mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    _id
    items {
      productId
      name
      quantity
      unitPrice
      totalPrice
      attributes
    }
    totalsSummary {
      subtotal
      discountAmount
      grandTotal
    }
  }
}
    `) as unknown as TypedDocumentString<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = new TypedDocumentString(`
    mutation UpdateCartItem($input: UpdateCartItemInput!) {
  updateCartItem(input: $input) {
    _id
    items {
      productId
      quantity
      totalPrice
    }
    totalsSummary {
      grandTotal
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveFromCartDocument = new TypedDocumentString(`
    mutation RemoveFromCart($productId: ID!) {
  removeFromCart(productId: $productId) {
    _id
    items {
      productId
      name
      quantity
    }
    totalsSummary {
      grandTotal
    }
  }
}
    `) as unknown as TypedDocumentString<RemoveFromCartMutation, RemoveFromCartMutationVariables>;
export const SetShippingAddressDocument = new TypedDocumentString(`
    mutation SetShippingAddress($input: SetShippingAddressInput!) {
  setShippingAddress(input: $input) {
    _id
    shippingAddressId
    totalsSummary {
      subtotal
      discountAmount
      shippingCost
      estimatedTax
      handlingCharge
      grandTotal
    }
  }
}
    `) as unknown as TypedDocumentString<SetShippingAddressMutation, SetShippingAddressMutationVariables>;
export const GetRootCategoriesDocument = new TypedDocumentString(`
    query GetRootCategories($pagination: PaginationInput, $includeArchived: Boolean) {
  rootCategories(pagination: $pagination, includeArchived: $includeArchived) {
    items {
      id
      name
      slug
      imageUrl
      favourite
    }
    meta {
      totalCount
      totalPages
      page
      limit
      hasNextPage
      hasPreviousPage
    }
  }
}
    `) as unknown as TypedDocumentString<GetRootCategoriesQuery, GetRootCategoriesQueryVariables>;
export const GetCategoryWithProductsDocument = new TypedDocumentString(`
    query GetCategoryWithProducts($id: ID!, $includeArchived: Boolean) {
  category(id: $id, includeArchived: $includeArchived) {
    id
    name
    slug
    description
    imageUrl
    codeValue
    inCodeSet
    productCount
    isArchived
    favourite
    products {
      _id
      name
      slug
      brand
      defaultVariant {
        sku
        price
        mrp
        discountPercent
        thumbnailUrl
        availabilityStatus
        stockQuantity
      }
      availableVariants {
        _id
        sku
        price
        mrp
        packageSize
        weight
        weightUnit
      }
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<GetCategoryWithProductsQuery, GetCategoryWithProductsQueryVariables>;
export const GetCategoryBySlugDocument = new TypedDocumentString(`
    query GetCategoryBySlug($slug: String!, $includeArchived: Boolean) {
  categoryBySlug(slug: $slug, includeArchived: $includeArchived) {
    id
    name
    slug
    description
    productCount
    imageUrl
    seo {
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
    }
    products {
      _id
      name
      slug
      defaultVariant {
        thumbnailUrl
        price
        mrp
        packageSize
      }
      availableVariants {
        _id
        sku
        price
        mrp
        packageSize
        weight
        weightUnit
      }
      tags
    }
  }
}
    `) as unknown as TypedDocumentString<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>;
export const GetCategoryWithChildrenDocument = new TypedDocumentString(`
    query GetCategoryWithChildren($slug: String!, $includeArchived: Boolean) {
  categoryBySlug(slug: $slug, includeArchived: $includeArchived) {
    id
    name
    slug
    imageUrl
    children {
      id
      name
      slug
      imageUrl
      productCount
    }
  }
}
    `) as unknown as TypedDocumentString<GetCategoryWithChildrenQuery, GetCategoryWithChildrenQueryVariables>;
export const GetActiveCouponsDocument = new TypedDocumentString(`
    query GetActiveCoupons {
  activeCoupons {
    _id
    code
    description
    name
    discountType
    discountValue
    minCartValue
    endDate
  }
}
    `) as unknown as TypedDocumentString<GetActiveCouponsQuery, GetActiveCouponsQueryVariables>;
export const ApplyCouponDocument = new TypedDocumentString(`
    mutation ApplyCoupon($code: String!) {
  applyCoupon(code: $code) {
    _id
    couponCode
    totalsSummary {
      subtotal
      discountAmount
      grandTotal
    }
  }
}
    `) as unknown as TypedDocumentString<ApplyCouponMutation, ApplyCouponMutationVariables>;
export const RemoveCouponDocument = new TypedDocumentString(`
    mutation RemoveCoupon {
  removeCoupon {
    _id
    couponCode
    totalsSummary {
      subtotal
      discountAmount
      grandTotal
    }
  }
}
    `) as unknown as TypedDocumentString<RemoveCouponMutation, RemoveCouponMutationVariables>;
export const CreateGuestDocument = new TypedDocumentString(`
    mutation CreateGuest($input: CreateGuestInput!) {
  createGuest(input: $input) {
    _id
    guestId
    sessionId
  }
}
    `) as unknown as TypedDocumentString<CreateGuestMutation, CreateGuestMutationVariables>;
export const UpdateGuestDocument = new TypedDocumentString(`
    mutation UpdateGuest($id: ID!, $input: UpdateGuestInput!) {
  updateGuest(id: $id, input: $input) {
    _id
    lastActiveAt
  }
}
    `) as unknown as TypedDocumentString<UpdateGuestMutation, UpdateGuestMutationVariables>;
export const GetMyOrdersDocument = new TypedDocumentString(`
    query GetMyOrders($input: GetMyOrdersInput!) {
  getMyOrders(input: $input) {
    orders {
      _id
      orderId
      orderStatus
      totalAmount
      subtotal
      discount
      deliveryCharge
      currency
      trackingNumber
      createdAt
      deliveredAt
      cancelledAt
      cancellationReason
      items {
        variantId
        quantity
        price
        totalPrice
        name
        sku
        variant
        image
      }
      payment {
        _id
        status
        method
        transactionId
        amount
        paidAt
      }
      shippingAddress {
        fullName
        phone
        addressType
        addressLine1
        addressLine2
        floor
        city
        state
        pincode
        landmark
        formattedAddress
      }
      customer {
        _id
        name
        email
        phone
      }
    }
    meta {
      totalCount
      page
      limit
      totalPages
    }
  }
}
    `) as unknown as TypedDocumentString<GetMyOrdersQuery, GetMyOrdersQueryVariables>;
export const CancelOrderDocument = new TypedDocumentString(`
    mutation CancelOrder($input: CancelOrderInput!) {
  cancelOrder(input: $input) {
    _id
    orderId
    orderStatus
    cancelledAt
    cancellationReason
  }
}
    `) as unknown as TypedDocumentString<CancelOrderMutation, CancelOrderMutationVariables>;
export const InitiatePaymentDocument = new TypedDocumentString(`
    mutation InitiatePayment($input: InitiatePaymentInput!) {
  initiatePayment(input: $input) {
    paymentOrderId
    redirectUrl
  }
}
    `) as unknown as TypedDocumentString<InitiatePaymentMutation, InitiatePaymentMutationVariables>;
export const GetPoliciesByTypeDocument = new TypedDocumentString(`
    query GetPoliciesByType($type: String!) {
  policiesByType(type: $type) {
    _id
    title
    content
    type
    seo {
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<GetPoliciesByTypeQuery, GetPoliciesByTypeQueryVariables>;
export const GetProductsByCategoryDocument = new TypedDocumentString(`
    query GetProductsByCategory($categoryId: ID!, $pagination: PaginationInput!) {
  productsByCategory(categoryId: $categoryId, pagination: $pagination) {
    items {
      _id
      name
      slug
      description
      brand
      currency
      isArchived
      favourite
      createdAt
      updatedAt
      defaultVariant {
        _id
        sku
        name
        price
        mrp
        discountPercent
        discountSource
        weight
        weightUnit
        packageSize
        stockQuantity
        availabilityStatus
        images {
          url
          alt
        }
        thumbnailUrl
        isDefault
        isActive
      }
      priceRange {
        min
        max
      }
    }
    meta {
      totalCount
      page
      limit
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
}
    `) as unknown as TypedDocumentString<GetProductsByCategoryQuery, GetProductsByCategoryQueryVariables>;
export const GetProductBySlugDocument = new TypedDocumentString(`
    query GetProductBySlug($slug: String!) {
  productBySlug(slug: $slug) {
    _id
    name
    slug
    description
    shelfLife
    isVegetarian
    categoryIds
    ingredients
    seo {
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
    }
    variants {
      _id
      sku
      name
      price
      mrp
      discountPercent
      weight
      weightUnit
      packageSize
      stockQuantity
      availabilityStatus
      images {
        url
        alt
      }
      isDefault
      isActive
    }
    defaultVariant {
      _id
      sku
      name
      price
      mrp
      discountPercent
      weight
      weightUnit
      packageSize
      stockQuantity
      availabilityStatus
      images {
        url
        alt
      }
      isDefault
      isActive
    }
    priceRange {
      min
      max
    }
    availableVariants {
      _id
      sku
      name
      price
      mrp
      discountPercent
      weight
      weightUnit
      packageSize
      stockQuantity
      availabilityStatus
      images {
        url
        alt
      }
      isDefault
      isActive
    }
  }
}
    `) as unknown as TypedDocumentString<GetProductBySlugQuery, GetProductBySlugQueryVariables>;
export const SearchProductsDocument = new TypedDocumentString(`
    query SearchProducts($searchTerm: String!, $pagination: PaginationInput, $nameOnly: Boolean) {
  searchProducts(
    searchTerm: $searchTerm
    pagination: $pagination
    nameOnly: $nameOnly
  ) {
    items {
      _id
      name
      slug
      description
      categoryIds
      brand
      currency
      isArchived
      favourite
      tags
      createdAt
      updatedAt
      defaultVariant {
        _id
        sku
        name
        price
        mrp
        discountPercent
        discountSource
        weight
        weightUnit
        packageSize
        length
        height
        breadth
        stockQuantity
        availabilityStatus
        images {
          url
          alt
        }
        thumbnailUrl
        isDefault
        isActive
      }
      availableVariants {
        _id
        sku
        name
        price
        mrp
        discountPercent
        discountSource
        weight
        weightUnit
        packageSize
        length
        height
        breadth
        stockQuantity
        availabilityStatus
        images {
          url
          alt
        }
        thumbnailUrl
        isDefault
        isActive
      }
      priceRange {
        min
        max
      }
    }
    meta {
      totalCount
      page
      limit
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
}
    `) as unknown as TypedDocumentString<SearchProductsQuery, SearchProductsQueryVariables>;