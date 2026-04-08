import { LandingPageSection, LandingProduct } from '@/lib/landing-page';
import { getCdnUrl } from '@/lib/image-utils';
import { LandingBanner } from './LandingBanner';
import { LandingContent } from './LandingContent';
import { LandingCTA } from './LandingCTA';
import { LandingFAQ } from './LandingFAQ';
import { LandingProducts } from './LandingProducts';
import { LandingTableOfContents } from './LandingTableOfContents';

interface SectionRendererProps {
  section: LandingPageSection;
  products?: LandingProduct[];
  tocSections?: LandingPageSection[];
}

export function SectionRenderer({ section, products = [], tocSections = [] }: SectionRendererProps) {
  if (!section.isActive) return null;

  switch (section.type) {
    case 'hero': {
      const tocItems = tocSections.map((s) => ({
        id: s.type === 'hero' ? 'banner' : `${s.type}-${s.position}`,
        label: s.title,
      }));
      return (
        <>
          <LandingBanner
            headline={section.title}
            subtext={section.subtitle || section.description || ''}
            ctaText={section.buttonText || 'Explore Our Range'}
            ctaLink={section.buttonLink || '#'}
            backgroundImage={getCdnUrl(section.imageUrl) || undefined}
          />
          {tocItems.length > 1 && <LandingTableOfContents items={tocItems} />}
        </>
      );
    }

    case 'content': {
      const blocks = section.description
        ? [{ heading: section.subtitle || '', body: section.description }]
        : [];
      return (
        <LandingContent
          title={section.title}
          blocks={blocks}
          sectionId={`content-${section.position}`}
        />
      );
    }

    case 'products': {
      const sectionProducts = section.productSlugs
        .map((slug) => products.find((p) => p.slug === slug))
        .filter(Boolean) as LandingProduct[];

      const mapped = sectionProducts.map((p) => ({
        name: p.name,
        slug: p.slug,
        image: getCdnUrl(p.defaultVariant?.thumbnailUrl) || '/placeholder-product.png',
        price: p.defaultVariant?.price ?? 0,
        mrp: p.defaultVariant?.mrp ?? undefined,
        websiteLink: `/product/${p.slug}`,
        otherPlatformLinks: section.platformLinks.map((pl) => ({
          platform: pl.platform,
          link: pl.url,
        })),
      }));

      return (
        <LandingProducts
          heading={section.title}
          products={mapped}
          sectionId={`products-${section.position}`}
        />
      );
    }

    case 'faq': {
      const faqs = section.description
        ? section.description.split('\n\n').reduce<{ question: string; answer: string }[]>((acc, block) => {
            const lines = block.split('\n').filter(Boolean);
            if (lines.length >= 1) {
              acc.push({ question: lines[0], answer: lines.slice(1).join('\n') || '' });
            }
            return acc;
          }, [])
        : [];
      return (
        <LandingFAQ
          heading={section.title}
          faqs={faqs}
          sectionId={`faq-${section.position}`}
        />
      );
    }

    case 'cta': {
      return (
        <LandingCTA
          headline={section.title}
          description={section.description || section.subtitle || ''}
          shopNowLink={section.buttonLink || '/products'}
          buyNowLink={section.buttonLink || '/products'}
          shopNowText={section.buttonText || 'Shop Now'}
          buyNowText="Buy on Amazon"
        />
      );
    }

    default:
      return (
        <section
          id={`${section.type}-${section.position}`}
          className="py-12 md:py-16"
          style={{ backgroundColor: section.backgroundColor || undefined }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
            {section.subtitle && (
              <p className="text-lg text-[#0C5273] mb-3">{section.subtitle}</p>
            )}
            {section.description && (
              <p className="text-gray-700 leading-relaxed">{section.description}</p>
            )}
            {section.buttonText && section.buttonLink && (
              <a
                href={section.buttonLink}
                className="mt-6 inline-block px-6 py-3 bg-[#0C5273] text-white rounded-full font-medium hover:bg-[#0a4560] transition-colors"
              >
                {section.buttonText}
              </a>
            )}
          </div>
        </section>
      );
  }
}
