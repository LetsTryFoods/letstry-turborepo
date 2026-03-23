import React from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const shimmerColors = ["#E1E9EE", "#F2F8FC", "#E1E9EE"];
const { width } = Dimensions.get("window");
const LEFT_CARD_WIDTH = wp("20%");
const RIGHT_CARD_WIDTH = wp("30%");
const RIGHT_CARD_HEIGHT = hp("22%");

const EventProductsShimmer = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left side shimmer categories */}
        <View style={styles.leftPanel}>
          {[...Array(8)].map((_, i) => (
            <View key={`left-${i}`} style={styles.leftItemWrapper}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                shimmerColors={shimmerColors}
                style={styles.leftImage}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                shimmerColors={shimmerColors}
                style={styles.leftText}
              />
            </View>
          ))}
        </View>

        {/* Right side shimmer products */}
        <FlatList
          data={[...Array(8)]}
          keyExtractor={(_, index) => `right-${index}`}
          renderItem={() => (
            <View style={styles.rightCardWrapper}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                shimmerColors={shimmerColors}
                style={styles.rightCard}
              />
            </View>
          )}
          contentContainerStyle={styles.rightList}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: hp("10.5%"), // starts a little lower
  },
  container: {
    flexDirection: "row",
    flex: 1,
  },
  leftPanel: {
    width: wp("25%"),
    paddingHorizontal: wp("2%"),
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  leftItemWrapper: {
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  leftImage: {
    width: wp("16%"),
    height: hp("7%"),
    borderRadius: wp("2%"),
  },
  leftText: {
    width: wp("14%"),
    height: hp("1.5%"),
    marginTop: hp("0.5%"),
    borderRadius: wp("1%"),
  },
  rightList: {
    flexGrow: 1,
    paddingHorizontal: wp("4%"),
    paddingBottom: hp("2.5%"), // touches bottom nicely
  },
  rightCardWrapper: {
    width: RIGHT_CARD_WIDTH,
    marginBottom: hp("2%"),
  },
  rightCard: {
    width: "100%",
    height: RIGHT_CARD_HEIGHT-19,
    borderRadius: wp("2%"),
  },
});

export default EventProductsShimmer;