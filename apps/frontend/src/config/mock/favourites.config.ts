import type { CategoryRaw } from "@/types/category.types";

const API_IMAGE_BASE =
  process.env.NEXT_PUBLIC_API_IMAGE_URL ??
  process.env.VITE_API_IMAGE_URL ??
  "https://d2tmwt8yl5m7qh.cloudfront.net";

export const favourites: CategoryRaw[] = [
  {
    id: 1,
    name: "Purani Delhi",
    img: `${API_IMAGE_BASE}/images/purani_delhi.webp`,
    href: "/purani-delhi",
  },
  {
    id: 2,
    name: "Indian Sweets",
    img: `${API_IMAGE_BASE}/images/indian_sweets.webp`,
    href: "/indian-sweets",
  },
  {
    id: 3,
    name: "Healthy Snacks",
    img: `${API_IMAGE_BASE}/images/makhana.webp`,
    href: "/healthy-snacks",
  },
  {
    id: 4,
    name: "Bhujia",
    img: `${API_IMAGE_BASE}/images/bhujia.webp`,
    href: "/bhujia",
  },
  {
    id: 5,
    name: "Munchies",
    img: `${API_IMAGE_BASE}/images/munchies.webp`,
    href: "/munchies",
  },
  {
    id: 6,
    name: "Fasting Special",
    img: `${API_IMAGE_BASE}/images/fasting_special.webp`,
    href: "/fasting-special",
  },
  {
    id: 7,
    name: "South Range",
    img: `${API_IMAGE_BASE}/images/south_range.webp`,
    href: "/south-range",
  },
  {
    id: 8,
    name: "Rusk",
    img: `${API_IMAGE_BASE}/images/rusk.webp`,
    href: "/rusk",
  },
  {
    id: 9,
    name: "Cookies",
    img: `${API_IMAGE_BASE}/images/cookies.webp`,
    href: "/cookies",
  },
  {
    id: 10,
    name: "Chips n Crisps",
    img: `${API_IMAGE_BASE}/images/chips_%26_crisps.webp`,
    href: "/chips-crisps",
  },
  {
    id: 11,
    name: "Cake & Muffins",
    img: `${API_IMAGE_BASE}/images/cakes.webp`,
    href: "/cakes",
  },
  {
    id: 12,
    name: "Pratham",
    img: `${API_IMAGE_BASE}/images/pratham.webp`,
    href: "/pratham",
  },
];

export default favourites;
