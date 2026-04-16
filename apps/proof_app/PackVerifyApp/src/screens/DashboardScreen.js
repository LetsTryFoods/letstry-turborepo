
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

// BACKEND IMPORTS
import { useQuery } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GET_MY_ASSIGNED_ORDERS } from '../graphql/queries';

const DashboardScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({ name: 'Packer' });
  
  // 1. Get User from Storage
  useEffect(() => {
    // Try to get user from params OR storage
    if (route.params?.user) {
        setUser(route.params.user);
    } else {
        AsyncStorage.getItem('user').then(u => {
            if (u) setUser(JSON.parse(u));
        });
    }
  }, [route.params]);

  // 2. FETCH ORDERS
  const { data, loading, error, refetch } = useQuery(GET_MY_ASSIGNED_ORDERS, {
    pollInterval: 5000,
  });

  const handleOrderPress = (order) => {
    if (!order.id) {
      Alert.alert('Error', 'This order has no ID. Cannot open.');
      return;
    }
    navigation.navigate('OrderDetails', {
      order: order,
      user: user,
    });
  };

  const renderOrderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item.orderNumber || item.orderId}</Text>
        <View style={styles.badges}>
          {item.isExpress && (
            <View style={styles.badgeExpress}>
              <Text style={styles.badgeText}>⚡ EXPRESS</Text>
            </View>
          )}
          <View style={[styles.badge, item.status === 'assigned' ? styles.badgeAssigned : styles.badgeProgress]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {item.specialInstructions ? (
        <Text style={styles.instructions}>⚠ {item.specialInstructions}</Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <Text style={styles.itemsText}>{item.items?.length || 0} product type(s)</Text>
        <Text style={styles.totalQty}>
          {item.items?.reduce((s, i) => s + i.quantity, 0) || 0} items total
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
            <Ionicons name="reload" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>My Tasks</Text>

        {loading && !data ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={data?.getMyAssignedOrders || []}
            keyExtractor={item => item.id}
            renderItem={renderOrderCard}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No orders assigned right now.</Text>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { color: '#e2e8f0', fontSize: 14 },
  userName: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  refreshBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  listContainer: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: COLORS.textDark },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 50 },

  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark, flex: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeExpress: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#fef3c7' },
  badgeAssigned: { backgroundColor: '#e0f2fe' },
  badgeProgress: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.textDark, textTransform: 'uppercase' },
  instructions: { fontSize: 12, color: '#f59e0b', marginTop: 6 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemsText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  totalQty: { fontSize: 12, color: COLORS.textLight },
});

export default DashboardScreen;