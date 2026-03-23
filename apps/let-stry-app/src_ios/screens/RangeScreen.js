// screens/RangeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import RangeCategoryCard from '../components/RangeCategoryCard';
import FloatingCartButton from '../components/FloatingCartButton';
import { useCart } from '../context/CartContext';
import { fetchRangeProducts } from '../services/RangeService';
import RangeScreenShimmer from '../components/RangeScreenShimmer'; // 👈 shimmer imported

const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_PER_ROW = 3;
const CARD_WIDTH = (width - (CARD_GAP * (CARD_PER_ROW + 1))) / CARD_PER_ROW;

const rangeBanners = {
  'No Palm Oil Range': require('../assets/range/banner_no_palm_oil.webp'),
  'Namkeen Range': require('../assets/range/banner_namkeen.webp'),
  'Roasted Range': require('../assets/range/banner_roasted.webp'),
  'Puff Range': require('../assets/range/banner_puff.webp'),
  'Goodness of Wheat': require('../assets/range/banner_goodness_of_wheat.webp'),
  'No Maida Range': require('../assets/range/banner_no_maida.webp'),
  'Muffins Range': require('../assets/range/banner_muffins.webp'),
  'Wafers Range': require('../assets/range/banner_wafers.webp'),
  'South Range': require('../assets/range/banner_south.webp'),
  'South Range/': require('../assets/range/banner_south.webp'),
};

const formatData = (data, numColumns) => {
  const fullRows = Math.floor(data.length / numColumns);
  let elementsLastRow = data.length - fullRows * numColumns;
  while (elementsLastRow !== 0 && elementsLastRow !== numColumns) {
    data.push({ id: `blank-${Math.random()}`, empty: true });
    elementsLastRow++;
  }
  return data;
};

const RangeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { name = 'Goodness of Wheat' } = route.params || {};
  const { cartCount } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const items = await fetchRangeProducts(name);
        setProducts(items);
      } catch (error) {
        console.error('Error loading range products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [name]);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.empty) {
        return <View style={[styles.itemContainer, { backgroundColor: 'transparent' }]} />;
      }
      return (
        <View style={styles.itemContainer}>
          <RangeCategoryCard
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        </View>
      );
    },
    [navigation]
  );

  if (loading) {
    return <RangeScreenShimmer />; // ✅ replaced ActivityIndicator with shimmer
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={[styles.topButtonsContainer, { top: insets.top }]}>
        <View style={styles.circleButtonWrapper}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#222"
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.circleButtonWrapper}>
          <Ionicons
            name="search"
            size={24}
            color="#222"
            onPress={() => navigation.navigate('Search')}
          />
        </View>
      </View>

      <Image
        source={rangeBanners[name] || require('../assets/range/banner_default.webp')}
        style={styles.bannerImage}
        resizeMode="cover"
      />

      {products.length > 0 ? (
        <FlatList
          data={formatData([...products], CARD_PER_ROW)}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={CARD_PER_ROW}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text allowFontScaling={false} adjustsFontSizeToFit>
                No products found for this range
              </Text>
            </View>
          }
          removeClippedSubviews
          initialNumToRender={9}
          maxToRenderPerBatch={9}
          windowSize={11}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text allowFontScaling={false} adjustsFontSizeToFit>
            No products available
          </Text>
        </View>
      )}

      {cartCount > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: insets.bottom + 16,
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <FloatingCartButton onPress={() => navigation.navigate('Cart')} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  bannerImage: {
    width: '100%',
    height: '25%',
    borderWidth: 0,
    marginBottom:'5%',
  },
  list: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
    paddingHorizontal: CARD_GAP,
  },
  itemContainer: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  circleButtonWrapper: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
});

export default RangeScreen;






