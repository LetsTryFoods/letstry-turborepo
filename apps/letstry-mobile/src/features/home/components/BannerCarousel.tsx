import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { hp, getImageUrl } from "../../../lib/utils/ui-utils";
import { ActionEngine, SDUIAction } from "../../../lib/sdui/ActionEngine";

const SCREEN_WIDTH = Dimensions.get("window").width;

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
  fullWidth?: boolean;
}

// Full-width version: uses a native FlatList with pagingEnabled for true edge-to-edge
const FullWidthBannerCarousel: React.FC<{
  items: Banner[];
  height: number;
}> = ({ items, height }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (items.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % items.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [items.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={{ width: SCREEN_WIDTH, height, overflow: "hidden" }}>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ width: SCREEN_WIDTH, height }}
            activeOpacity={0.9}
            onPress={() => item.action && ActionEngine.execute(item.action)}
          >
            <Image
              source={{ uri: getImageUrl(item.imageUrl) }}
              style={{ width: SCREEN_WIDTH, height }}
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
      />
      {items.length > 1 && (
        <View style={styles.pagination}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  items = [],
  height = hp("20%"),
  borderRadius = 12,
  autoplayInterval = 6000,
  fullWidth = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  // For full-width mode, use a simple FlatList that guarantees edge-to-edge rendering
  if (fullWidth) {
    return <FullWidthBannerCarousel items={items} height={height} />;
  }

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height,
        overflow: "hidden",
        marginVertical: hp("1%"),
      }}
    >
      <Carousel
        loop
        width={SCREEN_WIDTH}
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
            style={{ width: "100%", height, borderRadius, overflow: "hidden" }}
            activeOpacity={0.9}
            onPress={() => item.action && ActionEngine.execute(item.action)}
          >
            <Image
              source={{ uri: getImageUrl(item.imageUrl) }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
      />
      <View style={styles.pagination}>
        {items.map((_, index) => (
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

export default BannerCarousel;
