import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSegments } from 'expo-router';
import { useCart } from '../hooks/use-cart';
import { useCartStore } from '../store/cart-store';
import { wp, hp, RFValue } from '../../../lib/utils/ui-utils';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const ViewCartBar = () => {
  const { data: cartData, loading } = useCart();
  const { openCart } = useCartStore();
  const segments = useSegments();

  // Highlight: Detect if we are in the "(tabs)" group to adjust floating position
  const isInTabs = segments[0] === '(tabs)';
  const isSearch = segments[0] === 'search';

  const cart = (cartData as any)?.myCart;
  const items = cart?.items || [];
  const itemCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
  const totals = cart?.totalsSummary || {};
  const grandTotal = totals.grandTotal || 0;
  const subtotal = totals.subtotal || 0;
  const threshold = totals.freeDeliveryThreshold ?? 499;

  // Progress logic
  const progress = Math.min(subtotal / threshold, 1);
  const isFree = subtotal >= threshold;

  // Animation logic for smooth vertical transitions
  const targetBottom = isInTabs ? hp('10.5%') : hp('15%');
  const animatedBottom = useRef(new Animated.Value(targetBottom)).current;

  useEffect(() => {
    Animated.spring(animatedBottom, {
      toValue: targetBottom,
      friction: 8,
      tension: 40,
      useNativeDriver: false, // 'bottom' property is not supported by native driver
    }).start();
  }, [targetBottom]);

  // Show the bar if we have items, even if a background refetch is happening
  if (itemCount === 0 || isSearch) return null;

  const handleOpenCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openCart();
  };

  return (
    <Animated.View style={[styles.container, { bottom: animatedBottom }]}>
      <TouchableOpacity 
        style={styles.bar} 
        activeOpacity={0.9}
        onPress={handleOpenCart}
      >
        <View style={styles.content}>
          <View style={styles.left}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>View Cart</Text>
              <Text style={styles.subtitle}>₹{grandTotal.toFixed(0)}</Text>
            </View>
          </View>
          
          <View style={styles.right}>
            <Text style={styles.deliveryText}>
              {isFree ? 'Free Delivery' : `₹${(threshold - subtotal).toFixed(0)} more for Free Delivery`}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </View>
        </View>

        {/* Dynamic Progress Line */}
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressLine, 
              { width: `${progress * 100}%` },
              isFree && { backgroundColor: '#4CAF50' }
            ]} 
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: wp('10%'),
    right: wp('10%'),
    zIndex: 9999,
  },
  bar: {
    backgroundColor: '#0C5273',
    paddingTop: hp('0.8%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: hp('1.2%'),
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    width: RFValue(20),
    height: RFValue(20),
    borderRadius: RFValue(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('2.5%'),
  },
  badgeText: {
    color: '#0C5273',
    fontSize: RFValue(10),
    fontWeight: 'bold',
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: RFValue(10.5),
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    color: '#FFFFFF',
    fontSize: RFValue(9),
    fontFamily: 'Inter_600SemiBold',
    opacity: 0.9,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: -wp('4%'),
    marginTop: 0,
  },
  progressLine: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});

export default ViewCartBar;
