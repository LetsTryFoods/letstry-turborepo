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
import { RFValue } from '../../src/lib/utils/ui-utils';
import * as Haptics from 'expo-haptics';

export default function PaymentFailedScreen() {
  const router = useRouter();
  const { paymentOrderId, error } = useLocalSearchParams();

  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Error Icon */}
          <View style={styles.iconCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="close" size={60} color="#fff" />
            </View>
          </View>

          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.subtitle}>
            {error || "We couldn't process your payment. Please check your details and try again."}
          </Text>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Identifier</Text>
              <Text style={styles.value}>#{paymentOrderId || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Reason</Text>
              <Text style={styles.value}>Transaction Declined</Text>
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.tipCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#C53030" />
            <Text style={styles.tipText}>
              Ensure your card balance is sufficient and international transactions are enabled.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>Retry Payment</Text>
              <Ionicons name="refresh" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.secondaryButtonText}>Return to Home</Text>
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
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E53E3E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E53E3E',
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
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: RFValue(14),
    color: '#9B2C2C',
    fontWeight: theme.fontWeight.medium,
  },
  value: {
    fontSize: RFValue(14),
    color: '#742A2A',
    fontWeight: theme.fontWeight.bold,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    marginBottom: 40,
  },
  tipText: {
    flex: 1,
    fontSize: RFValue(12),
    color: '#9B2C2C',
    marginLeft: 12,
    lineHeight: 18,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2D3748',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
