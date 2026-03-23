import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import HomeProductCard from "./HomeProductCard"; // Adjust import as needed

const CARD_WIDTH = 160;
const CARD_MARGIN = 16;

const ProductCarousel = ({
  title = "Products",
  products = [],
  onProductPress,
  emptyText = "No products to display.",
  showTitle = true,
  containerStyle = {},
  cardStyle = {},
}) => {
  if (!products || products.length === 0) {
    return (
      <View style={[styles.carouselContainer, containerStyle]}>
        {showTitle && <Text style={styles.carouselTitle}>{title}</Text>}
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.carouselContainer, containerStyle]}>
      {showTitle && <Text style={styles.carouselTitle}>{title}</Text>}
      <FlatList
        data={products}
        horizontal
        keyExtractor={item => String(item.ean_code || item.id)}
        renderItem={({ item }) => (
          <View style={[styles.cardWrapper, cardStyle]}>
            <HomeProductCard
              product={item}
              onPress={() => onProductPress && onProductPress(item)}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
        initialNumToRender={5}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_MARGIN,
          offset: (CARD_WIDTH + CARD_MARGIN) * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 12,
    color: "#222",
  },
  cardWrapper: {
    marginRight: CARD_MARGIN,
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  flatListContent: {
    paddingHorizontal: 12,
  },
  emptyText: {
    marginLeft: 12,
    color: "#888",
    fontSize: 15,
    marginTop: 10,
  },
});

export default ProductCarousel;
