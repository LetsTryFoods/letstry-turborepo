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
  // Sprint 4 — additional context that lets the generator emit more
  // intent-matching questions. All optional; safe to omit.
  audience?: string[] | null;
  occasions?: string[] | null;
  proteinContent?: string | null;
  caloriesPerServing?: string | null;
  // CMS-authored FAQs that should be merged INTO the generated set.
  // Authored entries win on duplicate questions.
  cmsFaqs?: { question: string; answer: string }[] | null;
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

// Categories that are vrat / fasting suitable — surface a Navratri FAQ.
const VRAT_SLUGS = new Set(['fasting-special']);

// Slugs that match the cookies range for diabetic-friendly questions.
const DIABETIC_FRIENDLY_SLUGS = new Set(['cookies', 'healthy-snacks']);

export function buildProductFaqs(input: ProductFaqInput): ProductFaq[] {
  const faqs: ProductFaq[] = [];
  const name = input.name;
  const slug = (input.primaryCategorySlug || '').toLowerCase();
  const isMaidaContaining = MAIDA_CONTAINING_SLUGS.has(slug);
  const canClaimNoRefinedSugar = NO_REFINED_SUGAR_SLUGS.has(slug);
  const isRoastedRange = ROASTED_SLUGS.has(slug) || /makhana|roasted chana/i.test(name);
  const isVratRange = VRAT_SLUGS.has(slug) || (input.occasions || []).some((o) => /vrat|navratri|fasting/i.test(o));
  const isKidsAudience = (input.audience || []).some((a) => /kid|child|family/i.test(a));
  const isFitnessAudience = (input.audience || []).some((a) => /fitness|protein|workout|gym/i.test(a));
  const isDiabeticAudience = (input.audience || []).some((a) => /diabet/i.test(a)) || DIABETIC_FRIENDLY_SLUGS.has(slug);
  const isGiftingOccasion = (input.occasions || []).some((o) => /gift|diwali|rakhi|festive|corporate/i.test(o));

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

  // 7. Vrat / Navratri suitability — only for the fasting range or when the
  //    content team has tagged the product with a vrat occasion. We never
  //    invent a vrat claim from category alone; the brand-claim matrix
  //    requires explicit confirmation.
  if (isVratRange) {
    faqs.push({
      q: `Is ${name} suitable for Navratri vrat / fasting?`,
      a: `Yes. ${name} is part of the Let's Try Foods fasting range and is suitable for Navratri vrat. Check the ingredient label on each pack to confirm vrat-suitability for your specific tradition.`,
    });
  }

  // 8. Kids — only when the content team has tagged a kids audience.
  if (isKidsAudience) {
    faqs.push({
      q: `Can my child eat ${name}?`,
      a: `${name} is made without palm oil and (depending on the variant) without maida or refined sugar, which makes it a more wholesome snack option for children. Always check the allergen information on the pack and use age-appropriate portion sizes.`,
    });
  }

  // 9. Fitness / protein — only when tagged or protein content is set.
  if (isFitnessAudience || input.proteinContent) {
    const proteinLine = input.proteinContent
      ? ` Each 100g delivers ${input.proteinContent} of protein.`
      : '';
    faqs.push({
      q: `Is ${name} good for fitness or post-workout snacking?`,
      a: `${name} fits well into a fitness-focused snacking routine because it's free of palm oil and (where applicable) maida.${proteinLine} Pair with fruit or yogurt for a balanced post-workout option.`,
    });
  }

  // 10. Diabetic-friendly — only when tagged. We avoid blanket "diabetic-safe"
  //     claims in line with the no-fabricated-claims rule.
  if (isDiabeticAudience && canClaimNoRefinedSugar) {
    faqs.push({
      q: `Is ${name} diabetic-friendly?`,
      a: `${name} is made without refined white sugar, which can make it a more thoughtful choice for those managing blood sugar. We always recommend consulting your dietitian about portion sizes for any snack.`,
    });
  }

  // 11. Corporate / festive gifting — only when tagged.
  if (isGiftingOccasion) {
    faqs.push({
      q: `Is ${name} good for Diwali or corporate gifting?`,
      a: `Yes. ${name} is regularly chosen for Diwali, Rakhi and corporate gifting because it's a healthier alternative to mass-market snacks. For bulk gifting orders, contact corporate@letstryfoods.com.`,
    });
  }

  // 12. Shipping — universal, last so it doesn't crowd out claims.
  faqs.push({
    q: `Where does Let's Try Foods ship ${name}?`,
    a: `${name} is shipped across India from the Let's Try Foods facility in Delhi. Bulk and corporate orders are available via corporate@letstryfoods.com.`,
  });

  // Merge CMS-authored FAQs. Authored entries override the generator on
  // duplicate questions (case-insensitive).
  const merged = mergeWithCmsFaqs(faqs, input.cmsFaqs);

  // Cap at 8 — 8 is the sweet spot for FAQPage rich result eligibility
  // without crowding the page.
  return merged.slice(0, 8);
}

function mergeWithCmsFaqs(
  generated: ProductFaq[],
  cms?: { question: string; answer: string }[] | null,
): ProductFaq[] {
  if (!cms || cms.length === 0) return generated;

  const cmsByKey = new Map<string, ProductFaq>();
  cms.forEach((entry) => {
    if (entry.question && entry.answer) {
      cmsByKey.set(entry.question.trim().toLowerCase(), {
        q: entry.question.trim(),
        a: entry.answer.trim(),
      });
    }
  });

  // Replace generated entries whose question text matches CMS entries;
  // append the rest of the CMS entries to the end.
  const usedKeys = new Set<string>();
  const merged = generated.map((g) => {
    const key = g.q.trim().toLowerCase();
    const cmsEntry = cmsByKey.get(key);
    if (cmsEntry) {
      usedKeys.add(key);
      return cmsEntry;
    }
    return g;
  });

  cmsByKey.forEach((entry, key) => {
    if (!usedKeys.has(key)) merged.push(entry);
  });

  return merged;
}
