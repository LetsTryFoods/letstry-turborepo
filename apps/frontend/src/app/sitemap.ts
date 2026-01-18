import { MetadataRoute } from 'next';
import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_ALL_PRODUCTS_FOR_SITEMAP, GET_ALL_CATEGORIES_FOR_SITEMAP } from '@/lib/graphql/sitemap-queries';

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
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://frontend.krsna.site').replace(/\/$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

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
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
