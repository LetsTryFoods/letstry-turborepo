import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

  const sharedDisallow = [
    '/dashboard/',
    '/auth/',
    '/api/',
    '/admin/',
    '/profile/',
    '/address/',
    '/order-success/',
    '/payment-callback/',
    '/payment-failed/',
    '/track/',
  ];

  // Explicit allow-list for major AI / answer-engine crawlers.
  // Why: AEO citations depend on these bots being able to fetch product, FAQ
  // and pillar pages. Listing them by name makes intent unambiguous (vs.
  // relying on the generic '*' rule).
  const aiBots = [
    'GPTBot',          // OpenAI training crawler
    'OAI-SearchBot',   // OpenAI live-search crawler (ChatGPT Search)
    'ChatGPT-User',    // ChatGPT user-initiated browsing
    'ClaudeBot',       // Anthropic Claude crawler
    'Claude-Web',      // Anthropic Claude (legacy)
    'anthropic-ai',    // Anthropic Claude (alt UA)
    'PerplexityBot',   // Perplexity AI crawler
    'Perplexity-User', // Perplexity user-initiated fetches
    'Google-Extended', // Google AI training (separate from Googlebot)
    'CCBot',           // Common Crawl (used by many AI corpora)
    'Applebot-Extended', // Apple Intelligence
    'Bytespider',      // ByteDance / TikTok AI
    'Meta-ExternalAgent', // Meta AI
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: sharedDisallow,
      },
      ...aiBots.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: sharedDisallow,
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
