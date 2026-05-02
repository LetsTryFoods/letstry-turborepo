import { MetadataRoute } from 'next';
import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_ALL_PRODUCTS_FOR_SITEMAP, GET_ALL_CATEGORIES_FOR_SITEMAP } from '@/lib/graphql/sitemap-queries';
import { getActiveBlogs } from '@/lib/blog';
import { getActivePillars } from '@/lib/pillar';
import { getActiveAuthors } from '@/lib/author';

interface Product {
  slug: string;
  updatedAt: string;
}

interface Category {
  slug: string;
  updatedAt: string;
}

interface ProductsResponse {
  products: {
    items: Product[];
  };
}

interface CategoriesResponse {
  categories: {
    items: Category[];
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/bulk-corporate`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/combos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/no-palm-oil-snacks`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    // Sprint 4 — new E-E-A-T pages
    { url: `${baseUrl}/team`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/press`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/shipping-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/refund-cancellations`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];
  let pillarRoutes: MetadataRoute.Sitemap = [];
  let authorRoutes: MetadataRoute.Sitemap = [];

  const client = createServerGraphQLClient();

  try {
    const data = await client.request<ProductsResponse>(GET_ALL_PRODUCTS_FOR_SITEMAP);

    if (data?.products?.items) {
      productRoutes = data.products.items.map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  try {
    const data = await client.request<CategoriesResponse>(GET_ALL_CATEGORIES_FOR_SITEMAP);

    if (data?.categories?.items) {
      categoryRoutes = data.categories.items.map((category) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
  }

  try {
    const blogs = await getActiveBlogs();
    blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt ? new Date(blog.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Failed to fetch blogs for sitemap:', error);
  }

  try {
    const pillars = await getActivePillars();
    pillarRoutes = pillars.map((pillar) => ({
      url: `${baseUrl}/p/${pillar.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Failed to fetch pillars for sitemap:', error);
  }

  try {
    const authors = await getActiveAuthors();
    authorRoutes = authors.map((author) => ({
      url: `${baseUrl}/author/${author.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }));
  } catch (error) {
    console.error('Failed to fetch authors for sitemap:', error);
  }

  return [
    ...staticRoutes,
    ...pillarRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...authorRoutes,
  ];
}
