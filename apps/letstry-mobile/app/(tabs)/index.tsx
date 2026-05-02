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
import TopBanner from '../../src/features/home/components/TopBanner';
import HomeFooter from '../../src/features/home/components/HomeFooter';
import HomeSkeleton from '../../src/features/home/components/HomeSkeleton';
import Spacer from '../../src/features/home/components/Spacer';
import BannerCarousel from '../../src/features/home/components/BannerCarousel';
import { useHomeData } from '../../src/features/home/hooks/useHomeData';

const EVENTS_SECTION_HEIGHT = hp('57%');
const HEADER_HEIGHT = hp('10%'); // Estimated search bar + padding

const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const { 
    banners, 
    categories, 
    allCategories, 
    bestsellers, 
    bestsellerCategoryId, 
    combos, 
    combosCategoryId, 
    loading, 
    sduiConfig, 
    sduiComponents,
    refetch 
  } = useHomeData();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);


  const renderListHeader = () => (
    <View style={{ paddingTop: insets.top }} />
  );

  const displayData = sduiComponents;

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
      case 'TopBanner':
        return (
          <TopBanner 
            visible={item.props?.visible} 
            imageUrl={item.props?.imageUrl} 
            aspectRatio={item.props?.aspectRatio}
          />
        );
      case 'EventsHero':
        return (
          <EventsHero 
            sduiConfig={sduiConfig}
            safeAreaTop={insets.top}
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
      case 'Bestsellers':
        return (
          <HorizontalSection 
            title={item.props?.title || "Best Sellers"} 
            products={bestsellers} 
            cardStyles={item.props?.cardStyles}
            seeAllPath={bestsellerCategoryId ? `/categories?categoryId=${bestsellerCategoryId}` : '/categories'} 
          />
        );
      case 'Categories':
        return (
          <CategoriesGrid 
            categories={categories} 
            title={item.props?.title}
            numColumns={item.props?.numColumns}
            showSeeAll={item.props?.showSeeAll}
          />
        );
      case 'HeroCarousel':
        return <HeroCarousel banners={banners} loading={loading} onBannerPress={handleBannerPress} />;
      case 'Combos':
        return (
          <HorizontalSection 
            title={item.props?.title || "Bestselling Combos"} 
            products={combos} 
            cardStyles={item.props?.cardStyles}
            seeAllPath={combosCategoryId ? `/categories?categoryId=${combosCategoryId}` : '/categories'} 
          />
        );
      case 'HomeFooter':
        return (
          <HomeFooter 
            mainText={item.props?.mainText} 
            brandText={item.props?.brandText} 
          />
        );
      case 'Spacer':
        return <Spacer height={item.props?.height} />;
      case 'BannerCarousel':
        return (
          <BannerCarousel 
            items={item.props?.items} 
            height={item.props?.height} 
            borderRadius={item.props?.borderRadius}
            autoplayInterval={item.props?.autoplayInterval}
          />
        );
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return <HomeSkeleton />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      

      <Animated.FlatList
        data={displayData}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        keyExtractor={(item, index) => `${item.type}-${index}`}
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
  searchSection: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
  },
  searchWrapper: {
    paddingHorizontal: wp('5%'),
  },
  scrollContent: {
    paddingBottom: 0,
  },
});

export default HomeScreen;
