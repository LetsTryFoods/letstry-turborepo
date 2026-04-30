import type { Metadata } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

const TITLE = "Contact Let's Try Foods – Customer Care, Delhi";
const DESCRIPTION =
  "Get in touch with Let's Try Foods for orders, customer support, bulk enquiries or export queries. Based in Delhi, shipping across India.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/contact-us` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/contact-us`,
    type: 'website',
    siteName: "Let's Try Foods",
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
