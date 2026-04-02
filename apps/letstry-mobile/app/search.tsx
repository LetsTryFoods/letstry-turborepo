import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { wp, hp, RFValue } from '../src/lib/utils/ui-utils';

import SearchHeader from '../src/features/search/components/SearchHeader';
import RecentSearches from '../src/features/search/components/RecentSearches';
import ProductCard from '../src/components/common/ProductCard';
import { useSearchProducts } from '../src/features/search/hooks/useSearchProducts';
import { saveRecentSearch, getRecentSearches, clearRecentSearches } from '../src/features/search/services/search-storage';

const numColumns = 2;
const ITEM_GAP = wp('3%');
const ITEM_WIDTH = (wp('100%') - (numColumns + 1) * ITEM_GAP) / numColumns;

const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [query, setQuery] = useState((params.initialQuery as string) || '');
  const [searchTerm, setSearchTerm] = useState((params.initialQuery as string) || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const { products, loading, error } = useSearchProducts(searchTerm);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        setSearchTerm(query.trim());
      } else if (query.trim().length === 0) {
        setSearchTerm('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const loadRecentSearches = async () => {
    const searches = await getRecentSearches();
    setRecentSearches(searches);
  };

  const handleSearchSubmit = async () => {
    const trimmed = query.trim();
    if (trimmed) {
      setSearchTerm(trimmed);
      await saveRecentSearch(trimmed);
      await loadRecentSearches();
    }
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    setSearchTerm(term);
  };

  const handleClearRecent = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.productWrapper}>
      <ProductCard 
        product={item} 
        style={styles.productCard}
        imageStyle={styles.productImage}
        onPress={() => router.push({
          pathname: '/product/[id]' as any,
          params: { id: item._id }
        })}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SearchHeader 
        query={query} 
        setQuery={setQuery} 
        onSubmit={handleSearchSubmit} 
      />

      {loading && products.length === 0 && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0C5273" />
        </View>
      )}

      {!loading && searchTerm && products.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No products found for "{searchTerm}"</Text>
        </View>
      )}

      {(products.length > 0 || !searchTerm) && (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            !query ? (
              <RecentSearches 
                searches={recentSearches} 
                onSelect={handleSelectRecent} 
                onClear={handleClearRecent} 
              />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
  },
  emptyText: {
    fontSize: RFValue(14),
    color: '#9E9E9E',
    textAlign: 'center',
  },
  listContent: {
    padding: ITEM_GAP,
    paddingBottom: hp('5%'),
  },
  productWrapper: {
    width: ITEM_WIDTH,
    marginHorizontal: ITEM_GAP / 2,
    marginBottom: ITEM_GAP,
  },
  productCard: {
    width: '100%',
    height: hp('41%'), // Increased for better 2-column visual impact
  },
  productImage: {
    height: hp('19%'), // Larger image as requested
  },
});

export default SearchScreen;
