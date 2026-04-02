import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCartStore } from '../store/cart-store';
import { useCart } from '../hooks/use-cart';
import { useCartMutations } from '../hooks/use-cart-mutations';
import CartItemCard from './CartItemCard';
import PriceBreakdown from './PriceBreakdown';
import EmptyCartView from './EmptyCartView';
import CartRecommendations from './CartRecommendations';
import { RFValue, wp, hp } from '../../../lib/utils/ui-utils';

const CartModal = () => {
  const router = useRouter();
  const { isOpen, closeCart } = useCartStore();
  const { data, loading } = useCart();
  const { addToCart, updateCartItem, removeFromCart, isUpdating, isRemoving } = useCartMutations();

  const cart = (data as any)?.myCart;
  const items = cart?.items || [];
  const totals = cart?.totalsSummary || { grandTotal: 0, discountAmount: 0 };

  const isCartEmpty = items.length === 0;
  const totalItems = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  // Calculate total savings including MRP vs Price difference + any coupon discounts
  const totalMrpSavings = items.reduce((acc: number, item: any) => {
    const mrp = item.mrp || item.unitPrice;
    return acc + (mrp - item.unitPrice) * item.quantity;
  }, 0);
  const totalSavings = totalMrpSavings + (totals.discountAmount || 0);

  const handleUpdateQuantity = (id: string, qty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (qty <= 0) {
      removeFromCart({ variables: { productId: id } });
    } else {
      updateCartItem({ variables: { input: { productId: id, quantity: qty } } });
    }
  };

  const handleRemoveItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeFromCart({ variables: { productId: id } });
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out my cart on LetsTry! I've got ${totalItems} items.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleProductPress = (slug: string) => {
    closeCart();
    // Use a small timeout to ensure the modal closes smoothly before navigation
    setTimeout(() => {
      router.push(`/product/${slug}`);
    }, 300);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeCart}
      onDismiss={closeCart}
    >
      <SafeAreaView style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={closeCart}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
            {/* <Ionicons name="share-outline" size={22} color="#0C5273" /> */}
          </TouchableOpacity>
        </View>

        {loading && !cartDataExists(cart) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0C5273" />
            <Text style={styles.loadingText}>Fetching your cart...</Text>
          </View>
        ) : isCartEmpty ? (
          <EmptyCartView onClose={closeCart} />
        ) : (
          <>
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Savings Banner */}
              {totalSavings > 0 && (
                <View style={styles.savingsBanner}>
                  <Text style={styles.savingsBannerText}>Your total savings</Text>
                  <Text style={styles.savingsBannerAmount}>₹{totalSavings.toFixed(0)}</Text>
                </View>
              )}

              {/* Shipment Group */}
              <View style={styles.shipmentCard}>
                <View style={styles.shipmentHeader}>
                  <View style={styles.shipmentIconContainer}>
                    <Ionicons name="time-outline" size={20} color="#000" />
                  </View>
                  <View style={styles.shipmentHeaderTextContainer}>
                    <Text style={styles.shipmentTitle}>Delivery in 5–6 days</Text>
                    <Text style={styles.shipmentSubtitle}>Shipment of {totalItems} items</Text>
                  </View>
                </View>

                {items.map((item: any) => {
                  const uniqueId = item.variantId || item.productId;
                  return (
                    <CartItemCard
                      key={uniqueId}
                      id={uniqueId}
                      title={item.name}
                      size={item.attributes?.size || `${item.quantity} Pack`}
                      price={item.unitPrice}
                      mrp={item.mrp}
                      quantity={item.quantity}
                      imageUrl={item.imageUrl || ''}
                      isUpdating={isUpdating || isRemoving}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      onPress={() => handleProductPress(item.slug)}
                    />
                  );
                })}
              </View>

              <View style={styles.sectionDivider} />
              <CartRecommendations items={items} onProductPress={handleProductPress} />
              <View style={styles.sectionDivider} />

              <PriceBreakdown
                subtotal={totals.subtotal || 0}
                discountAmount={totalSavings}
                shippingCost={totals.shippingCost || 0}
                estimatedTax={totals.estimatedTax || 0}
                handlingCharge={totals.handlingCharge || 0}
                grandTotal={totals.grandTotal || 0}
                totalItems={totalItems}
              />

              <View style={styles.cancelPolicyCard}>
                <Text style={styles.policyTitle}>Cancellation Policy</Text>
                <Text style={styles.policyText}>
                  Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
                </Text>
              </View>

              <View style={{ height: hp('15%') }} />
            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
              <View style={styles.footerContent}>
                <View style={styles.footerPriceContainer}>
                  <Text style={styles.footerPrice}>₹{totals.grandTotal?.toFixed(0)}</Text>
                  <Text style={styles.footerTotalLabel}>TOTAL</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkoutBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    closeCart();
                    router.push('/checkout/location');
                  }}
                >
                  <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

function cartDataExists(cart: any) {
  return cart && Array.isArray(cart.items);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: RFValue(14),
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: wp('3%'),
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  savingsBannerText: {
    fontSize: RFValue(12),
    fontFamily: 'Inter_600SemiBold',
    color: '#0D47A1',
  },
  savingsBannerAmount: {
    fontSize: RFValue(12),
    fontFamily: 'Inter_700Bold',
    color: '#0D47A1',
  },
  shipmentCard: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
  },
  shipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  shipmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shipmentHeaderTextContainer: {
    flex: 1,
  },
  shipmentTitle: {
    fontSize: RFValue(14),
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  shipmentSubtitle: {
    fontSize: RFValue(11),
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 2,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F8F9FA',
    marginHorizontal: -wp('3%'),
  },
  cancelPolicyCard: {
    marginTop: 16,
    padding: 16,
  },
  policyTitle: {
    fontSize: RFValue(13),
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  policyText: {
    fontSize: RFValue(11),
    fontFamily: 'Inter_400Regular',
    color: '#888',
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingBottom: hp('3%'),
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerContent: {
    backgroundColor: '#0C5273',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  footerPriceContainer: {
    paddingLeft: 4,
  },
  footerPrice: {
    fontSize: RFValue(15),
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
  },
  footerTotalLabel: {
    fontSize: RFValue(9),
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: -2,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutBtnText: {
    fontSize: RFValue(14),
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
    marginRight: 4,
  },
});

export default CartModal;
