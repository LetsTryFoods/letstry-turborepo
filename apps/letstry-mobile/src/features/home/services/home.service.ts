import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { 
  GET_ACTIVE_BANNERS, 
  GET_ROOT_CATEGORIES, 
  GET_CATEGORY_BY_SLUG, 
  GET_PRODUCTS_BY_CATEGORY 
} from '../../../lib/graphql/home';

export class HomeService {
  constructor(private client: ApolloClient<NormalizedCacheObject>) {}

  async getActiveBanners() {
    const { data } = await this.client.query({
      query: GET_ACTIVE_BANNERS,
      fetchPolicy: 'cache-first',
    });
    return data.activeBanners || [];
  }

  async getHomeCategories() {
    const { data } = await this.client.query({
      query: GET_ROOT_CATEGORIES,
      variables: {
        pagination: { limit: 100, page: 1 },
      },
    });
    return data.rootCategories?.items?.filter((c: any) => c.favourite) || [];
  }

  async getProductsBySlug(slug: string, limit: number = 20) {
    try {
      // 1. Get Category ID by Slug
      const { data: catData } = await this.client.query({
        query: GET_CATEGORY_BY_SLUG,
        variables: { slug },
      });

      const categoryId = catData.categoryBySlug?.id;
      if (!categoryId) return [];

      // 2. Get Products by Category ID
      const { data: prodData } = await this.client.query({
        query: GET_PRODUCTS_BY_CATEGORY,
        variables: {
          categoryId,
          pagination: { page: 1, limit },
        },
      });

      return prodData.productsByCategory?.items || [];
    } catch (error) {
      console.error(`[HomeService] Error fetching products for slug ${slug}:`, error);
      return [];
    }
  }
}
