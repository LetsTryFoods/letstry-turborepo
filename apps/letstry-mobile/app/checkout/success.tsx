import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { theme } from '../../src/styles/theme';
import { RFValue, wp } from '../../src/lib/utils/ui-utils';
import * as Haptics from 'expo-haptics';
import { GET_MY_ORDERS, GET_GUEST_ORDERS } from '../../src/lib/graphql/order';
import { useAuthStore } from '../../src/store/auth-store';

export default function OrderSuccessScreen() {
  const router = useRouter();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const query = isAuthenticated ? GET_MY_ORDERS : GET_GUEST_ORDERS;

  // Fetch the latest order to display the real Order ID (not the payment reference)
  const { data, loading } = useQuery(query, {
    variables: { input: { page: 1, limit: 1 } },
    fetchPolicy: 'network-only',
  });

  const latestOrder = (
    isAuthenticated
      ? data?.getMyOrders?.orders?.[0]
      : data?.getGuestOrders?.orders?.[0]
  );

  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Success Icon */}
          <View style={styles.iconCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="checkmark" size={60} color="#fff" />
            </View>
          </View>

          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.subtitle}>
            Your order has been confirmed and is being prepared for shipment.
          </Text>

          {/* Order Info Card */}
          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order ID</Text>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={styles.orderValue}>
                  #{latestOrder?.orderId || 'PENDING'}
                </Text>
              )}
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Payment Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>SUCCESS</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            {latestOrder && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push({ pathname: '/orders/[orderId]', params: { orderId: latestOrder.orderId } })}
              >
                <Ionicons name="receipt-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>View Order Details</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.primaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 24,
    paddingTop: 40,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  innerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#38A169',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38A169',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(13),
    color: theme.colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
    marginBottom: 24,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  orderLabel: {
    fontSize: RFValue(12),
    color: theme.colors.text.muted,
    fontWeight: theme.fontWeight.medium,
  },
  orderValue: {
    fontSize: RFValue(12),
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.bold,
  },
  statusBadge: {
    backgroundColor: '#C6F6D5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: RFValue(11),
    fontWeight: theme.fontWeight.bold,
    color: '#22543D',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  tipText: {
    flex: 1,
    fontSize: RFValue(12),
    color: '#075985',
    marginLeft: 10,
    lineHeight: 17,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: RFValue(16),
    color: '#fff',
    fontWeight: theme.fontWeight.bold,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
  },
  secondaryButtonText: {
    fontSize: RFValue(15),
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
});
