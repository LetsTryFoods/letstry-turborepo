export interface ComboRaw {
  id?: string | number | null;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  price?: number | string | null;
  images?: string[] | null;
  image?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  refundPolicy?: string | null;
  unit?: string[] | null;
  disclaimer?: string | null;
  flavour?: string | null;
  shelfLife?: string | null;
  dietPreference?: string | null;
  discountPercent?: number | null;
  discountedPrice?: number | null;
}

export interface Combo {
  id: string;
  name: string;
  title?: string;
  imageUrl?: string;
  price?: number | string;
  href?: string;
  description?: string;
  refundPolicy?: string;
  unit?: string[];
  disclaimer?: string;
  flavour?: string;
  shelfLife?: string;
  dietPreference?: string;
  discountPercent?: number;
  discountedPrice?: number;
}

export default Combo;
