"use client"

import { useState, useRef, useEffect } from "react"
import { View, Image, Dimensions, FlatList, StyleSheet, TouchableOpacity } from "react-native"

const { width } = Dimensions.get("window")

// Import banner images
import banner1 from "../assets/images/banner.jpg"
import banner2 from "../assets/images/banner.jpg"
import banner3 from "../assets/images/banner.jpg"
import banner4 from "../assets/images/banner.jpg"

const images = [
  { uri: Image.resolveAssetSource(banner1).uri, alt: "Banner 1" },
  { uri: Image.resolveAssetSource(banner2).uri, alt: "Banner 2" },
  { uri: Image.resolveAssetSource(banner3).uri, alt: "Banner 3" },
  { uri: Image.resolveAssetSource(banner4).uri, alt: "Banner 4" },
]

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef(null)
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 })

  // Auto-scroll functionality
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activeIndex === images.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        })
      } else {
        flatListRef.current?.scrollToIndex({
          index: activeIndex + 1,
          animated: true,
        })
      }
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(intervalId)
  }, [activeIndex])

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index)
    }
  })

  const handleDotPress = (index) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    })
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.bannerContainer}>
      <Image source={{ uri: item.uri }} style={styles.banner} resizeMode="cover" />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewConfigRef.current}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        decelerationRate="fast"
        snapToInterval={width - 30}
        snapToAlignment="center"
        contentContainerStyle={styles.carouselContent}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: width - 30,
          offset: (width - 30) * index,
          index,
        })}
      />
      <View style={styles.pagination}>
        {images.map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dot, i === activeIndex && styles.activeDot]}
            onPress={() => handleDotPress(i)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  carouselContent: {
    paddingHorizontal: 15,
  },
  bannerContainer: {
    width: width - 30,
    paddingHorizontal: 5,
  },
  banner: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#333",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
})

export default Carousel
