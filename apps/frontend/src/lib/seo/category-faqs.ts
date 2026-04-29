/**
 * Hand-written FAQs for top category pages.
 *
 * Why: AI answer engines (ChatGPT Search, Perplexity, Google AI Overviews)
 * favour pages that expose direct Q&A with FAQPage schema. We have one
 * pillar page with this pattern (/no-palm-oil-snacks) — this map extends
 * the same treatment to the high-traffic category slugs.
 *
 * Brand-claim matrix is honoured per slug (see seo/overrides.ts):
 *   - "No Palm Oil" is universal.
 *   - "No Maida" is NOT used on Purani Delhi or Rusk.
 *   - "No Refined Sugar" is only used on the Cookies range.
 */

export interface CategoryFaq {
  q: string;
  a: string;
}

export interface CategoryFaqBlock {
  // Short intro paragraph (≈40-60 words) used as an "answer box" above the
  // product grid. AI engines often quote this verbatim in summaries.
  intro: string;
  faqs: CategoryFaq[];
}

export const categoryFaqs: Record<string, CategoryFaqBlock> = {
  bhujia: {
    intro:
      "Let's Try Foods bhujia is a range of traditional Indian namkeen made without palm oil and without maida. Our garlic, sev and khatta-meetha bhujia are fried in 100% groundnut oil and use chickpea flour (besan) instead of refined wheat flour. Shipped across India from Delhi.",
    faqs: [
      {
        q: 'Does Let\'s Try Foods bhujia contain palm oil?',
        a: 'No. Let\'s Try Foods bhujia is made without palm oil. We use 100% groundnut oil for frying instead.',
      },
      {
        q: 'Is Let\'s Try Foods bhujia made with maida?',
        a: 'No. Our bhujia range is made with chickpea flour (besan) and is free of maida (refined wheat flour).',
      },
      {
        q: 'What types of bhujia does Let\'s Try Foods sell?',
        a: 'Let\'s Try Foods sells garlic bhujia, sev bhujia, khatta-meetha mixture, navratan mixture, kerala garlic mixture and several other namkeen variants — all without palm oil or maida.',
      },
      {
        q: 'Is Let\'s Try Foods bhujia vegetarian?',
        a: 'Yes. Every bhujia and namkeen product from Let\'s Try Foods is 100% vegetarian.',
      },
      {
        q: 'Where does Let\'s Try Foods bhujia ship?',
        a: 'Let\'s Try Foods ships bhujia and namkeen across India from its Delhi facility. Bulk and corporate orders are available via corporate@letstryfoods.com.',
      },
    ],
  },

  cookies: {
    intro:
      "Let's Try Foods cookies are healthy Indian biscuits made without palm oil, without maida and without refined sugar. The range uses ragi, oats, jowar and other millet flours instead of refined wheat flour. Shipped across India.",
    faqs: [
      {
        q: 'Are Let\'s Try Foods cookies free of palm oil?',
        a: 'Yes. Every cookie in the Let\'s Try Foods range is made without palm oil. We use healthier oils and butter alternatives instead.',
      },
      {
        q: 'Do Let\'s Try Foods cookies contain refined sugar?',
        a: 'No. Let\'s Try Foods cookies are made without refined white sugar. Refer to each product\'s ingredient label for the natural sweetener used.',
      },
      {
        q: 'Are Let\'s Try Foods cookies maida-free?',
        a: 'Yes. Our cookies are made with millet flours such as ragi, oats and jowar — not maida (refined wheat flour).',
      },
      {
        q: 'Which millet cookies does Let\'s Try Foods make?',
        a: 'Our range includes ragi kaju-pista cookies, oats coconut cookies, oats choco chip cookies and jowar-based cookies — all palm-oil-free and refined-sugar-free.',
      },
      {
        q: 'Can diabetics eat Let\'s Try Foods cookies?',
        a: 'Our cookies are made without refined white sugar, but they still contain natural carbohydrates and sweeteners. Diabetic shoppers should check the nutrition label on each pack and consult their doctor before adding them to a regular diet.',
      },
    ],
  },

  makhana: {
    intro:
      "Let's Try Foods makhana is roasted — never fried — and is made without palm oil. Our flavoured foxnuts come in peri peri, pudina, Himalayan salt and lime chilli, with no maida and no artificial preservatives. Shipped across India.",
    faqs: [
      {
        q: 'Is Let\'s Try Foods makhana fried in palm oil?',
        a: 'No. Our flavoured makhana is roasted, not fried. There is no palm oil at any stage of the process.',
      },
      {
        q: 'What makhana flavours does Let\'s Try Foods offer?',
        a: 'Let\'s Try Foods offers peri peri makhana, pudina makhana, Himalayan salt makhana and lime chilli makhana, among other roasted foxnut variants.',
      },
      {
        q: 'Is roasted makhana healthier than fried snacks?',
        a: 'Roasted makhana (foxnut) is naturally low in fat, contains plant protein and is gluten-free. Roasting (rather than frying) avoids the added fat and oil that traditional namkeen carries.',
      },
      {
        q: 'Are Let\'s Try Foods makhana products gluten-free?',
        a: 'Yes. Foxnuts are naturally gluten-free, and our flavour seasonings do not contain wheat or maida.',
      },
      {
        q: 'How long do Let\'s Try Foods makhana stay fresh?',
        a: 'Each pack carries an individual best-before date. Roasted makhana typically stays fresh for several months in a sealed pack — refer to the packaging for the exact shelf life.',
      },
    ],
  },

  namkeen: {
    intro:
      "Let's Try Foods namkeen is a range of traditional Indian savoury snacks made without palm oil. Bhujia, mixtures, boondi and murukku are fried in 100% groundnut oil; roasted variants (chana, makhana) use no frying oil at all. Shipped across India.",
    faqs: [
      {
        q: 'Is Let\'s Try Foods namkeen palm-oil-free?',
        a: 'Yes. Every namkeen, bhujia and mixture from Let\'s Try Foods is made without palm oil. 100% groundnut oil is used in the fried items; roasted chana and roasted makhana use no frying oil.',
      },
      {
        q: 'Which namkeen products are also maida-free?',
        a: 'The bhujia range, mixtures (navratan, kerala garlic, sabudana, khatta-meetha), boondi and roasted snacks are all maida-free. The Purani Delhi range (mathri, khari, soan papdi) does contain maida.',
      },
      {
        q: 'What is the most popular namkeen at Let\'s Try Foods?',
        a: 'Garlic bhujia, khatta-meetha mixture, peri peri makhana and roasted chana are among the bestsellers in the Let\'s Try Foods namkeen range.',
      },
      {
        q: 'Is Let\'s Try Foods namkeen suitable for vrat / fasting?',
        a: 'A subset of products are vrat-friendly: sabudana mixture, vrat mota chips, makhana and singhara-based snacks are listed under the fasting-special category.',
      },
      {
        q: 'How is Let\'s Try Foods namkeen packaged for shipping?',
        a: 'Each pack is sealed for freshness and shipped across India from our Delhi facility. Bulk and corporate orders are available via corporate@letstryfoods.com.',
      },
    ],
  },

  'healthy-snacks': {
    intro:
      "Let's Try Foods healthy snacks are Indian savoury snacks made without palm oil and without maida. The range includes roasted chana, sattu, millet-based namkeen and roasted makhana — high-protein, traditional snacks for everyday eating. Shipped across India.",
    faqs: [
      {
        q: 'What makes Let\'s Try Foods snacks healthier than typical Indian namkeen?',
        a: 'Three things: no palm oil (we use 100% groundnut oil, or no oil at all in roasted products), no maida (we use besan and millet flours), and no artificial preservatives or trans fats.',
      },
      {
        q: 'Are Let\'s Try Foods healthy snacks high in protein?',
        a: 'Several of our snacks are naturally high in plant protein — roasted chana, sattu and roasted makhana are the most protein-dense items in the range.',
      },
      {
        q: 'Are Let\'s Try Foods snacks gluten-free?',
        a: 'Most of our healthy snacks (roasted chana, sattu, makhana, millet namkeen) are gluten-free. Products containing wheat (rusk, Purani Delhi mathri/khari) are NOT gluten-free — check the label.',
      },
      {
        q: 'Are these snacks suitable for kids?',
        a: 'Yes. Let\'s Try Foods was started by parents looking for clean-label snacks for their own kids. Avoiding palm oil, maida, refined sugar and trans fats was the founding principle.',
      },
      {
        q: 'How can I order Let\'s Try Foods healthy snacks online?',
        a: 'Order any healthy snack on letstryfoods.com — we ship across India from Delhi. Combos and corporate gift hampers are also available.',
      },
    ],
  },

  rusk: {
    intro:
      "Let's Try Foods cake rusks are made without palm oil. The range includes classic, fruit and almond-kaju cake rusks. Note: cake rusks contain refined wheat flour (maida), so the brand's no-maida claim does not apply to this category.",
    faqs: [
      {
        q: 'Are Let\'s Try Foods rusks made without palm oil?',
        a: 'Yes. Every rusk and cake rusk in the Let\'s Try Foods range is made without palm oil.',
      },
      {
        q: 'Do Let\'s Try Foods rusks contain maida?',
        a: 'Yes. Cake rusks are made with refined wheat flour (maida). The brand\'s no-maida claim applies to bhujia, namkeen, makhana and cookies — not to the rusk range.',
      },
      {
        q: 'What flavours of cake rusk are available?',
        a: 'Let\'s Try Foods offers classic cake rusk, fruit cake rusk and almond-kaju cake rusk.',
      },
      {
        q: 'Are Let\'s Try Foods rusks vegetarian?',
        a: 'Yes. All Let\'s Try Foods rusks are 100% vegetarian.',
      },
      {
        q: 'How long do cake rusks stay fresh?',
        a: 'Each pack has an individual best-before date printed on the packaging — check the pack for shelf life and storage instructions.',
      },
    ],
  },

  'fasting-special': {
    intro:
      "Let's Try Foods fasting-special snacks are vrat-friendly Indian snacks made without palm oil and without maida. The range includes sabudana mixture, vrat mota chips, makhana and kuttu / singhara variants for Navratri and other fasts. Shipped across India.",
    faqs: [
      {
        q: 'Are Let\'s Try Foods vrat snacks Navratri-approved?',
        a: 'Yes. The fasting-special range is formulated specifically for vrat and Navratri — sabudana, makhana, kuttu and singhara base ingredients are used, with no palm oil and no maida.',
      },
      {
        q: 'Which oil is used in Let\'s Try Foods vrat chips?',
        a: 'Let\'s Try Foods vrat chips use groundnut oil, not palm oil. Roasted makhana uses no frying oil at all.',
      },
      {
        q: 'Are these snacks suitable for Ekadashi or Janmashtami fasting?',
        a: 'The fasting-special category uses vrat-permitted ingredients (sabudana, makhana, kuttu, singhara, sendha namak). Different fasting traditions vary — please check ingredient labels against your specific fast.',
      },
      {
        q: 'Do Let\'s Try Foods vrat snacks use rock salt?',
        a: 'Yes. Vrat-specific products use sendha namak (rock salt) instead of regular table salt where required by fasting tradition.',
      },
      {
        q: 'Can vrat snacks be eaten outside fasting periods?',
        a: 'Yes — they are simply healthy Indian snacks made with traditional ingredients. Many customers eat them year-round, not just during fasts.',
      },
    ],
  },

  'purani-delhi': {
    intro:
      "Let's Try Foods Purani Delhi is a range of traditional Indian sweets and savoury snacks made without palm oil. The range includes soan papdi, methi mathri, khari and kaju katli. Note: Purani Delhi products contain refined wheat flour (maida) — the brand's no-maida claim does not apply to this range.",
    faqs: [
      {
        q: 'Is the Purani Delhi range palm-oil-free?',
        a: 'Yes. Every product in the Purani Delhi range is made without palm oil.',
      },
      {
        q: 'Does the Purani Delhi range contain maida?',
        a: 'Yes. Soan papdi, mathri, khari and the kaju katli base contain refined wheat flour (maida). The brand\'s no-maida claim does NOT apply to this range — we want to be transparent about this.',
      },
      {
        q: 'What is in the Purani Delhi range?',
        a: 'The range covers traditional Old Delhi-style snacks and sweets: soan papdi, methi mathri, plain mathri, khari biscuits and kaju katli (cashew fudge).',
      },
      {
        q: 'Are Purani Delhi snacks vegetarian?',
        a: 'Yes. All Purani Delhi range products are 100% vegetarian.',
      },
      {
        q: 'How long do Purani Delhi sweets and snacks stay fresh?',
        a: 'Each pack carries an individual best-before date — refer to the packaging for the exact shelf life and storage instructions.',
      },
    ],
  },
};

export function getCategoryFaqs(slug: string): CategoryFaqBlock | undefined {
  return categoryFaqs[slug.toLowerCase()];
}
