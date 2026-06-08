import type { Metadata } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");

const TITLE =
  "Bulk & Corporate Orders – Healthy Snack Hampers | Let's Try Foods";
const DESCRIPTION =
  "Order Let's Try Foods snacks in bulk for corporate gifting, festive hampers, employee wellness and events. Healthy Indian snacks with no palm oil and no maida, shipped across India.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/bulk-corporate` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/bulk-corporate`,
    type: "website",
    siteName: "Let's Try Foods",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BulkCorporateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
