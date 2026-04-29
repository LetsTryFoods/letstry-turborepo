import type { Metadata } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

const TITLE = "About Let's Try Foods – Healthy Indian Snacks Without Palm Oil";
const DESCRIPTION =
  "Let's Try Foods makes healthy Indian snacks with no palm oil and no maida. Founded in Delhi, we use sunflower and groundnut oil instead of palm oil across our bhujia, makhana, cookies and rusk ranges.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about-us` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/about-us`,
    type: 'website',
    siteName: "Let's Try Foods",
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
