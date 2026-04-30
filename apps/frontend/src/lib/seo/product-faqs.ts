/**
 * Data-driven FAQ generator for product detail pages.
 *
 * Why: every PDP should expose a small set of Q&A in FAQPage schema so AI
 * answer engines can quote the brand directly when shoppers ask about a
 * specific product. Hand-authoring per-product FAQs doesn't scale, so we
 * derive 3-5 questions from the product's own data (vegetarian / gluten-free /
 * shelf-life / category / palm-oil claim).
 *
 * The brand-claim matrix is honoured: "no maida" is suppressed for the Purani
 * Delhi and rusk ranges, "no refined sugar" is only emitted for the cookies
 * range, and "no palm oil" is universal.
 */

export interface ProductFaqInput {
  name: string;
  isVegetarian?: boolean | null;
  isGlutenFree?: boolean | null;
  shelfLife?: string | null;
  ingredients?: string | null;
  primaryCategorySlug?: string | null;
  primaryCategoryName?: string | null;
}

export interface ProductFaq {
  q: string;
  a: string;
}

// Categories where "no maida" CANNOT be claimed (products contain refined wheat flour).
const MAIDA_CONTAINING_SLUGS = new Set(['rusk', 'purani-delhi']);

// Categories where the cookies-only "no refined sugar" claim applies.
const NO_REFINED_SUGAR_SLUGS = new Set(['cookies']);

// Categories that are roasted (not fried) — palm-oil answer is phrased differently.
const ROASTED_SLUGS = new Set(['makhana']);

export function buildProductFaqs(input: ProductFaqInput): ProductFaq[] {
  const faqs: ProductFaq[] = [];
  const name = input.name;
  const slug = (input.primaryCategorySlug || '').toLowerCase();
  const isMaidaContaining = MAIDA_CONTAINING_SLUGS.has(slug);
  const canClaimNoRefinedSugar = NO_REFINED_SUGAR_SLUGS.has(slug);
  const isRoastedRange = ROASTED_SLUGS.has(slug) || /makhana|roasted chana/i.test(name);

  // 1. Palm-oil question — universal claim.
  if (isRoastedRange) {
    faqs.push({
      q: `Does ${name} contain palm oil?`,
      a: `No. ${name} is roasted, not fried, and is made without palm oil at any stage.`,
    });
  } else {
    faqs.push({
      q: `Does ${name} contain palm oil?`,
      a: `No. ${name} is made without palm oil. Let's Try Foods uses 100% groundnut oil for frying instead of palm oil.`,
    });
  }

  // 2. Maida question — only on ranges where the no-maida claim is valid.
  if (!isMaidaContaining) {
    faqs.push({
      q: `Is ${name} made without maida?`,
      a: `Yes. ${name} is part of the Let's Try Foods range that is made without maida (refined wheat flour). We use chickpea flour (besan), millet flours or rice flour instead.`,
    });
  }

  // 3. Refined sugar — cookies range only.
  if (canClaimNoRefinedSugar) {
    faqs.push({
      q: `Does ${name} contain refined sugar?`,
      a: `No. ${name} is made without refined white sugar. Refer to the ingredient label on the pack for the natural sweetener used.`,
    });
  }

  // 4. Vegetarian question — only if explicitly vegetarian.
  if (input.isVegetarian === true) {
    faqs.push({
      q: `Is ${name} vegetarian?`,
      a: `Yes. ${name} is 100% vegetarian. Every product from Let's Try Foods is vegetarian.`,
    });
  }

  // 5. Gluten-free question — only if explicitly gluten-free.
  if (input.isGlutenFree === true) {
    faqs.push({
      q: `Is ${name} gluten-free?`,
      a: `Yes. ${name} is gluten-free. Check the ingredient label on the pack for full allergen information.`,
    });
  }

  // 6. Shelf life question — only if we have data.
  if (input.shelfLife) {
    faqs.push({
      q: `What is the shelf life of ${name}?`,
      a: `${name} has a shelf life of ${input.shelfLife}. The exact best-before date is printed on each individual pack.`,
    });
  }

  // 7. Shipping — universal, last so it doesn't crowd out claims.
  faqs.push({
    q: `Where does Let's Try Foods ship ${name}?`,
    a: `${name} is shipped across India from the Let's Try Foods facility in Delhi. Bulk and corporate orders are available via corporate@letstryfoods.com.`,
  });

  // Cap at 5 to keep the page focused — first 5 questions are the most useful.
  return faqs.slice(0, 5);
}
