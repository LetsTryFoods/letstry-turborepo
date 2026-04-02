import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProductDetails } from '../../src/features/product/hooks/use-product-details';
import ProductImageCarousel from '../../src/features/product/components/ProductImageCarousel';
import ProductDetailsContent from '../../src/features/product/components/ProductDetailsContent';
import { RFValue, wp, hp } from '../../src/lib/utils/ui-utils';
import { useCartStore } from '../../src/features/cart/store/cart-store';
import { useCart } from '../../src/features/cart/hooks/use-cart';
import { useCartMutations } from '../../src/features/cart/hooks/use-cart-mutations';
import * as Haptics from 'expo-haptics';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const productId = Array.isArray(id) ? id[0] : (id || '');
  const isId = /^[0-9a-fA-F]{24}$/.test(productId);

  const { product, loading, error, selectedVariant, setSelectedVariant } = useProductDetails(productId, isId);

  // Real Global Cart State & Mutations
  const { openCart } = useCartStore();
  const { data: cartData } = useCart();
  const { addToCart, updateCartItem, isAdding, isUpdating } = useCartMutations();

  const scrollY = useRef(new Animated.Value(0)).current;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0c5273" />
      </View>
    );
  }

  if (error || !product || !selectedVariant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Oops! Failed to load product.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get current quantity of the selected variant in the cart
  const cartItems = (cartData as any)?.myCart?.items || [];
  const currentCartItem = cartItems.find((item: any) => item.productId === product._id && item.variantId === selectedVariant._id);
  const cartQuantity = currentCartItem ? currentCartItem.quantity : 0;
  const isUpdatingCart = isAdding || isUpdating;

  const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  const handleUpdateQuantity = (newQty: number) => {
    if (newQty < 0) return;

    // Provide a premium haptic tick effect when altering cart quantities
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (cartQuantity === 0 && newQty === 1) {
      addToCart({
        variables: {
          input: {
            productId: selectedVariant._id,
            quantity: 1,
            // The backend AddToCartInput schema strictly restricts passing variantId explicitly.
            // variantId is resolved by the backend Cart Service from the productId payload.
          }
        }
      });
    } else {
      updateCartItem({
        variables: {
          input: {
            productId: selectedVariant._id,
            quantity: newQty,
          }
        }
      });
    }
  };

  const handleShare = async () => {
    try {
      const productUrl = `https://www.letstryfoods.com/product/${productId}`;
      const shareMessage = `Check out this product on LetsTry: ${product.name}\n\nPrice: ₹${selectedVariant.price}\n\nBuy it here: ${productUrl}\n\nDownload the app to see more!`;
      await Share.share({
        message: shareMessage,
        url: productUrl, // For iOS support
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  // Animated header values
  const headerOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Static Header (Buttons only) */}
      <SafeAreaView style={styles.absoluteHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Animated Sticky Header (Background and Title) */}
      <Animated.View style={[
        styles.stickyHeader,
        {
          opacity: headerOpacity,
        }
      ]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.stickyBackButton}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Animated.Text
              style={[
                styles.headerTitle,
                { transform: [{ translateY: headerTranslateY }] }
              ]}
              numberOfLines={1}
            >
              {product.name}
            </Animated.Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <ProductImageCarousel 
          images={selectedVariant.images} 
          onShare={handleShare}
        />

        <ProductDetailsContent
          product={product}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
        />

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Floating View Cart Banner */}

      {/* Bottom Action Row */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomPrice}>₹{selectedVariant.price}</Text>
          <Text style={styles.bottomWeight}>{selectedVariant.weight}{selectedVariant.weightUnit}</Text>
        </View>

        <View style={styles.actionContainer}>
          {isUpdatingCart ? (
            <View style={styles.addToCartBtn}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          ) : cartQuantity === 0 ? (
            <TouchableOpacity style={styles.addToCartBtn} activeOpacity={0.8} onPress={() => handleUpdateQuantity(1)}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyController}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQuantity(cartQuantity - 1)}>
                <Ionicons name="remove" size={18} color="#0C5273" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{cartQuantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQuantity(cartQuantity + 1)}>
                <Ionicons name="add" size={18} color="#0C5273" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  absoluteHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 9,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('3%'),
    height: 56,
  },
  headerTitle: {
    fontSize: RFValue(13.5),
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  stickyBackButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: hp('22%'), // Increased to clear both bottom bar AND global floating cart bar
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: RFValue(14),
    color: '#E53935',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#0C5273',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: hp('5%'),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  bottomPriceInfo: {
    gap: 1,
  },
  bottomPrice: {
    fontSize: RFValue(18),
    fontWeight: '900',
    color: '#000',
  },
  bottomWeight: {
    fontSize: RFValue(11),
    color: '#666',
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C5273',
    paddingHorizontal: wp('5%'),
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: wp('35%'),
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 6,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '800',
  },
  qtyController: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    minWidth: wp('35%'),
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qtyText: {
    fontSize: RFValue(15),
    color: '#0C5273',
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 24,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 80,
    justifyContent: 'flex-end',
  },
  headerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewCartBanner: {
    position: 'absolute',
    bottom: hp('10%') + 20,
    left: wp('5%'),
    right: wp('5%'),
    backgroundColor: '#0C5273',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
  },
  viewCartBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewCartBannerIconWrap: {
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewCartBannerItems: {
    color: '#fff',
    fontWeight: '800',
    fontSize: RFValue(13),
  },
  viewCartBannerSub: {
    color: '#E0F2E9',
    fontSize: RFValue(10),
    fontWeight: '600',
  },
  viewCartBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewCartBannerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: RFValue(14),
  },
  bottomSpacer: {
    height: 40,
  },
});
