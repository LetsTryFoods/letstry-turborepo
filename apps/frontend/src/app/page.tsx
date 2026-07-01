import type { Metadata } from "next";
import { HeroCarousel } from "@/components/hero-carousel";
import { CategoryGrid } from "@/components/category-grid";
import { BestsellerCarousel } from "@/components/bestseller";
import { BestsellerCombo } from "@/components/bestsellerCombo";
import { WhyChooseUs } from "@/components/why-choose-us";
import { HealthySnacking } from "@/components/healthy-snacking";
import { WholesomeChoices } from "@/components/wholesome-choices";
import JourneyVideos from "@/components/journey-videos/journeyVideos";
import CustomerTestimonials from "@/components/customer-testimonials/CustomerTestimonials";
import BrandSlider from "@/components/brand-slider/BrandSlider";
import { getWholesomeChoices } from "@/lib/category/get-wholesome-choices";
import { SaleSection } from "@/components/sale/sale-section";
import { SaleHeroBanner } from "@/components/sale/SaleHeroBanner";
import { SaleStrip } from "@/components/sale/SaleStrip";

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");

const HOME_TITLE =
  "Let's Try Foods | Healthy Indian Snacks — No Palm Oil, No Maida";
const HOME_DESCRIPTION =
  "Let's Try Foods — healthy Indian snacks with no palm oil and no maida. Shop bhujia, makhana, cookies, chikki, murukku, rusk and more. Shipped across India from Delhi.";

export const metadata: Metadata = {
  title: {
    absolute: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    siteName: "Let's Try Foods",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

// export const revalidate = 86400;

// export const revalidate = 60;
export default async function Home() {
  const wholesomeChoicesData = await getWholesomeChoices();
  return (
    <main>
      {/* Static sale banner — always visible above the carousel */}
      {/* <SaleHeroBanner /> */}
      <div
        style={{
          background:
            "linear-gradient(180deg, #F5F6F5 0%, #FCF3E3 45%, #C3E0C5 100%)",
        }}
      >
        <HeroCarousel />
        <CategoryGrid />
        <BestsellerCombo />
      </div>
      {/* Sale products section */}
      <SaleSection />
      <BestsellerCarousel />
      {/* Bold sale strip between sections */}
      <SaleStrip />
      <WhyChooseUs />
      <HealthySnacking />
      <WholesomeChoices categories={wholesomeChoicesData?.children || []} />
      <JourneyVideos />
      <CustomerTestimonials />
      <BrandSlider />
    </main>
  );
}


