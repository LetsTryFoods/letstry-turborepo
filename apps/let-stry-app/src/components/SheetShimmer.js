import React from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const shimmerColors = ["#E1E9EE", "#F2F8FC", "#E1E9EE"];

const CartScreenShimmer = () => {
  // Array for a 2x3 grid of shimmer cards
  const dummyItems = Array.from({ length: 6 });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Shimmer for the grid of vertical product cards */}
        <View style={styles.gridContainer}>
          {dummyItems.map((_, index) => (
            <View key={index} style={styles.card}>
              <ShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={styles.image}
              />
              <View style={styles.infoSection}>
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={styles.title}
                />
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={styles.subtitle}
                />
                <View style={styles.bottomRow}>
                  <ShimmerPlaceholder
                    shimmerColors={shimmerColors}
                    style={styles.price}
                  />
                </View>
              </View>
               <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={styles.quantityStepper}
                />
            </View>
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingBottom: hp(2),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  card: {
    width: wp(28), // Width for two columns with a gap
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: hp(2.5),
    padding: wp(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: hp(9), // Taller image for vertical card
    borderRadius: 8,
    marginBottom: hp(1.5),
  },
  infoSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  title: {
    width: '95%',
    height: hp(1),
    borderRadius: 6,
    marginBottom: hp(1),
  },
  subtitle: {
    width: '70%',
    height: hp(1),
    borderRadius: 6,
    marginBottom: hp(1.5),
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    width: '50%',
    height: hp(1),
    borderRadius: 6,
  },
  quantityStepper: {
    width: '100%',
    height: hp(3),
    borderRadius: 8,
    marginTop: hp(1.5),
  },
  summaryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.5),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  summaryTitle: {
    width: '50%',
    height: hp(3),
    borderRadius: 6,
    marginBottom: hp(3),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  summaryLabel: {
    width: '35%',
    height: hp(2.5),
    borderRadius: 6,
  },
  summaryValue: {
    width: '25%',
    height: hp(2.5),
    borderRadius: 6,
  },
  checkoutButton: {
    width: '100%',
    height: hp(6),
    borderRadius: 10,
    marginTop: hp(1),
  },
});

export default CartScreenShimmer;
