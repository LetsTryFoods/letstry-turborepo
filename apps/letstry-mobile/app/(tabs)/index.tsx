import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { wp, hp } from '../../src/lib/utils/ui-utils';

// Home Feature Components
import SearchBar from '../../src/components/common/SearchBar';
import HeroCarousel from '../../src/features/home/components/HeroCarousel';
import CategoriesGrid from '../../src/features/home/components/CategoriesGrid';
import HorizontalSection from '../../src/features/home/components/HorizontalSection';
import EventsHero from '../../src/features/home/components/EventsHero';
import { useHomeData } from '../../src/features/home/hooks/useHomeData';

const EVENTS_SECTION_HEIGHT = hp('57%');

const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const { banners, categories, allCategories, bestsellers, bestsellerCategoryId, combos, combosCategoryId, loading, refetch } = useHomeData();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Header Animation Logic (Same as legacy)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, EVENTS_SECTION_HEIGHT - hp('25%')],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, EVENTS_SECTION_HEIGHT - hp('21%'), EVENTS_SECTION_HEIGHT],
    outputRange: [0, 0.3, 0.8],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <View style={[styles.stickyHeader, { paddingTop: insets.top + hp('1%') }]} pointerEvents="box-none">
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { 
            backgroundColor: '#FFFFFF', 
            opacity: headerOpacity, 
            shadowOpacity: headerShadowOpacity,
            elevation: 4
          }
        ]} 
      />
      <View style={styles.searchWrapper}>
        <SearchBar placeholder="Search for snacks, sweets..." />
      </View>
    </View>
  );

  const data = [
    { type: 'events' },
    { type: 'bestsellers' },
    { type: 'categories' },
    { type: 'banners' },
    { type: 'combos' },
  ];

  const handleBannerPress = (banner: any) => {
    if (!banner.url) return;
    
    // Extract slug from URL (e.g., https://www.letstryfoods.com/fasting-special -> fasting-special)
    const urlParts = banner.url.split('/').filter(Boolean);
    const slug = urlParts[urlParts.length - 1];
    
    // Fallback/Safety: Don't navigate if it's just the home URL or no slug
    if (!slug || slug === 'letstryfoods.com' || slug === 'www.letstryfoods.com') {
      return;
    }

    const category = allCategories.find((c: any) => c.slug === slug);
    if (category) {
      router.push({
        pathname: '/categories' as any,
        params: { categoryId: category.id }
      });
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'events':
        return (
          <EventsHero 
            events={categories.slice(0, 8).map((c: any) => ({ 
              id: c.id, 
              name: c.name, 
              imageUrl: c.imageUrl 
            }))} 
            onEventSelect={(event) => router.push({
              pathname: '/categories' as any,
              params: { categoryId: event.id }
            })}
          />
        );
      case 'bestsellers':
        return (
          <HorizontalSection 
            title="Best Sellers" 
            products={bestsellers} 
            seeAllPath={bestsellerCategoryId ? `/categories?categoryId=${bestsellerCategoryId}` : '/categories'} 
          />
        );
      case 'categories':
        return <CategoriesGrid categories={categories} />;
      case 'banners':
        return <HeroCarousel banners={banners} loading={loading} onBannerPress={handleBannerPress} />;
      case 'combos':
        return (
          <HorizontalSection 
            title="Bestselling Combos" 
            products={combos} 
            seeAllPath={combosCategoryId ? `/categories?categoryId=${combosCategoryId}` : '/categories'} 
          />
        );
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0C5273" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}

      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.type}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0C5273"]} />
        }
        ListFooterComponent={<View style={{ height: hp('10%') }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: hp('1%'),
  },
  searchWrapper: {
    paddingHorizontal: wp('5%'),
  },
  scrollContent: {
    paddingBottom: hp('5%'),
  },
});

export default HomeScreen;
