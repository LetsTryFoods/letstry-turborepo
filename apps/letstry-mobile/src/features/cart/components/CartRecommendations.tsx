import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { RFValue, wp } from '../../../lib/utils/ui-utils';
import ProductCard from '../../../components/common/ProductCard';
import { useCartRecommendations } from '../hooks/use-cart-recommendations';

interface CartRecommendationsProps {
  items: any[];
  onProductPress?: (productId: string) => void;
}

const CartRecommendations: React.FC<CartRecommendationsProps> = ({ items, onProductPress }) => {
  const { recommendations, loading } = useCartRecommendations(items);

  if (loading && recommendations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0C5273" />
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You may also like</Text>
      <FlatList
        data={recommendations}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            style={styles.productCard}
            imageStyle={styles.productImage}
            onPress={() => onProductPress?.(item.slug)}
          />
        )}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        snapToInterval={wp('45%') + 12}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 30, // Subtle spacing
    backgroundColor: '#FFF',
  },
  list: {
    // Style placeholder removed for cleanliness
  },
  title: {
    fontSize: RFValue(14),
    fontFamily: 'Inter_700Bold',
    color: '#000',
    paddingHorizontal: wp('4%'),
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: wp('4%'),
    paddingBottom: 16, // Reduced for a more compact yet breathable look
  },
  productCard: {
    width: wp('42%'),
    marginRight: 12,
  },
  productImage: {
    height: wp('30%'),
  },
});

export default CartRecommendations;
