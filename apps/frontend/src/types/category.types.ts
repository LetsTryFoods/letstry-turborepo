export interface CategoryRaw {
  id?: string | number | null;
  name: string;
  img: string;
  href?: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  href: string;
}