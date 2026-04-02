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
import { GET_MY_ORDERS } from '../../src/lib/graphql/order';

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
  const { data, loading, error, refetch } = useQuery(GET_MY_ORDERS, {
    variables: { input: { page: 1, limit: 20 } },
    fetchPolicy: 'network-only',
  });

  const orders = data?.getMyOrders?.orders || [];

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
        onPress={() => router.push({ pathname: '/orders/track', params: { orderId: item.orderId } })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderIdText}>Order #{item.orderId}</Text>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          {renderStatusBadge(item.orderStatus)}
        </View>

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
      <Stack.Screen options={{ title: 'My Orders', headerShown: true }} />
      
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
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderIdText: {
    fontSize: RFValue(14),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: RFValue(12),
    color: theme.colors.text.muted,
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
