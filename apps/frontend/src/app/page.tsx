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


// export const revalidate = 86400;

// export const revalidate = 60;
export default async function Home() {
  const wholesomeChoicesData = await getWholesomeChoices();
  return (
    <main>
      <div
        style={{
          background: "linear-gradient(180deg, #F5F6F5 0%, #FCF3E3 45%, #C3E0C5 100%)",
        }}
      >
        <HeroCarousel />
        <CategoryGrid />
        <BestsellerCombo />
     

      </div>
   <BestsellerCarousel />
      <WhyChooseUs />
      <HealthySnacking />
      <WholesomeChoices categories={wholesomeChoicesData?.children || []} />
      <JourneyVideos />
      <CustomerTestimonials />
      <BrandSlider />
    </main>
  );
}
