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

// export const revalidate = 86400;

// export const revalidate = 60;
export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <CategoryGrid />
      <BestsellerCombo />
      <BestsellerCarousel />
      <WhyChooseUs />
      <HealthySnacking />
      <WholesomeChoices />
      <JourneyVideos />
      <CustomerTestimonials />
      <BrandSlider />
    </main>
  );
}
