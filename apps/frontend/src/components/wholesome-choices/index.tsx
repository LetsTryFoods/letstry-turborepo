import { WholesomeCarousel } from './wholesome-carousel';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount: number;
}

interface WholesomeChoicesProps {
  categories: Category[];
}

export function WholesomeChoices({ categories }: WholesomeChoicesProps) {
  const items = categories.map(cat => ({
    title: cat.name,
    name: cat.name,
    img: cat.imageUrl || 'https://d2tmwt8yl5m7qh.cloudfront.net/eaffe2ce9255d74a4ee81d3a20bdace9.webp',
    slug: cat.slug,
    hasRange: true,
  }));

  return (
    <section
      className="container py-8 md:py-12 lg:py-16 mx-auto"
    // style={{
    //   background:
    //     'linear-gradient(180deg, #FFFFFF 0%, #F3EEEA 40%, #F3EEEA 60%, #FFFFFF 100%)',
    // }}
    >
      <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black mb-6 mx-4">
        Wholesome Choices
      </h2>
      <WholesomeCarousel items={items} />
    </section>
  );
}
