import type { Metadata } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");
const PAGE_URL = `${SITE_URL}/about-us`;

const TITLE = "About Let's Try Foods – Healthy Indian Snacks Without Palm Oil";
const DESCRIPTION =
  "Let's Try Foods makes healthy Indian snacks with no palm oil and no maida. Founded in Delhi, we use 100% groundnut oil instead of palm oil across our bhujia, makhana, cookies and rusk ranges.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
    siteName: "Let's Try Foods",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${PAGE_URL}#aboutpage`,
  url: PAGE_URL,
  name: TITLE,
  description: DESCRIPTION,
  inLanguage: "en-IN",
  isPartOf: { "@id": `${SITE_URL}#website` },
  about: { "@id": `${SITE_URL}#organization` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.webp`,
  },
  mainEntity: {
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "Let's Try Foods",
    legalName: "Earth Crust Pvt Ltd",
    foundingDate: "2021",
    foundingLocation: { "@type": "Place", name: "Delhi, India" },
    description:
      "Let's Try Foods was started in 2021 in Delhi after the founders realised that mass-market Indian snacks were almost all fried in palm oil and made with maida. The brand makes traditional Indian snacks — bhujia, namkeen, cookies, makhana, rusk and Purani Delhi favourites — using 100% groundnut oil and millet flours in place of palm oil and refined wheat flour.",
    knowsAbout: [
      "palm-oil-free Indian snacks",
      "no-maida namkeen",
      "healthy Indian cookies",
      "roasted makhana",
      "traditional Indian namkeen",
    ],
    award: ["FSSAI-licensed manufacturer"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "About Us", item: PAGE_URL },
  ],
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
