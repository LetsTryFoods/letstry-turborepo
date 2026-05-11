import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { GET_ORDER_BY_ID, GET_GUEST_ORDER_BY_ID, GET_SHIPMENT_TRACKING, GET_GUEST_SHIPMENT_TRACKING } from '../../src/lib/graphql/order';
import { useAuthStore } from '../../src/store/auth-store';
import { theme } from '../../src/styles/theme';
import { RFValue, wp } from '../../src/lib/utils/ui-utils';
import dayjs from 'dayjs';

// ─── Order status pipeline (Amazon-style) ───────────────────────────────────
const ORDER_STEPS = [
  { key: 'CONFIRMED',       label: 'Confirmed',     icon: 'checkmark-circle' },
  { key: 'PACKED',          label: 'Packed',         icon: 'cube' },
  { key: 'SHIPPED',         label: 'Shipped',        icon: 'car' },
  { key: 'IN_TRANSIT',      label: 'In Transit',     icon: 'navigate' },
  { key: 'DELIVERED',       label: 'Delivered',      icon: 'home' },
];

const CANCELLED_STEPS = [
  { key: 'CONFIRMED',       label: 'Confirmed',     icon: 'checkmark-circle' },
  { key: 'CANCELLED',       label: 'Cancelled',     icon: 'close-circle' },
];

const STATUS_ORDER: Record<string, number> = {
  CONFIRMED: 0,
  PACKED: 1,
  SHIPPED: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
  SHIPMENT_FAILED: 3,
  CANCELLED: 1,
};

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED:       '#2B6CB0',
  PACKED:          '#805AD5',
  SHIPPED:         '#3182CE',
  IN_TRANSIT:      '#D69E2E',
  DELIVERED:       '#38A169',
  CANCELLED:       '#E53E3E',
  SHIPMENT_FAILED: '#E53E3E',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID:     '#38A169',
  PENDING:  '#D69E2E',
  FAILED:   '#E53E3E',
  REFUNDED: '#805AD5',
};

// ─── Tracking timeline entry ─────────────────────────────────────────────────
function TrackingEntry({ entry, isFirst }: { entry: any; isFirst: boolean }) {
  return (
    <View style={tStyles.entry}>
      <View style={tStyles.lineCol}>
        <View style={[tStyles.dot, isFirst && tStyles.dotActive]} />
        <View style={tStyles.line} />
      </View>
      <View style={tStyles.content}>
        <Text style={[tStyles.desc, isFirst && tStyles.descActive]}>
          {entry.statusDescription}
        </Text>
        {entry.location ? (
          <Text style={tStyles.location}>
            <Ionicons name="location-outline" size={11} color="#888" /> {entry.location}
          </Text>
        ) : null}
        <Text style={tStyles.time}>
          {dayjs(entry.actionDatetime).format('DD MMM YYYY, h:mm A')}
        </Text>
        {entry.remarks ? <Text style={tStyles.remarks}>{entry.remarks}</Text> : null}
      </View>
    </View>
  );
}

// ─── Progress stepper ────────────────────────────────────────────────────────
function OrderProgressStepper({ orderStatus }: { orderStatus: string }) {
  const isCancelled = orderStatus === 'CANCELLED';
  const steps = isCancelled ? CANCELLED_STEPS : ORDER_STEPS;
  const currentIdx = STATUS_ORDER[orderStatus] ?? 0;

  return (
    <View style={stepStyles.container}>
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const color = active
          ? (STATUS_COLOR[orderStatus] || theme.colors.primary)
          : done ? '#38A169' : '#DDD';

        return (
          <View key={step.key} style={stepStyles.stepRow}>
            {/* Connector line above */}
            {idx > 0 && (
              <View style={[stepStyles.connectorLine, { backgroundColor: done || active ? '#38A169' : '#DDD' }]} />
            )}
            <View style={stepStyles.iconWrap}>
              <View style={[stepStyles.iconCircle, { backgroundColor: color + '18', borderColor: color }]}>
                <Ionicons
                  name={step.icon as any}
                  size={18}
                  color={color}
                />
              </View>
            </View>
            <Text style={[stepStyles.label, active && { color, fontWeight: '700' }, done && { color: '#38A169' }]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [showFullHistory, setShowFullHistory] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = isAuthenticated ? GET_ORDER_BY_ID : GET_GUEST_ORDER_BY_ID;

  const { data, loading, error } = useQuery(query, {
    variables: { orderId },
    skip: !orderId,
    fetchPolicy: 'network-only',
  });

  const order = isAuthenticated ? data?.getOrderById : data?.getGuestOrderById;
  const awbNumber = order?.shipment?.dtdcAwbNumber;

  // Fetch live tracking history only if we have an AWB
  const trackingQuery = isAuthenticated ? GET_SHIPMENT_TRACKING : GET_GUEST_SHIPMENT_TRACKING;
  const { data: trackingData, loading: trackingLoading } = useQuery(trackingQuery, {
    variables: { awbNumber },
    skip: !awbNumber,
    fetchPolicy: 'network-only',
  });

  const trackingHistory: any[] = (
    isAuthenticated
      ? trackingData?.getShipmentWithTracking?.trackingHistory
      : trackingData?.getGuestShipmentWithTracking?.trackingHistory
  ) || [];
  const visibleHistory = showFullHistory ? trackingHistory : trackingHistory.slice(0, 4);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.text.muted} />
          <Text style={styles.errorText}>Could not load order details</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLOR[order.orderStatus] || theme.colors.text.muted;
  const subtotal = parseFloat(order.subtotal || '0');
  const discount = parseFloat(order.discount || '0');
  const deliveryCharge = parseFloat(order.deliveryCharge || '0');
  const total = parseFloat(order.totalAmount || '0');
  const shipment = order.shipment;

  const expectedDate = shipment?.revisedExpectedDeliveryDate || shipment?.expectedDeliveryDate;

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Order #{order.orderId}</Text>
          <Text style={styles.headerSub}>
            {dayjs(order.createdAt).format('DD MMM YYYY')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Status Banner ── */}
        <View style={[styles.statusBanner, { borderLeftColor: statusColor }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusBannerLabel}>Order Status</Text>
            <Text style={[styles.statusBannerValue, { color: statusColor }]}>
              {order.orderStatus.replace(/_/g, ' ')}
            </Text>
            {expectedDate && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
              <Text style={styles.expectedDelivery}>
                <Ionicons name="time-outline" size={12} color="#666" />{' '}
                Expected by {dayjs(expectedDate).format('DD MMM YYYY')}
              </Text>
            )}
            {order.orderStatus === 'DELIVERED' && shipment?.deliveredAt && (
              <Text style={[styles.expectedDelivery, { color: '#38A169' }]}>
                <Ionicons name="checkmark-circle" size={12} color="#38A169" />{' '}
                Delivered on {dayjs(shipment.deliveredAt).format('DD MMM YYYY')}
              </Text>
            )}
          </View>
          <Ionicons
            name={order.orderStatus === 'DELIVERED' ? 'checkmark-circle' : 'time-outline'}
            size={32}
            color={statusColor}
          />
        </View>

        {/* ── Progress Stepper ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <OrderProgressStepper orderStatus={order.orderStatus} />
        </View>

        {/* ── Live Tracking ── */}
        {awbNumber && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Live Tracking</Text>
              {shipment?.trackingLink && (
                <TouchableOpacity onPress={() => Linking.openURL(shipment.trackingLink)}>
                  <Text style={styles.trackLinkText}>
                    <Ionicons name="open-outline" size={13} color={theme.colors.primary} /> Track Online
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Shipment summary chips */}
            <View style={styles.shipmentChips}>
              <View style={styles.chip}>
                <Ionicons name="barcode-outline" size={13} color="#555" />
                <Text style={styles.chipText}>AWB: {awbNumber}</Text>
              </View>
              {shipment?.originCity && shipment?.destinationCity && (
                <View style={styles.chip}>
                  <Ionicons name="navigate-outline" size={13} color="#555" />
                  <Text style={styles.chipText}>{shipment.originCity} → {shipment.destinationCity}</Text>
                </View>
              )}
              {shipment?.currentLocation && (
                <View style={styles.chip}>
                  <Ionicons name="location-outline" size={13} color="#555" />
                  <Text style={styles.chipText}>{shipment.currentLocation}</Text>
                </View>
              )}
            </View>

            {/* Current status */}
            {shipment?.currentStatusDescription && (
              <View style={styles.currentStatusBox}>
                <Ionicons name="radio-button-on" size={16} color={statusColor} />
                <Text style={[styles.currentStatusText, { color: statusColor }]}>
                  {shipment.currentStatusDescription}
                </Text>
              </View>
            )}

            {/* Tracking timeline */}
            {trackingLoading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 12 }} />
            ) : trackingHistory.length > 0 ? (
              <View style={{ marginTop: 12 }}>
                {visibleHistory.map((entry: any, idx: number) => (
                  <TrackingEntry key={idx} entry={entry} isFirst={idx === 0} />
                ))}
                {trackingHistory.length > 4 && (
                  <TouchableOpacity
                    style={styles.showMoreBtn}
                    onPress={() => setShowFullHistory(!showFullHistory)}
                  >
                    <Text style={styles.showMoreText}>
                      {showFullHistory
                        ? 'Show Less'
                        : `Show ${trackingHistory.length - 4} More Updates`}
                    </Text>
                    <Ionicons
                      name={showFullHistory ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <Text style={styles.noTrackingText}>
                Tracking updates will appear here once your order is shipped.
              </Text>
            )}
          </View>
        )}

        {/* ── Items ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {order.items.map((item: any, idx: number) => (
            <View key={idx} style={[styles.itemRow, idx === order.items.length - 1 && { borderBottomWidth: 0 }]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                  <Ionicons name="basket-outline" size={20} color={theme.colors.text.muted} />
                </View>
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                {item.variant ? <Text style={styles.itemVariant}>{item.variant}</Text> : null}
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <View style={styles.itemPriceBlock}>
                <Text style={styles.itemPrice}>
                  ₹{parseFloat(item.totalPrice || item.price || '0').toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Price Breakdown ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, { color: '#38A169' }]}>- ₹{discount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Charge</Text>
            <Text style={styles.priceValue}>
              {deliveryCharge === 0
                ? <Text style={{ color: '#38A169' }}>FREE</Text>
                : `₹${deliveryCharge.toLocaleString('en-IN')}`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* ── Payment ── */}
        {order.payment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Method</Text>
              <Text style={styles.infoValue}>{order.payment.method || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: PAYMENT_STATUS_COLORS[order.payment.status] || '#333' }]}>
                {order.payment.status}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount Paid</Text>
              <Text style={styles.infoValue}>₹{parseFloat(order.payment.amount || '0').toLocaleString('en-IN')}</Text>
            </View>
          </View>
        )}

        {/* ── Delivery Address ── */}
        {order.shippingAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressBlock}>
              <Ionicons name="location-outline" size={16} color={theme.colors.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
                <Text style={styles.addressLine}>{order.shippingAddress.phone}</Text>
                <Text style={styles.addressLine}>{order.shippingAddress.addressLine1}</Text>
                {order.shippingAddress.landmark ? (
                  <Text style={styles.addressLine}>Near: {order.shippingAddress.landmark}</Text>
                ) : null}
                <Text style={styles.addressLine}>
                  {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F4F6F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn:     { padding: 4, marginRight: 10 },
  headerTitle: { fontSize: RFValue(15), fontWeight: '700', color: '#333' },
  headerSub:   { fontSize: RFValue(11), color: '#999', marginTop: 1 },
  scroll:      { padding: wp('4%') },

  // Status banner
  statusBanner: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBannerLabel: { fontSize: RFValue(11), color: '#888', marginBottom: 3 },
  statusBannerValue: { fontSize: RFValue(16), fontWeight: '800', textTransform: 'uppercase' },
  expectedDelivery:  { fontSize: RFValue(11), color: '#666', marginTop: 4 },

  // Section
  section: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: '#333',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  trackLinkText: { fontSize: RFValue(12), color: theme.colors.primary, fontWeight: '600' },

  // Shipment chips
  shipmentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  chipText: { fontSize: RFValue(11), color: '#444' },

  // Current status box
  currentStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  currentStatusText: { fontSize: RFValue(13), fontWeight: '600' },

  noTrackingText: { fontSize: RFValue(12), color: '#999', marginTop: 8, lineHeight: 18 },

  // Show more
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
  },
  showMoreText: { fontSize: RFValue(12), color: theme.colors.primary, fontWeight: '600' },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage:            { width: 52, height: 52, borderRadius: 10, marginRight: 12 },
  itemImagePlaceholder: { backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  itemDetails:          { flex: 1 },
  itemName:             { fontSize: RFValue(13), fontWeight: '600', color: '#333', marginBottom: 2 },
  itemVariant:          { fontSize: RFValue(11), color: '#888', marginBottom: 2 },
  itemQty:              { fontSize: RFValue(11), color: '#888' },
  itemPriceBlock:       { alignItems: 'flex-end' },
  itemPrice:            { fontSize: RFValue(13), fontWeight: '700', color: theme.colors.primary },

  // Price breakdown
  priceRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: RFValue(13), color: '#666' },
  priceValue: { fontSize: RFValue(13), fontWeight: '600', color: '#333' },
  divider:    { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  totalLabel: { fontSize: RFValue(14), fontWeight: '800', color: '#333' },
  totalValue: { fontSize: RFValue(14), fontWeight: '800', color: theme.colors.primary },

  // Info rows
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: RFValue(13), color: '#666' },
  infoValue: { fontSize: RFValue(13), fontWeight: '600', color: '#333' },

  // Address
  addressBlock: { flexDirection: 'row', alignItems: 'flex-start' },
  addressName:  { fontSize: RFValue(13), fontWeight: '700', color: '#333', marginBottom: 3 },
  addressLine:  { fontSize: RFValue(12), color: '#666', lineHeight: 18 },

  // Error
  errorText: { fontSize: RFValue(15), color: '#666', marginTop: 12, marginBottom: 20 },
  retryBtn:  { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: RFValue(14) },
});

// ─── Progress stepper styles ──────────────────────────────────────────────────
const stepStyles = StyleSheet.create({
  container:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepRow:       { flex: 1, alignItems: 'center', position: 'relative' },
  connectorLine: {
    position: 'absolute',
    top: 18,
    right: '50%',
    width: '100%',
    height: 2,
    zIndex: 0,
  },
  iconWrap:   { zIndex: 1 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FB',
  },
  label: {
    fontSize: RFValue(9),
    color: '#BBB',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },
});

// ─── Tracking entry styles ────────────────────────────────────────────────────
const tStyles = StyleSheet.create({
  entry:       { flexDirection: 'row', marginBottom: 0 },
  lineCol:     { alignItems: 'center', width: 24, marginRight: 12 },
  dot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DDD', marginTop: 4 },
  dotActive:   { backgroundColor: theme.colors.primary, width: 12, height: 12, borderRadius: 6 },
  line:        { width: 2, flex: 1, backgroundColor: '#EEE', marginTop: 2, minHeight: 28 },
  content:     { flex: 1, paddingBottom: 20 },
  desc:        { fontSize: RFValue(13), fontWeight: '500', color: '#666' },
  descActive:  { color: '#111', fontWeight: '700' },
  location:    { fontSize: RFValue(11), color: '#888', marginTop: 2 },
  time:        { fontSize: RFValue(11), color: '#AAA', marginTop: 3 },
  remarks:     { fontSize: RFValue(11), color: '#999', marginTop: 2, fontStyle: 'italic' },
});
