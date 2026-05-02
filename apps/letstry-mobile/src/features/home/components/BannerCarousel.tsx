import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ViewToken,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'expo-image';
import { wp, hp, getImageUrl } from '../../../lib/utils/ui-utils';
import { ActionEngine, SDUIAction } from '../../../lib/sdui/ActionEngine';

interface Banner {
  id?: string;
  imageUrl: string;
  url?: string;
  action?: SDUIAction;
}

interface BannerCarouselProps {
  items: Banner[];
  height?: number;
  borderRadius?: number;
  autoplayInterval?: number;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ 
  items = [], 
  height = hp('20%'),
  borderRadius = 12,
  autoplayInterval = 6000
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.container, { height }]}>
      <Carousel
        loop
        width={wp('100%')}
        height={height}
        autoPlay={true}
        autoPlayInterval={autoplayInterval}
        data={items}
        scrollAnimationDuration={800}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.92,
          parallaxScrollingOffset: 50,
        }}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.bannerItem, { height, borderRadius, overflow: 'hidden' }]} 
            activeOpacity={0.9}
            onPress={() => item.action && ActionEngine.execute(item.action)}
          >
            <Image
              source={{ uri: getImageUrl(item.imageUrl) }}
              style={styles.image}
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
      />
      <View style={styles.pagination}>
        {items.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot, 
              activeIndex === index && styles.activeDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp('100%'),
    alignSelf: 'center',
    marginVertical: hp('1%'),
    overflow: 'hidden',
  },
  bannerItem: {
    width: '100%',
    alignSelf: 'center',
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

export default BannerCarousel;
