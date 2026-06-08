import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { Image } from "expo-image";
import { wp, hp, getImageUrl } from "../../../lib/utils/ui-utils";

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

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  banners,
  loading,
  onBannerPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

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
      <Carousel
        loop
        width={wp("100%")}
        height={hp("22%")}
        autoPlay={true}
        autoPlayInterval={6000}
        data={banners}
        scrollAnimationDuration={800}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.92,
          parallaxScrollingOffset: 50,
        }}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bannerItem}
            activeOpacity={0.9}
            onPress={() => onBannerPress?.(item)}
          >
            <Image
              source={{
                uri: getImageUrl(item.mobileImageUrl || item.imageUrl),
              }}
              style={styles.image}
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
      />
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp("100%"),
    height: hp("22%"),
    alignSelf: "center",
    marginVertical: hp("2%"),
    overflow: "hidden",
  },
  loadingContainer: {
    width: wp("100%"),
    height: hp("22%"),
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerItem: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: hp("1%"),
    alignSelf: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 14,
  },
});

export default HeroCarousel;
