import { useQuery } from '@apollo/client';
import { 
  GET_ACTIVE_BANNERS, 
  GET_ROOT_CATEGORIES, 
  GET_CATEGORY_BY_SLUG, 
  GET_PRODUCTS_BY_CATEGORY 
} from '../../../lib/graphql/home';

export const useHomeData = () => {
  const { data: bannerData, loading: bannersLoading, refetch: refetchBanners } = useQuery(GET_ACTIVE_BANNERS);
  const { data: catData, loading: categoriesLoading, refetch: refetchCategories } = useQuery(GET_ROOT_CATEGORIES, {
    variables: { pagination: { limit: 100, page: 1 } }
  });

  // Fetch Bestsellers
  const { data: bestsellerCat } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug: 'best-selling' }
  });
  const { data: bestsellerData, loading: bestsellersLoading, refetch: refetchBestsellers } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId: bestsellerCat?.categoryBySlug?.id, pagination: { limit: 20, page: 1 } },
    skip: !bestsellerCat?.categoryBySlug?.id
  });

  // Fetch Combos
  const { data: comboCat } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug: 'bestselling-combos' }
  });
  const { data: comboData, loading: combosLoading, refetch: refetchCombos } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId: comboCat?.categoryBySlug?.id, pagination: { limit: 20, page: 1 } },
    skip: !comboCat?.categoryBySlug?.id
  });

  const refetch = async () => {
    await Promise.all([
      refetchBanners(),
      refetchCategories(),
      refetchBestsellers?.(),
      refetchCombos?.()
    ]);
  };

  return {
    banners: bannerData?.activeBanners || [],
    favoriteCategories: catData?.rootCategories?.items?.filter((c: any) => c.favourite) || [],
    allCategories: catData?.rootCategories?.items || [],
    categories: catData?.rootCategories?.items?.filter((c: any) => c.favourite) || [],
    bestsellers: bestsellerData?.productsByCategory?.items || [],
    bestsellerCategoryId: bestsellerCat?.categoryBySlug?.id,
    combos: comboData?.productsByCategory?.items || [],
    combosCategoryId: comboCat?.categoryBySlug?.id,
    loading: bannersLoading || categoriesLoading || bestsellersLoading || combosLoading,
    refetch
  };
};
