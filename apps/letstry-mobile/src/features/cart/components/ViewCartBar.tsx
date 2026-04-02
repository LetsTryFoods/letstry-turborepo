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
  const grandTotal = cart?.totalsSummary?.grandTotal || 0;

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

  if (itemCount === 0 || loading || isSearch) return null;

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
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: wp('18%'),
    right: wp('18%'),
    zIndex: 9999,
  },
  bar: {
    backgroundColor: '#0C5273',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
});

export default ViewCartBar;
