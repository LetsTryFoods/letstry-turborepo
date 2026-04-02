import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { GET_MY_ORDERS } from '../../src/lib/graphql/order';
import { theme } from '../../src/styles/theme';
import { RFValue, wp, hp } from '../../src/lib/utils/ui-utils';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';

export default function TrackOrderScreen() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [awb, setAwb] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: myOrdersData, loading: myOrdersLoading } = useQuery(GET_MY_ORDERS, {
    variables: { input: { page: 1, limit: 5 } },
    fetchPolicy: 'cache-and-network',
  });

  const recentOrders = myOrdersData?.getMyOrders?.orders || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'cancelled': return '#E53935';
      case 'delivered': return '#43A047';
      case 'shipped': return '#FB8C00';
      case 'preparing': return '#0C5273';
      default: return '#666';
    }
  };

  const handleSearch = async () => {
    const filledCount = [orderId.trim(), phone.trim(), awb.trim()].filter(Boolean).length;

    if (filledCount === 0) {
      Alert.alert('Error', 'Please enter at least one field to search.');
      return;
    }

    if (filledCount > 1) {
      Alert.alert('Error', 'Please enter only one field to search.');
      return;
    }

    const query = orderId.trim() || phone.trim() || awb.trim();
    setIsSearching(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await fetch(`https://apiv3.letstryfoods.com/shipments/lookup?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok && data.awbNumber) {
        router.push(`/orders/${data.awbNumber}`);
      } else {
        Alert.alert('No Shipment Found', data.message || 'No shipment found for the provided details.');
      }
    } catch (error) {
      console.error('Tracking Lookup Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const renderRecentOrder = (item: any) => (
    <TouchableOpacity 
      key={item._id} 
      style={styles.recentOrderCard}
      onPress={() => {
        if (item.shipment?.trackingNumber) {
          router.push(`/orders/${item.shipment.trackingNumber}`);
        } else {
          Alert.alert('Status', `Order is currently: ${item.status}`);
        }
      }}
    >
      <View style={styles.recentOrderInfo}>
        <Text style={styles.recentOrderId}>Order #{item.orderId}</Text>
        <Text style={styles.recentOrderDate}>{dayjs(item.createdAt).format('DD MMM')}</Text>
      </View>
      <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={[styles.statusTagText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Your Order</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.searchSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="cube-outline" size={32} color="#0C5273" />
            </View>
            <Text style={styles.introTitle}>Track Your Shipment</Text>
            <Text style={styles.introSub}>Enter any one of the details below to find your order status.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Order ID</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ORD-123456"
                value={orderId}
                onChangeText={setOrderId}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9876543210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>AWB Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 7D12345678"
                value={awb}
                onChangeText={setAwb}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity 
              style={[styles.trackBtn, isSearching && styles.disabledBtn]} 
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.trackBtnText}>Track Now</Text>
              )}
            </TouchableOpacity>
          </View>

          {recentOrders.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              {recentOrders.map(renderRecentOrder)}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
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
  scrollContent: { padding: wp('5%'), paddingBottom: 40 },
  searchSection: { alignItems: 'center', marginVertical: 30 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: { fontSize: RFValue(18), fontWeight: '800', color: '#333', marginBottom: 8 },
  introSub: { fontSize: RFValue(12), color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  form: { gap: 12 },
  inputGroup: { gap: 6 },
  label: { fontSize: RFValue(12), fontWeight: '700', color: '#444' },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    fontSize: RFValue(14),
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#333',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  divider: { flex: 1, height: 1, backgroundColor: '#EEE' },
  dividerText: { marginHorizontal: 12, fontSize: RFValue(10), color: '#BBB', fontWeight: '700' },
  trackBtn: {
    backgroundColor: '#0C5273',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#0C5273',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  trackBtnText: { color: '#FFF', fontSize: RFValue(15), fontWeight: '800' },
  disabledBtn: { opacity: 0.7 },
  recentSection: { marginTop: 40 },
  sectionTitle: { fontSize: RFValue(13), fontWeight: '800', color: '#666', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  recentOrderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  recentOrderInfo: { gap: 4 },
  recentOrderId: { fontSize: RFValue(13), fontWeight: '700', color: '#333' },
  recentOrderDate: { fontSize: RFValue(11), color: '#888' },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusTagText: { fontSize: RFValue(10), fontWeight: '800', textTransform: 'uppercase' },
});
