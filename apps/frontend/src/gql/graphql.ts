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

export type Cart = {
  __typename?: 'Cart';
  _id: Scalars['ID']['output'];
  couponCode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  identityId: Scalars['String']['output'];
  items: Array<CartItem>;
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
  codeValue: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  favourite?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  inCodeSet: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  productCount: Scalars['Float']['output'];
  products: Array<Product>;
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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

export type Coupon = {
  __typename?: 'Coupon';
  _id: Scalars['ID']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  discountType: DiscountType;
  discountValue: Scalars['Float']['output'];
  endDate: Scalars['DateTime']['output'];
  isActive: Scalars['Boolean']['output'];
  maxDiscountAmount?: Maybe<Scalars['Float']['output']>;
  minCartValue?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  startDate: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usageCount: Scalars['Int']['output'];
  usageLimit?: Maybe<Scalars['Int']['output']>;
};

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

export type CreateCategoryInput = {
  codeValue: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  favourite?: InputMaybe<Scalars['Boolean']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  inCodeSet: Scalars['String']['input'];
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
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
  endDate: Scalars['DateTime']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxDiscountAmount?: InputMaybe<Scalars['Float']['input']>;
  minCartValue?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  startDate: Scalars['DateTime']['input'];
  usageLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateGuestInput = {
  deviceInfo?: InputMaybe<Scalars['JSON']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePolicyInput = {
  content: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type CreateProductInput = {
  allergens?: InputMaybe<Scalars['String']['input']>;
  brand: Scalars['String']['input'];
  categoryId: Scalars['String']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
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

export enum DiscountType {
  Fixed = 'FIXED',
  Percentage = 'PERCENTAGE'
}

export type GeocodeAddressInput = {
  address: Scalars['String']['input'];
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

export type Mutation = {
  __typename?: 'Mutation';
  addProductVariant: Product;
  addToCart: Cart;
  adminLogin: Scalars['String']['output'];
  applyCoupon: Cart;
  archiveCategory: Category;
  archiveProduct: Product;
  clearCart: Cart;
  createAddress: Address;
  createAdmin: Scalars['String']['output'];
  createBanner: Banner;
  createCategory: Category;
  createCoupon: Coupon;
  createGuest: Guest;
  createOrUpdateCharges: Charges;
  createPolicy: Policy;
  createProduct: Product;
  deleteAddress: Address;
  deleteBanner: Banner;
  deletePolicy: Policy;
  deleteProduct: Product;
  removeCoupon: Cart;
  removeFromCart: Cart;
  removeProductVariant: Product;
  sendOtp: Scalars['String']['output'];
  setDefaultProductVariant: Product;
  unarchiveCategory: Category;
  unarchiveProduct: Product;
  updateAddress: Address;
  updateBanner: Banner;
  updateCartItem: Cart;
  updateCategory: Category;
  updateGuest: Guest;
  updatePolicy: Policy;
  updateProduct: Product;
  updateProductStock: Product;
  updateProductVariant: Product;
  updateProductVariantStock: Product;
  verifyOtpAndLogin: Scalars['String']['output'];
  verifyWhatsAppOtp: Scalars['String']['output'];
};


export type MutationAddProductVariantArgs = {
  input: CreateProductVariantInput;
  productId: Scalars['ID']['input'];
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


export type MutationCreatePolicyArgs = {
  input: CreatePolicyInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBannerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePolicyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveFromCartArgs = {
  productId: Scalars['ID']['input'];
};


export type MutationRemoveProductVariantArgs = {
  productId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationSendOtpArgs = {
  phoneNumber: Scalars['String']['input'];
};


export type MutationSetDefaultProductVariantArgs = {
  productId: Scalars['ID']['input'];
  variantId: Scalars['ID']['input'];
};


export type MutationUnarchiveCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnarchiveProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAddressArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAddressInput;
};


export type MutationUpdateBannerArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBannerInput;
};


export type MutationUpdateCartItemArgs = {
  input: UpdateCartItemInput;
};


export type MutationUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
};


export type MutationUpdateGuestArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGuestInput;
};


export type MutationUpdatePolicyArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePolicyInput;
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


export type MutationVerifyOtpAndLoginArgs = {
  idToken: Scalars['String']['input'];
  input?: InputMaybe<CreateUserInput>;
};


export type MutationVerifyWhatsAppOtpArgs = {
  input?: InputMaybe<CreateUserInput>;
  otp: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type PaginatedCategories = {
  __typename?: 'PaginatedCategories';
  items: Array<Category>;
  meta: PaginationMeta;
};

export type PaginatedProducts = {
  __typename?: 'PaginatedProducts';
  items: Array<Product>;
  meta: PaginationMeta;
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

export type PhoneCheckOutput = {
  __typename?: 'PhoneCheckOutput';
  exists: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  requiresLogin: Scalars['Boolean']['output'];
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

export type Policy = {
  __typename?: 'Policy';
  _id: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PriceRange = {
  __typename?: 'PriceRange';
  max: Scalars['Float']['output'];
  min: Scalars['Float']['output'];
};

export type Product = {
  __typename?: 'Product';
  _id: Scalars['ID']['output'];
  allergens?: Maybe<Scalars['String']['output']>;
  availableVariants: Array<ProductVariant>;
  brand: Scalars['String']['output'];
  category?: Maybe<Category>;
  categoryId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  defaultVariant?: Maybe<ProductVariant>;
  description: Scalars['String']['output'];
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
  metaKeywords: Array<Scalars['String']['output']>;
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
  getPlaceDetails: PlaceDetailsOutput;
  guest?: Maybe<Guest>;
  guestByGuestId?: Maybe<Guest>;
  hello: Scalars['String']['output'];
  myAddresses: Array<Address>;
  myCart?: Maybe<Cart>;
  policies: Array<Policy>;
  policiesByType: Array<Policy>;
  policy?: Maybe<Policy>;
  product?: Maybe<Product>;
  productBySlug?: Maybe<Product>;
  productVariant?: Maybe<ProductVariant>;
  products: PaginatedProducts;
  productsByCategory: PaginatedProducts;
  reverseGeocode: GoogleMapsAddressOutput;
  rootCategories: PaginatedCategories;
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


export type QueryGetPlaceDetailsArgs = {
  input: PlaceDetailsInput;
};


export type QueryGuestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGuestByGuestIdArgs = {
  guestId: Scalars['String']['input'];
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
  includeOutOfStock?: Scalars['Boolean']['input'];
  pagination?: PaginationInput;
};


export type QueryProductsByCategoryArgs = {
  categoryId: Scalars['ID']['input'];
  pagination?: PaginationInput;
};


export type QueryReverseGeocodeArgs = {
  input: ReverseGeocodeInput;
};


export type QueryRootCategoriesArgs = {
  includeArchived?: Scalars['Boolean']['input'];
  pagination?: PaginationInput;
};


export type QuerySearchPlacesArgs = {
  input: SearchPlacesInput;
};


export type QuerySearchProductsArgs = {
  pagination?: PaginationInput;
  searchTerm: Scalars['String']['input'];
};

export type ReverseGeocodeInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type SearchPlacesInput = {
  query: Scalars['String']['input'];
  sessionToken?: InputMaybe<Scalars['String']['input']>;
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
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGuestInput = {
  deviceInfo?: InputMaybe<Scalars['JSON']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePolicyInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductInput = {
  allergens?: InputMaybe<Scalars['String']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
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
  _id: Scalars['String']['input'];
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

export type GetMyCartQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyCartQuery = { __typename?: 'Query', myCart?: { __typename?: 'Cart', _id: string, status: CartStatus, couponCode?: string | null, createdAt: any, updatedAt: any, items: Array<{ __typename?: 'CartItem', productId: string, sku: string, name: string, quantity: number, unitPrice: number, totalPrice: number, mrp: number, imageUrl?: string | null, attributes?: any | null }>, totalsSummary: { __typename?: 'CartTotals', subtotal: number, discountAmount: number, shippingCost: number, estimatedTax: number, handlingCharge: number, grandTotal: number } } | null };

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

export type GetRootCategoriesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetRootCategoriesQuery = { __typename?: 'Query', rootCategories: { __typename?: 'PaginatedCategories', items: Array<{ __typename?: 'Category', id: string, name: string, slug: string, imageUrl?: string | null }>, meta: { __typename?: 'PaginationMeta', totalCount: number, totalPages: number, page: number, limit: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type GetCategoryWithProductsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCategoryWithProductsQuery = { __typename?: 'Query', category?: { __typename?: 'Category', id: string, name: string, slug: string, description?: string | null, imageUrl?: string | null, codeValue: string, inCodeSet: string, productCount: number, isArchived: boolean, favourite?: boolean | null, createdAt: any, updatedAt: any, products: Array<{ __typename?: 'Product', _id: string, name: string, slug: string, brand: string, defaultVariant?: { __typename?: 'ProductVariant', sku: string, price: number, mrp: number, discountPercent: number, thumbnailUrl: string, availabilityStatus: string, stockQuantity: number } | null, availableVariants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, price: number, mrp: number, packageSize: string, weight: number, weightUnit: string }> }> } | null };

export type GetCategoryBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCategoryBySlugQuery = { __typename?: 'Query', categoryBySlug?: { __typename?: 'Category', id: string, name: string, slug: string, productCount: number, products: Array<{ __typename?: 'Product', _id: string, name: string, slug: string, tags: Array<string>, defaultVariant?: { __typename?: 'ProductVariant', thumbnailUrl: string, price: number, mrp: number, packageSize: string } | null, availableVariants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, price: number, mrp: number, packageSize: string, weight: number, weightUnit: string }> }> } | null };

export type GetActiveCouponsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveCouponsQuery = { __typename?: 'Query', activeCoupons: Array<{ __typename?: 'Coupon', _id: string, code: string, description: string, name: string, discountType: DiscountType, discountValue: number, minCartValue?: number | null, endDate: any }> };

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

export type GetProductBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetProductBySlugQuery = { __typename?: 'Query', productBySlug?: { __typename?: 'Product', _id: string, name: string, slug: string, description: string, shelfLife: string, isVegetarian: boolean, ingredients: string, category?: { __typename?: 'Category', name: string, imageUrl?: string | null } | null, seo?: { __typename?: 'ProductSeo', metaTitle?: string | null, metaDescription?: string | null, metaKeywords: Array<string>, canonicalUrl?: string | null, ogTitle?: string | null, ogDescription?: string | null, ogImage?: string | null } | null, variants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, weight: number, weightUnit: string, packageSize: string, stockQuantity: number, availabilityStatus: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> }>, defaultVariant?: { __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, weight: number, weightUnit: string, packageSize: string, stockQuantity: number, availabilityStatus: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> } | null, priceRange: { __typename?: 'PriceRange', min: number, max: number }, availableVariants: Array<{ __typename?: 'ProductVariant', _id: string, sku: string, name: string, price: number, mrp: number, discountPercent: number, weight: number, weightUnit: string, packageSize: string, stockQuantity: number, availabilityStatus: string, isDefault: boolean, isActive: boolean, images: Array<{ __typename?: 'ProductImage', url: string, alt: string }> }> } | null };

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
export const GetMyCartDocument = new TypedDocumentString(`
    query GetMyCart {
  myCart {
    _id
    status
    couponCode
    items {
      productId
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
export const GetRootCategoriesDocument = new TypedDocumentString(`
    query GetRootCategories($pagination: PaginationInput, $includeArchived: Boolean) {
  rootCategories(pagination: $pagination, includeArchived: $includeArchived) {
    items {
      id
      name
      slug
      imageUrl
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
    productCount
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
export const GetProductBySlugDocument = new TypedDocumentString(`
    query GetProductBySlug($slug: String!) {
  productBySlug(slug: $slug) {
    _id
    name
    slug
    description
    shelfLife
    isVegetarian
    category {
      name
      imageUrl
    }
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