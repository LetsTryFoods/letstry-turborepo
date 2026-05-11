import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { theme } from '../../src/styles/theme';
import { RFValue, wp } from '../../src/lib/utils/ui-utils';
import { GET_MY_ORDERS, GET_GUEST_ORDERS } from '../../src/lib/graphql/order';
import { useAuthStore } from '../../src/store/auth-store';

const ORDER_STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#2B6CB0', // Blue
  PACKED: '#805AD5',    // Purple
  SHIPPED: '#3182CE',   // Light Blue
  IN_TRANSIT: '#D69E2E', // Yellow/Gold
  DELIVERED: '#38A169',  // Green
  CANCELLED: '#E53E3E',  // Red
  SHIPMENT_FAILED: '#E53E3E',
};

export default function OrdersScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Logged-in users → getMyOrders (JWT-authenticated)
  // Guest users     → getGuestOrders (x-session-id + x-mobile-key)
  const query = isAuthenticated ? GET_MY_ORDERS : GET_GUEST_ORDERS;

  const { data, loading, error, refetch } = useQuery(query, {
    variables: { input: { page: 1, limit: 20 } },
    fetchPolicy: 'network-only',
  });

  const orders = (
    isAuthenticated
      ? data?.getMyOrders?.orders
      : data?.getGuestOrders?.orders
  ) || [];

  const renderStatusBadge = (status: string) => {
    const color = ORDER_STATUS_COLORS[status] || theme.colors.text.muted;
    return (
      <View style={[styles.statusBadge, { backgroundColor: color + '15' }]}>
        <Text style={[styles.statusText, { color }]}>{status.replace('_', ' ')}</Text>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const firstItem = item.items[0];
    const moreItems = item.items.length - 1;

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => router.push({ pathname: '/orders/[orderId]', params: { orderId: item.orderId } })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.recentOrderInfo}>
            <Text style={styles.recentOrderId}>Order #{item.orderId}</Text>
            <Text style={styles.recentOrderDate}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          {renderStatusBadge(item.orderStatus)}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.imageContainer}>
            {firstItem?.image ? (
              <Image source={{ uri: firstItem.image }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]}>
                <Ionicons name="basket" size={24} color={theme.colors.text.muted} />
              </View>
            )}
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>
              {firstItem?.name || 'Multiple Items'}
            </Text>
            <Text style={styles.itemSubtext}>
              {moreItems > 0 ? `+ ${moreItems} more items` : `${firstItem?.variant || 'Standard'}`}
            </Text>
            <Text style={styles.priceText}>
              ₹{parseFloat(item.totalAmount).toLocaleString('en-IN')}
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="receipt-outline" size={48} color={theme.colors.text.muted} />
      </View>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        Looks like you haven't placed any orders yet. Start shopping to fill this space!
      </Text>
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => refetch()} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  listContent: { padding: wp('5%'), paddingBottom: 40 },
  orderCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentOrderInfo: { gap: 4 },
  recentOrderId: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#333',
  },
  recentOrderDate: {
    fontSize: RFValue(11),
    color: '#888',
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: RFValue(10),
    fontWeight: theme.fontWeight.bold,
    textTransform: 'uppercase',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: RFValue(14),
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  itemSubtext: {
    fontSize: RFValue(12),
    color: theme.colors.text.muted,
    marginBottom: 4,
  },
  priceText: {
    fontSize: RFValue(15),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: RFValue(20),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: RFValue(14),
    color: theme.colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: RFValue(14),
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
});
