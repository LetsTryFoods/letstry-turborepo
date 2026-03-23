import React from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

const shimmerColors = ["#E1E9EE", "#F2F8FC", "#E1E9EE"];

const { width } = Dimensions.get("window");
const CARD_GAP = 8;
const CARD_PER_ROW = 3;
const CARD_WIDTH = (width - CARD_GAP * (CARD_PER_ROW + 1)) / CARD_PER_ROW;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const RangeScreenShimmer = () => {
  const placeholderData = Array.from({ length: 9 });

  const renderItem = (_, index) => (
    <ShimmerPlaceholder
      key={index}
      LinearGradient={LinearGradient}
      shimmerColors={shimmerColors}
      style={styles.card}
    />
  );

  return (
    <View style={styles.container}>
      {/* Top Banner Shimmer */}
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        style={styles.banner}
      />

      {/* Grid Cards */}
      <FlatList
        data={placeholderData}
        keyExtractor={(_, index) => `shimmer-${index}`}
        numColumns={CARD_PER_ROW}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: {
    width: "100%",
    height: "25%",
    borderRadius: 8,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: CARD_GAP,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
  },
});

export default RangeScreenShimmer;
