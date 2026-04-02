import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_CART, SET_SHIPPING_ADDRESS } from '../../src/lib/graphql/cart';
import { INITIATE_PAYMENT } from '../../src/lib/graphql/payment';
import { GET_MY_ADDRESSES } from '../../src/lib/graphql/address';
import { wp, RFValue, getImageUrl } from '../../src/lib/utils/ui-utils';
import { getOrCreateIdempotencyKey, clearIdempotencyKey } from '../../src/lib/utils/idempotency';

export default function CheckoutSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ addressId: string }>();
  const { addressId } = params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingAddress, setIsSettingAddress] = useState(false);

  const { data: cartData, loading: cartLoading, refetch: refetchCart } = useQuery(GET_MY_CART);
  const { data: addressesData } = useQuery(GET_MY_ADDRESSES);

  const cart = cartData?.myCart;
  const cartId = cart?._id;
  const selectedAddress = addressesData?.myAddresses?.find(
    (a: any) => a._id === addressId,
  );

  const [setShippingAddress] = useMutation(SET_SHIPPING_ADDRESS);
  const [initiatePayment] = useMutation(INITIATE_PAYMENT);

  const totals = cart?.totalsSummary;

  // Sync address to cart on mount to ensure fresh totals/delivery charges
  React.useEffect(() => {
    const syncAddress = async () => {
      if (addressId && cartId) {
        setIsSettingAddress(true);
        try {
          await setShippingAddress({
            variables: { input: { addressId } },
          });
          // Mutation returns updated cart totals, but refetching is safer for cache consistency
          await refetchCart();
        } catch (err) {
          console.error('[Summary] Address Sync Error:', err);
        } finally {
          setIsSettingAddress(false);
        }
      }
    };
    syncAddress();
  }, [addressId, cartId]);

  const handleProceedToPay = async () => {
    if (!cartId) {
      Alert.alert('Error', 'Cart not found. Please try again.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Initiate Payment with idempotency key (same as web frontend)
      const idempotencyKey = await getOrCreateIdempotencyKey();
      const paymentResult = await initiatePayment({
        variables: { input: { cartId, idempotencyKey } },
      });

      console.log('[Summary] RAW Payment Response:', JSON.stringify(paymentResult.data, null, 2));

      const paymentData = paymentResult.data?.initiatePayment;
      const finalUrl =
        paymentData?.redirectUrl || paymentData?.checkoutUrl || paymentData?.paymentUrl;

      if (!finalUrl) {
        await clearIdempotencyKey();
        throw new Error('Could not initialize payment gateway. Please try again.');
      }

      await clearIdempotencyKey();

      router.push({
        pathname: '/checkout/payment',
        params: { paymentUrl: finalUrl },
      });
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err.message;
      if (!errorMessage?.includes('Cart has changed')) {
        await clearIdempotencyKey();
      }
      Alert.alert('Payment Failed', errorMessage || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartLoading || isSettingAddress) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0C5273" />
        <Text style={styles.loadingText}>Loading current delivery charges...</Text>
      </View>
    );
  }

  const isDiscount = totals && totals.discountAmount > 0;
  const isHandling = totals && totals.handlingCharge > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-sharp" size={18} color="#0C5273" />
            <Text style={styles.sectionTitle}>Delivering To</Text>
          </View>
          {selectedAddress ? (
            <View style={styles.addressCard}>
              <View style={styles.addressBadge}>
                <Ionicons
                  name={
                    selectedAddress.addressType === 'Home'
                      ? 'home'
                      : selectedAddress.addressType === 'Work'
                        ? 'briefcase'
                        : 'location'
                  }
                  size={14}
                  color="#0C5273"
                />
                <Text style={styles.addressBadgeText}>{selectedAddress.addressType}</Text>
              </View>
              <Text style={styles.addressName}>{selectedAddress.recipientName}</Text>
              <Text style={styles.addressPhone}>{selectedAddress.recipientPhone}</Text>
              <Text style={styles.addressText}>
                {selectedAddress.buildingName}
                {selectedAddress.floor ? `, ${selectedAddress.floor}` : ''}
              </Text>
              <Text style={styles.addressText}>{selectedAddress.formattedAddress}</Text>
            </View>
          ) : (
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>New address selected</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.changeBtnText}>Change Address</Text>
          </TouchableOpacity>

          {/* Delivery estimate */}
          <View style={styles.deliveryEstimate}>
            <Ionicons name="time-outline" size={14} color="#0C5273" />
            <Text style={styles.deliveryEstimateText}>Estimated delivery in <Text style={styles.deliveryEstimateBold}>5–6 days</Text></Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag-handle" size={18} color="#0C5273" />
            <Text style={styles.sectionTitle}>
              Your Items ({cart?.items?.length || 0})
            </Text>
          </View>
          {cart?.items?.map((item: any, index: number) => (
            <View key={`${item.productId}-${index}`} style={styles.itemRow}>
              {item.imageUrl ? (
                <Image source={{ uri: getImageUrl(item.imageUrl) }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                  <Ionicons name="image-outline" size={20} color="#ccc" />
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                {item.attributes?.weight && (
                  <Text style={styles.itemVariant}>{item.attributes.weight}</Text>
                )}
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  {item.mrp > item.unitPrice && (
                    <Text style={styles.itemMrp}>₹{item.mrp * item.quantity}</Text>
                  )}
                  <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={18} color="#0C5273" />
            <Text style={styles.sectionTitle}>Price Details</Text>
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₹{totals?.subtotal || 0}</Text>
            </View>

            {isDiscount && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, styles.discountLabel]}>
                  Discount
                </Text>
                <Text style={[styles.priceValue, styles.discountValue]}>
                  − ₹{totals.discountAmount}
                </Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Charges</Text>
              <Text
                style={[
                  styles.priceValue,
                  totals?.shippingCost === 0 && styles.freeText,
                ]}
              >
                {totals?.shippingCost === 0 ? 'FREE' : `₹${totals?.shippingCost}`}
              </Text>
            </View>

            {isHandling && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Handling Charge</Text>
                <Text style={styles.priceValue}>₹{totals.handlingCharge}</Text>
              </View>
            )}

            {totals?.estimatedTax > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Taxes</Text>
                <Text style={styles.priceValue}>₹{totals.estimatedTax}</Text>
              </View>
            )}

            <View style={styles.totalDivider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>₹{totals?.grandTotal || 0}</Text>
            </View>

            {isDiscount && (
              <View style={styles.savingsBanner}>
                <Ionicons name="pricetag" size={14} color="#16a34a" />
                <Text style={styles.savingsText}>
                  You save ₹{totals.discountAmount} on this order!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Note */}
        <View style={styles.secureNote}>
          <Ionicons name="lock-closed" size={14} color="#888" />
          <Text style={styles.secureNoteText}>
            Payments are secured via Zaakpay. Your data is encrypted & protected.
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>₹{totals?.grandTotal || 0}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payBtn, isProcessing && styles.payBtnDisabled]}
          onPress={handleProceedToPay}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.payBtnText}>Preparing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Proceed to Pay</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, fontSize: RFValue(12), color: '#666' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#222',
    marginLeft: 12,
  },
  scroll: { flex: 1 },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: wp('4%'),
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#222',
  },

  // Address
  addressCard: {
    backgroundColor: '#F7F9FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8eff8',
  },
  addressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  addressBadgeText: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: '#0C5273',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressName: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: RFValue(12),
    color: '#555',
    marginBottom: 6,
  },
  addressText: {
    fontSize: RFValue(12),
    color: '#666',
    lineHeight: 18,
  },
  changeBtn: { marginTop: 10, alignSelf: 'flex-start' },
  changeBtnText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#0C5273',
  },
  deliveryEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#EEF6FB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deliveryEstimateText: {
    fontSize: RFValue(12),
    color: '#444',
  },
  deliveryEstimateBold: {
    fontWeight: '700',
    color: '#0C5273',
  },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  itemImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#222',
    lineHeight: 18,
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: RFValue(11),
    color: '#888',
    marginBottom: 6,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQty: {
    fontSize: RFValue(12),
    color: '#888',
    flex: 1,
  },
  itemMrp: {
    fontSize: RFValue(12),
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
  itemPrice: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#222',
  },

  // Price breakdown
  priceCard: { gap: 10 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: RFValue(13),
    color: '#555',
  },
  priceValue: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#333',
  },
  discountLabel: { color: '#16a34a' },
  discountValue: { color: '#16a34a' },
  freeText: { color: '#16a34a', fontWeight: '700' },
  totalDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#222',
  },
  totalValue: {
    fontSize: RFValue(17),
    fontWeight: '800',
    color: '#0C5273',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  savingsText: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#16a34a',
  },

  // Secure note
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 20,
    paddingHorizontal: wp('8%'),
  },
  secureNoteText: {
    fontSize: RFValue(11),
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    flex: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  footerTotal: { flex: 1 },
  footerTotalLabel: {
    fontSize: RFValue(11),
    color: '#888',
    marginBottom: 2,
  },
  footerTotalValue: {
    fontSize: RFValue(20),
    fontWeight: '800',
    color: '#222',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C5273',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '700',
  },
});
