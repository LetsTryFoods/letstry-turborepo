import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const ITEM_WIDTH = (wp(100) - (3 + 1) * wp(2)) / 3;

const ProductCardPlaceholder = () => {
  // Use useRef for the animated value to prevent it from resetting on re-renders
  const shimmerAnimatedValue = useRef(new Animated.Value(-ITEM_WIDTH)).current;

  useEffect(() => {
    // Create a looping animation
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: ITEM_WIDTH,
        duration: 1200, // Speed of the shimmer
        useNativeDriver: true, // for better performance
      })
    );
    shimmerAnimation.start();

    // Clean up the animation when the component unmounts
    return () => {
      shimmerAnimation.stop();
    };
  }, [shimmerAnimatedValue]);

  // Translate the gradient horizontally
  const translateStyle = {
    transform: [{ translateX: shimmerAnimatedValue }],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.shimmer, translateStyle]}>
        <LinearGradient
          colors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E1E9EE", // A light grey background
    width: "100%",
    height: hp(20), // Should match your actual card height
    borderRadius: wp(2),
    overflow: "hidden", // This is crucial to contain the shimmer
  },
  shimmer: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
    width: "100%",
  },
});

export default ProductCardPlaceholder;