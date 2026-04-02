import React from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import ProductCard from '../../../components/common/ProductCard';
import { wp, hp, RFValue } from '../../../lib/utils/ui-utils';
import { theme } from '../../../styles/theme';
import { useCartMutations } from '../../cart/hooks/use-cart-mutations';

interface CategoryProductGridProps {
  products: any[];
  loading: boolean;
  onRefresh: () => void;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
  hasNextPage?: boolean;
}

const CategoryProductGrid: React.FC<CategoryProductGridProps> = ({
  products,
  loading,
  onRefresh,
  onLoadMore,
  isFetchingMore = false,
  hasNextPage = false,
}) => {
  const router = useRouter();
  const { addToCart } = useCartMutations();

  const handleAdd = (productId: string) => {
    // Standard Add to Cart logic
    addToCart({
      variables: {
        input: {
          productId,
          quantity: 1,
        }
      }
    });
  };

  const handlePress = (slug: string) => {
    router.push({
      pathname: '/product/[id]' as any,
      params: { id: slug }
    });
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No products found in this category.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <ProductCard
            product={item}
            onPress={() => handlePress(item.slug)}
          />
        </View>
      )}
      contentContainerStyle={styles.scrollContent}
      onRefresh={onRefresh}
      refreshing={loading}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() => (
        isFetchingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : null
      )}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    paddingVertical: 15,
    paddingHorizontal: wp('2%'),
    paddingBottom: hp('10%'),
    gap: 16, // Vertical spacing between rows
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: wp('2%'),
    gap: 8, // Horizontal spacing between items in a row
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: RFValue(13),
    color: '#999',
    fontWeight: '500',
  },
});

export default CategoryProductGrid;
