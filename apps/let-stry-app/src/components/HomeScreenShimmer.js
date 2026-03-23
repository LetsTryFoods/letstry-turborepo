import React from "react";
import { ScrollView, View, StyleSheet, Dimensions } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const shimmerColors = ["#E1E9EE", "#F2F8FC", "#E1E9EE"];
const SCREEN_WIDTH = Dimensions.get("window").width;

const CARD_GAP = wp("1%");
const RANGE_ITEM_WIDTH = (SCREEN_WIDTH - wp("8%") - 11 * CARD_GAP) / 2;

const HomeScreenShimmer = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Events Preview (3 Cards, Lower) */}
      <View style={styles.heroEventsSection}>
        <View style={styles.eventRow}>
          {[...Array(3)].map((_, index) => (
            <ShimmerPlaceholder
              key={`event-${index}`}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
              style={styles.eventCard}
            />
          ))}
        </View>
      </View>

      {/* Best Sellers */}
      <View style={styles.sectionSpacer}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.sectionTitlePlaceholder}
        />
        <View style={styles.horizontalList}>
          {[...Array(4)].map((_, i) => (
            <ShimmerPlaceholder
              key={`bs-${i}`}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
              style={styles.bestSellerCard}
            />
          ))}
        </View>
      </View>

      {/* Shop By Categories */}
      <View style={styles.sectionSpacer}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.sectionTitlePlaceholder}
        />
        <View style={styles.categoryGrid}>
          {[...Array(6)].map((_, i) => (
            <ShimmerPlaceholder
              key={`cat-${i}`}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
              style={styles.categoryItem}
            />
          ))}
        </View>
      </View>

      {/* Ranges */}
      <View style={styles.sectionSpacer}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.sectionTitlePlaceholder}
        />
        <View style={styles.horizontalList}>
          {[...Array(4)].map((_, i) => (
            <ShimmerPlaceholder
              key={`rg-${i}`}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
              style={styles.rangeItem}
            />
          ))}
        </View>
      </View>

      {/* New Launches */}
      <View style={styles.sectionSpacer}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.sectionTitlePlaceholder}
        />
        <View style={styles.horizontalList}>
          {[...Array(4)].map((_, i) => (
            <ShimmerPlaceholder
              key={`nl-${i}`}
              LinearGradient={LinearGradient}
              shimmerColors={shimmerColors}
              style={styles.newLaunchCard}
            />
          ))}
        </View>
      </View>

      {/* Category Sections */}
      {[...Array(2)].map((_, si) => (
        <View key={`sec-${si}`} style={styles.sectionSpacer}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
            style={styles.sectionTitlePlaceholder}
          />
          <View style={styles.horizontalList}>
            {[...Array(4)].map((_, i) => (
              <ShimmerPlaceholder
                key={`cs-${si}-${i}`}
                LinearGradient={LinearGradient}
                shimmerColors={shimmerColors}
                style={styles.sectionCard}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Let’s Try Banner */}
      <View style={styles.sectionSpacer}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          style={styles.bannerPlaceholder}
        />
      </View>

      <View style={{ height: hp("5%") }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingVertical: hp("2%") },

  // ✅ Updated top shimmer cards
  heroEventsSection: {
    marginTop: hp("3.5%"),
    paddingHorizontal: wp("4%"),
  },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventCard: {
    width: wp("28%"),
    height: wp("29%"),
    borderRadius: wp("3%"),
  },

  sectionSpacer: { marginTop: hp("3%") },
  sectionTitlePlaceholder: {
    height: hp("3%"),
    width: wp("40%"),
    marginLeft: wp("4%"),
    marginBottom: hp("1%"),
    borderRadius: wp("1"),
  },

  horizontalList: {
    flexDirection: "row",
    paddingLeft: wp("4%"),
  },
  bestSellerCard: {
    width: wp("30%"),
    height: hp("18%"),
    marginRight: wp("2%"),
    borderRadius: wp("2%"),
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: wp("4%"),
  },
  categoryItem: {
    width: wp("28%"),
    height: wp("28%"),
    marginBottom: hp("1.5%"),
    borderRadius: wp("2%"),
  },
  rangeItem: {
    width: RANGE_ITEM_WIDTH,
    height: hp("20%"),
    marginRight: wp("2%"),
    borderRadius: wp("2%"),
  },
  newLaunchCard: {
    width: wp("30%"),
    height: hp("18%"),
    marginRight: wp("2%"),
    borderRadius: wp("2%"),
  },
  sectionCard: {
    width: wp("30%"),
    height: hp("18%"),
    marginRight: wp("2%"),
    borderRadius: wp("2%"),
  },
  bannerPlaceholder: {
    height: hp("15%"),
    marginHorizontal: wp("4%"),
    borderRadius: wp("2%"),
  },
});

export default HomeScreenShimmer;