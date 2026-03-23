
import React, { useRef, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';

import { View, StyleSheet, ScrollView } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
 // Use expo version or switch to react-native-linear-gradient
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ProductDetailsShimmer = () => {
  const shimmerRef = useRef([]);

  useEffect(() => {
    shimmerRef.current.forEach((ref) => {
      if (ref?.start) ref.start();
    });
  }, []);

  const shimmer = (style, index) => (
    <ShimmerPlaceholder
      key={index}
      ref={(el) => (shimmerRef.current[index] = el)}
      style={style}
      shimmerStyle={style}
      LinearGradient={LinearGradient}
    />
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {shimmer(styles.image, 0)}
      {shimmer(styles.title, 1)}
      {shimmer(styles.unit, 2)}
      {shimmer(styles.price, 3)}
      {shimmer(styles.discount, 4)}
      {shimmer(styles.tax, 5)}
      {shimmer(styles.sectionTitle, 6)}
      {shimmer(styles.description, 7)}
      {shimmer(styles.description, 8)}

      <View style={styles.brandRow}>
        {shimmer(styles.brandLogo, 9)}
        <View style={styles.brandText}>
          {shimmer(styles.brandName, 10)}
          {shimmer(styles.brandExplore, 11)}
        </View>
      </View>

      {shimmer(styles.sectionTitle, 12)}

      <View style={styles.similarGrid}>
        {[13, 14, 15, 16].map((index) => shimmer(styles.similarCard, index))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: wp(4),
  },
  image: {
    width: '100%',
    height: hp(25),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  title: {
    width: '70%',
    height: hp(2.5),
    marginBottom: hp(1),
    borderRadius: wp(1),
  },
  unit: {
    width: '30%',
    height: hp(2),
    marginBottom: hp(2),
    borderRadius: wp(1),
  },
  price: {
    width: '40%',
    height: hp(2.5),
    marginBottom: hp(1),
    borderRadius: wp(1),
  },
  discount: {
    width: '35%',
    height: hp(2),
    marginBottom: hp(1),
    borderRadius: wp(1),
  },
  tax: {
    width: '45%',
    height: hp(1.8),
    marginBottom: hp(2),
    borderRadius: wp(1),
  },
  sectionTitle: {
    width: '50%',
    height: hp(2.5),
    marginBottom: hp(1),
    borderRadius: wp(1),
  },
  description: {
    width: '100%',
    height: hp(2),
    marginBottom: hp(1),
    borderRadius: wp(1),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2),
  },
  brandLogo: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: wp(3),
  },
  brandText: {
    flex: 1,
  },
  brandName: {
    width: '60%',
    height: hp(2.2),
    marginBottom: hp(0.5),
    borderRadius: wp(1),
  },
  brandExplore: {
    width: '40%',
    height: hp(1.8),
    borderRadius: wp(1),
  },
  similarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  similarCard: {
    width: '47%',
    height: hp(18),
    marginBottom: hp(2),
    borderRadius: wp(2),
  },
});

export default ProductDetailsShimmer;
