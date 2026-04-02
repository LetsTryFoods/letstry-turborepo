import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { wp, hp, RFValue } from '../../src/lib/utils/ui-utils';
import { theme } from '../../src/styles/theme';

// Feature Components
import CategorySidebar from '../../src/features/category/components/CategorySidebar';
import CategoryProductGrid from '../../src/features/category/components/CategoryProductGrid';

// GraphQL
import { 
  GET_ROOT_CATEGORIES, 
  GET_PRODUCTS_BY_CATEGORY, 
  GET_ALL_PRODUCTS 
} from '../../src/lib/graphql/home';

const ALL_PRODUCTS_ID = 'all';

const CategoriesScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [activeCategoryId, setActiveCategoryId] = useState(params.categoryId || ALL_PRODUCTS_ID);

  // Sync active category if params change (e.g. navigating from Home again)
  useEffect(() => {
    if (params.categoryId) {
      setActiveCategoryId(params.categoryId);
    }
  }, [params.categoryId]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch all root categories for the sidebar
  const { 
    data: categoriesData, 
  } = useQuery(GET_ROOT_CATEGORIES, {
    variables: { pagination: { page: 1, limit: 50 } }
  });

  // Fetch products based on selection
  const isAll = activeCategoryId === ALL_PRODUCTS_ID;
  const { 
    data: productsData, 
    loading: productsLoading,
    refetch: refetchProducts,
    fetchMore
  } = useQuery(isAll ? GET_ALL_PRODUCTS : GET_PRODUCTS_BY_CATEGORY, {
    variables: { 
      categoryId: activeCategoryId,
      pagination: { page: 1, limit: 20 } 
    },
    skip: !isAll && !activeCategoryId,
    notifyOnNetworkStatusChange: true,
  });

  const categories = categoriesData?.rootCategories?.items || [];
  const productsResponse = isAll ? productsData?.products : productsData?.productsByCategory;
  const products = productsResponse?.items || [];
  const meta = productsResponse?.meta;

  const activeCategoryName = isAll 
    ? 'All Products' 
    : (categories as any[]).find(c => c.id === activeCategoryId)?.name || 'Categories';

  const handleLoadMore = useCallback(async () => {
    if (!meta?.hasNextPage || isFetchingMore || productsLoading) return;

    setIsFetchingMore(true);
    try {
      await fetchMore({
        variables: {
          pagination: {
            page: (meta.page || 0) + 1,
            limit: 20,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          if (isAll) {
            return {
              products: {
                ...fetchMoreResult.products,
                items: [
                  ...(prev.products?.items || []),
                  ...(fetchMoreResult.products?.items || []),
                ],
              },
            };
          } else {
            return {
              productsByCategory: {
                ...fetchMoreResult.productsByCategory,
                items: [
                  ...(prev.productsByCategory?.items || []),
                  ...(fetchMoreResult.productsByCategory?.items || []),
                ],
              },
            };
          }
        },
      });
    } catch (error) {
      console.error('Error fetching more products:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [meta, isFetchingMore, productsLoading, fetchMore, isAll]);

  const handleCategorySelect = useCallback((id: string) => {
    setActiveCategoryId(id);
  }, []);

  const handleSearchPress = () => {
    router.push('/search' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Global Header matching SS */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{activeCategoryName}</Text>
          <TouchableOpacity onPress={handleSearchPress} style={styles.headerBtn}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Left Sidebar */}
        <CategorySidebar 
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={handleCategorySelect}
        />

        {/* Right Product Grid */}
        <View style={styles.gridContainer}>
          <CategoryProductGrid 
            products={products}
            loading={productsLoading && !isFetchingMore}
            onRefresh={refetchProducts}
            onLoadMore={handleLoadMore}
            isFetchingMore={isFetchingMore}
            hasNextPage={meta?.hasNextPage}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    // Golden tint as in SS can be added with backgroundColor: '#FFF9EB' if preferred
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    height: 56,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: '800',
    color: '#333',
    letterSpacing: 0.5,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  gridContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default CategoriesScreen;
