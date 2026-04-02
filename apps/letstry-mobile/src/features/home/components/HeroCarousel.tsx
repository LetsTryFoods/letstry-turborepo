import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ViewToken
} from 'react-native';
import { Image } from 'expo-image';
import { wp, hp, getImageUrl } from '../../../lib/utils/ui-utils';

interface Banner {
  _id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  url?: string;
}

interface HeroCarouselProps {
  banners: Banner[];
  loading?: boolean;
  onBannerPress?: (banner: Banner) => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners, loading, onBannerPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!loading && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = (prev + 1) % banners.length;
          flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex });
          return nextIndex;
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners, loading]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0C5273" />
      </View>
    );
  }

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.bannerItem} 
            activeOpacity={0.9}
            onPress={() => onBannerPress?.(item)}
          >
            <Image
              source={{ uri: getImageUrl(item.mobileImageUrl || item.imageUrl) }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          </TouchableOpacity>
        )}
      />
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot, 
              currentIndex === index && styles.activeDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp('92%'),
    height: hp('22%'),
    alignSelf: 'center',
    marginVertical: hp('2%'),
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    width: wp('92%'),
    height: hp('22%'),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerItem: {
    width: wp('92%'),
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: hp('1%'),
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 14,
  },
});

export default HeroCarousel;
