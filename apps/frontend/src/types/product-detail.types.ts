export interface ProductDetailRaw {
  id: string;
  name: string;
  description: {
    description: string;
    image?: string;
  };
  imageUrl: string;
  price: number;
  category: string;
  eanCode: number;
  subCategory: string;
  refundPolicy: string;
  unit: string;
  disclaimer: string;
  flavour: string;
  dietPreference: string;
  discountPercent?: number;
  discountedPrice?: number;
  ranges?: string[];
  newLaunch?: boolean;
  shelfLife?: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  descriptionImage?: string;
  imageUrl: string;
  price: number;
  category: string;
  subCategory: string;
  refundPolicy: string;
  unit: string;
  disclaimer: string;
  flavour: string;
  dietPreference: string;
  discountPercent?: number;
  discountedPrice?: number;
  ranges?: string[];
  newLaunch?: boolean;
  shelfLife?: string;
}
