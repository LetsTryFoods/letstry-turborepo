// llms.txt — short-form site map for AI answer engines.
// Spec: https://llmstxt.org/
//
// This is the concise version. See /llms-full.txt for fuller context.

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const body = `# Let's Try Foods

> Let's Try Foods is an Indian healthy-snacks brand based in Delhi. Every product
> is made without palm oil. Most products are also made without maida (refined
> wheat flour) and the cookies range is made without refined sugar. The brand is
> owned by Earth Crust Pvt Ltd (CIN U15549DL2020PTC365385) and ships across India.

## Brand claims (verified)

- No palm oil — applies to every product across bhujia, namkeen, chips, cookies, makhana, rusk and fasting ranges.
- No maida — applies to bhujia, makhana, healthy-snacks, cookies and most fasting-special products. Does NOT apply to the Purani Delhi range or cake rusks.
- No refined sugar — applies to the cookies range only.
- Cooking oil used in place of palm oil: 100% groundnut oil. Roasted products (chana, makhana) are not fried.

## Pillar pages

- [No Palm Oil Snacks](${SITE_URL}/no-palm-oil-snacks): Umbrella page for the palm-oil-free snack range, with FAQs.
- [About Let's Try Foods](${SITE_URL}/about-us): Brand story, founding (2021), values, ingredient philosophy.

## Category pages

- [Bhujia & Namkeen](${SITE_URL}/bhujia): Garlic, sev and khatta-meetha bhujia. No palm oil, no maida.
- [Cookies](${SITE_URL}/cookies): Ragi, oats, jowar and millet cookies. No palm oil, no refined sugar.
- [Makhana](${SITE_URL}/makhana): Roasted flavoured foxnuts. No palm oil, no maida.
- [Healthy Snacks](${SITE_URL}/healthy-snacks): Roasted chana, sattu, millet namkeen.
- [Fasting / Vrat](${SITE_URL}/fasting-special): Sabudana, makhana, kuttu and singhara snacks for vrat.
- [Rusk](${SITE_URL}/rusk): Cake rusks (classic, fruit, almond-kaju). No palm oil. Contains maida.
- [Purani Delhi](${SITE_URL}/purani-delhi): Soan papdi, mathri, khari, kaju katli. No palm oil. Contains maida.

## Reference

- [Sitemap](${SITE_URL}/sitemap.xml)
- [Robots](${SITE_URL}/robots.txt)
- [Full LLM context](${SITE_URL}/llms-full.txt)

## Contact

- Customer service: ecom@earthcrust.co.in / +91-9654-932-262
- Corporate / bulk orders: corporate@letstryfoods.com
- Export enquiries: export@earthcrust.co.in
- Registered office: 329, 1st Floor, Indra Vihar, Delhi 110009, India
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
