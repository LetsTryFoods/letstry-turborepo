import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { RFValue, wp } from '../../src/lib/utils/ui-utils';
import * as Haptics from 'expo-haptics';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Success Animation / Icon */}
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
              <Text style={styles.orderValue}>#{orderId || 'PENDING'}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Payment Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>SUCCESS</Text>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.tipCard}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.tipText}>
              We'll send you updates when your order status changes!
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.replace('/orders')}
            >
              <Text style={styles.primaryButtonText}>View Order Details</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
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
    paddingTop: 60 
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
    fontSize: RFValue(24),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: theme.colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 22,
    marginBottom: 40,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  orderLabel: {
    fontSize: RFValue(14),
    color: theme.colors.text.muted,
    fontWeight: theme.fontWeight.medium,
  },
  orderValue: {
    fontSize: RFValue(14),
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
    padding: 16,
    borderRadius: 16,
    width: '100%',
    marginBottom: 40,
  },
  tipText: {
    flex: 1,
    fontSize: RFValue(12),
    color: '#075985',
    marginLeft: 12,
    lineHeight: 18,
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
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    fontSize: RFValue(16),
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.bold,
  },
});
