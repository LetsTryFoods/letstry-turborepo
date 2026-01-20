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
      <HeroCarousel />
      <CategoryGrid />
      <BestsellerCombo />
      <BestsellerCarousel />
      <WhyChooseUs />
      <HealthySnacking />
      {/* <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold">Coming soon!!!!</h1>
      </div> */}
      <WholesomeChoices categories={wholesomeChoicesData?.children || []} />
      <JourneyVideos />
      <CustomerTestimonials />
      <BrandSlider />
    </main>
  );
}
