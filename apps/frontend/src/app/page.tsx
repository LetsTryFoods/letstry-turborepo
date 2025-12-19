import { HeroCarousel } from "@/components/hero-carousel";
import { CategoryGrid } from "@/components/category-grid";
import { BestsellerCarousel } from "@/components/bestseller";
import { WhyChooseUs } from "@/components/why-choose-us";
import { HealthySnacking } from "@/components/healthy-snacking";

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <CategoryGrid />
      <BestsellerCarousel />
      <WhyChooseUs />
      <HealthySnacking />
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold">Coming soon!!!!</h1>
      </div>
    </main>
  );
}
