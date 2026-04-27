
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { getCdnUrl } from '../config/api';
import { useQuery } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GET_MY_ASSIGNED_ORDERS, GET_ALL_PACKING_ORDERS, GET_EVIDENCE_BY_ORDER } from '../graphql/queries';

const formatOrderTime = (createdAt) => {
  if (!createdAt) return 'N/A';
  const orderDate = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  }
  if (diffInMinutes < 2880) return 'Yesterday';
  
  const days = Math.floor(diffInMinutes / 1440);
  if (days < 7) return `${days}d ago`;
  
  return orderDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const DashboardScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({ name: 'Packer' });
  const [activeTab, setActiveTab] = useState('pending');
  const [completedOrders, setCompletedOrders] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({});
  
  useEffect(() => {
    if (route.params?.user) {
      setUser(route.params.user);
    } else {
      AsyncStorage.getItem('user').then(u => {
        if (u) setUser(JSON.parse(u));
      });
    }
  }, [route.params]);

  const { data: assignedData, loading: pendingLoading, error: pendingError, refetch: refetchPending } = useQuery(GET_MY_ASSIGNED_ORDERS, {
    pollInterval: 5000,
  });

  const { data: completedData, loading: completedLoading, refetch: refetchCompleted } = useQuery(GET_ALL_PACKING_ORDERS, {
    variables: { status: 'completed' },
    skip: activeTab !== 'completed',
    onCompleted: async (data) => {
      if (data?.getAllPackingOrders) {
        setCompletedOrders(data.getAllPackingOrders);
      }
    },
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

  const handleRefresh = async () => {
    await refetchPending();
    if (activeTab === 'completed') {
      await refetchCompleted();
    }
  };

  const pendingOrders = assignedData?.getMyAssignedOrders || [];
  const stats = {
    pending: pendingOrders.length,
    totalItems: pendingOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0),
    completed: completedOrders.length,
  };

  const renderOrderCard = ({ item, showEvidence }) => (
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
          <View style={[styles.badge, item.status === 'assigned' ? styles.badgeAssigned : item.status === 'completed' ? styles.badgeCompleted : styles.badgeProgress]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {item.specialInstructions ? (
        <Text style={styles.instructions}>⚠ {item.specialInstructions}</Text>
      ) : null}

      <View style={styles.timeRow}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
        <Text style={styles.timeText}>Placed {formatOrderTime(item.createdAt)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <Text style={styles.itemsText}>{item.items?.length || 0} product type(s)</Text>
        <Text style={styles.totalQty}>
          {item.items?.reduce((s, i) => s + i.quantity, 0) || 0} items total
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </View>

      {showEvidence && item.id && evidenceMap[item.id]?.prePackImages?.length > 0 && (
        <View style={styles.evidenceSection}>
          <Text style={styles.evidenceTitle}>📸 Evidence</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {evidenceMap[item.id].prePackImages.slice(0, 3).map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: getCdnUrl(img) }}
                style={styles.evidenceImage}
              />
            ))}
            {evidenceMap[item.id].prePackImages.length > 3 && (
              <View style={[styles.evidenceImage, styles.moreImages]}>
                <Text style={styles.moreText}>+{evidenceMap[item.id].prePackImages.length - 3}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStatsCard = ({ label, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
            <Ionicons name="reload" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={pendingLoading || completedLoading} onRefresh={handleRefresh} />}
      >
        <View style={styles.statsContainer}>
          {renderStatsCard({ label: 'Pending', value: stats.pending, icon: 'time', color: COLORS.primary })}
          {renderStatsCard({ label: 'Completed', value: stats.completed, icon: 'checkmark-circle', color: COLORS.secondary })}
          {renderStatsCard({ label: 'Items', value: stats.totalItems, icon: 'cube', color: '#8b5cf6' })}
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Ionicons name="time-outline" size={18} color={activeTab === 'pending' ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              Pending ({stats.pending})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={activeTab === 'completed' ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              Completed ({stats.completed})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {activeTab === 'pending' ? (
            <>
              {pendingLoading && !assignedData ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={pendingOrders}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => renderOrderCard({ item, showEvidence: false })}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No orders assigned right now.</Text>
                  }
                />
              )}
            </>
          ) : (
            <>
              {completedLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={completedOrders}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => renderOrderCard({ item, showEvidence: true })}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No completed orders yet.</Text>
                  }
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
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
  content: { flex: 1 },

  statsContainer: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  statCard: { backgroundColor: 'white', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, elevation: 1 },
  statIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statContent: { flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  statLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },

  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9', gap: 6 },
  tabActive: { backgroundColor: 'white', borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.primary },

  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 50 },

  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark, flex: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeExpress: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#fef3c7' },
  badgeAssigned: { backgroundColor: '#e0f2fe' },
  badgeProgress: { backgroundColor: '#fef3c7' },
  badgeCompleted: { backgroundColor: '#f0fdf4' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.textDark, textTransform: 'uppercase' },
  instructions: { fontSize: 12, color: '#f59e0b', marginTop: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 6, gap: 6 },
  timeText: { fontSize: 11, color: COLORS.textLight, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemsText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  totalQty: { fontSize: 12, color: COLORS.textLight },

  evidenceSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  evidenceTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  imageScroll: { flexDirection: 'row', gap: 8 },
  evidenceImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f1f5f9' },
  moreImages: { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary },
  moreText: { fontSize: 12, fontWeight: 'bold', color: 'white' },
});

export default DashboardScreen;
