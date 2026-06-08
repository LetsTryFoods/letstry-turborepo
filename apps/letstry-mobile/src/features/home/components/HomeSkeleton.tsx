import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { wp, hp } from "../../../lib/utils/ui-utils";

const SkeletonItem = ({ style }: { style?: any }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return <Animated.View style={[styles.skeleton, style, { opacity }]} />;
};

const HomeSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Top Header / EventsHero area */}
      <SkeletonItem style={styles.heroBanner} />

      {/* Circular items row (mimic EventsHero categories) */}
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonItem key={i} style={styles.circle} />
        ))}
      </View>

      {/* Thin Banner */}
      <SkeletonItem style={styles.thinBanner} />

      {/* Horizontal Section (Bestsellers) */}
      <View style={styles.sectionHeader}>
        <SkeletonItem style={styles.headerText} />
      </View>
      <View style={styles.row}>
        {[1, 2, 3].map((i) => (
          <SkeletonItem key={i} style={styles.square} />
        ))}
      </View>

      {/* Categories Grid */}
      <View style={styles.sectionHeader}>
        <SkeletonItem style={styles.headerText} />
      </View>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonItem key={i} style={styles.gridItem} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: hp("2%"),
  },
  skeleton: {
    backgroundColor: "#E1E9EE",
    borderRadius: 8,
  },
  heroBanner: {
    width: wp("90%"),
    height: hp("25%"),
    alignSelf: "center",
    marginBottom: hp("2%"),
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("3%"),
    gap: wp("3%"),
  },
  circle: {
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("7.5%"),
  },
  thinBanner: {
    width: "100%",
    height: hp("6%"),
    marginBottom: hp("3%"),
    borderRadius: 0,
  },
  sectionHeader: {
    paddingHorizontal: wp("5%"),
    marginBottom: hp("1.5%"),
  },
  headerText: {
    width: wp("40%"),
    height: hp("3%"),
  },
  square: {
    width: wp("35%"),
    height: wp("45%"),
    borderRadius: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: wp("5%"),
    gap: wp("4%"),
  },
  gridItem: {
    width: wp("27%"),
    height: wp("27%"),
    borderRadius: 12,
  },
});

export default HomeSkeleton;
