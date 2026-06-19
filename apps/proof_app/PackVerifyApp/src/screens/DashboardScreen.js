import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  Linking
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { GET_MY_ASSIGNED_ORDERS, GET_MY_HISTORY, GET_MY_STATS } from '../graphql/queries';
import { API_URL } from '../config/api';
import HistoryCard from '../components/HistoryCard';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState({ name: 'Packer' });
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [isDownloadingBulkInvoice, setIsDownloadingBulkInvoice] = useState(false);
  const [isDownloadingBulkCustom, setIsDownloadingBulkCustom] = useState(false);

  // 1. Get User from Storage
  useEffect(() => {
    if (route.params?.user) {
      setUser(route.params.user);
    } else {
      AsyncStorage.getItem('user').then(u => {
        if (u) setUser(JSON.parse(u));
      });
    }
  }, [route.params]);

  // 2. FETCH DATA
  const { 
    data: activeData, 
    loading: activeLoading, 
    refetch: refetchActive 
  } = useQuery(GET_MY_ASSIGNED_ORDERS, { pollInterval: 10000 });

  const { 
    data: historyData, 
    loading: historyLoading, 
    refetch: refetchHistory 
  } = useQuery(GET_MY_HISTORY, {
    skip: activeTab === 'active',
    fetchPolicy: 'cache-and-network',
  });

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_MY_STATS);

  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 10;

  const onRefresh = useCallback(() => {
    refetchStats();
    if (activeTab === 'active') {
      refetchActive();
    } else {
      refetchHistory();
    }
  }, [activeTab]);

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

  const handleBulkDownloadInvoice = async () => {
    try {
      setIsDownloadingBulkInvoice(true);
      const orders = activeData?.getMyAssignedOrders || [];
      const ids = orders.map(o => o.orderId || o.id).join(',');
      if (!ids) return Alert.alert('No Orders', 'No active orders to download.');
      const restApiUrl = API_URL.replace('/graphql', '');
      const downloadUrl = `${restApiUrl}/orders/bulk/invoices?ids=${ids}`;
      await Linking.openURL(downloadUrl);
    } catch (err) {
      Alert.alert('Download Error', err.message || 'Failed to download invoices');
    } finally {
      setIsDownloadingBulkInvoice(false);
    }
  };

  const handleBulkDownloadCustomLabel = async () => {
    try {
      setIsDownloadingBulkCustom(true);
      const orders = activeData?.getMyAssignedOrders || [];
      const ids = orders.map(o => o.orderId || o.id).join(',');
      if (!ids) return Alert.alert('No Orders', 'No active orders to download.');
      const restApiUrl = API_URL.replace('/graphql', '');
      const downloadUrl = `${restApiUrl}/orders/bulk/custom-labels?ids=${ids}`;
      await Linking.openURL(downloadUrl);
    } catch (err) {
      Alert.alert('Download Error', err.message || 'Failed to download custom labels');
    } finally {
      setIsDownloadingBulkInvoice(false);
      setIsDownloadingBulkCustom(false);
    }
  };

  const completedHistory = historyData?.getMyOrderHistory?.filter(o => o.status === 'completed') || [];
  const totalHistoryPages = Math.ceil(completedHistory.length / itemsPerPage);
  const paginatedHistory = completedHistory.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

  const renderPaginationControls = () => {
    if (activeTab !== 'history' || completedHistory.length <= itemsPerPage) return null;
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={[styles.pageBtn, historyPage === 1 && styles.pageBtnDisabled]}
          onPress={() => setHistoryPage(p => Math.max(1, p - 1))}
          disabled={historyPage === 1}
        >
          <Ionicons name="chevron-back" size={20} color={historyPage === 1 ? '#94a3b8' : COLORS.primary} />
          <Text style={[styles.pageBtnText, historyPage === 1 && { color: '#94a3b8' }]}>Prev</Text>
        </TouchableOpacity>
        
        <Text style={styles.pageIndicator}>Page {historyPage} of {totalHistoryPages}</Text>
        
        <TouchableOpacity 
          style={[styles.pageBtn, historyPage === totalHistoryPages && styles.pageBtnDisabled]}
          onPress={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
          disabled={historyPage === totalHistoryPages}
        >
          <Text style={[styles.pageBtnText, historyPage === totalHistoryPages && { color: '#94a3b8' }]}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color={historyPage === totalHistoryPages ? '#94a3b8' : COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderStats = () => {
    const stats = statsData?.getMyStats || {
      ordersPackedToday: 0,
      accuracyRate: 0,
      averagePackTime: 0
    };

    return (
      <View style={styles.statsContainer}>
        <LinearGradient colors={['#4f46e5', '#6366f1']} style={styles.statsCard}>
          <Text style={styles.statsLabel}>Packed Today</Text>
          <Text style={styles.statsValue}>{stats.ordersPackedToday}</Text>
          <View style={styles.statsIconBg}>
            <Ionicons name="cube" size={20} color="white" />
          </View>
        </LinearGradient>

        <LinearGradient colors={['#10b981', '#34d399']} style={styles.statsCard}>
          <Text style={styles.statsLabel}>Accuracy</Text>
          <Text style={styles.statsValue}>{stats.accuracyRate.toFixed(1)}%</Text>
          <View style={styles.statsIconBg}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
          </View>
        </LinearGradient>

        <LinearGradient colors={['#f59e0b', '#fbbf24']} style={styles.statsCard}>
          <Text style={styles.statsLabel}>Avg Time</Text>
          <Text style={styles.statsValue}>{stats.averagePackTime.toFixed(1)}m</Text>
          <View style={styles.statsIconBg}>
            <Ionicons name="time" size={20} color="white" />
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderOrderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="middle">#{item.orderNumber || item.orderId}</Text>
          {item.isExpress && (
            <View style={styles.expressBadge}>
              <Ionicons name="flash" size={10} color="#92400e" />
              <Text style={styles.expressBadgeText}>EXPRESS</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, item.status === 'packing' ? styles.statusPacking : styles.statusAssigned]}>
          <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      {item.specialInstructions ? (
        <View style={styles.instructionContainer}>
          <Ionicons name="warning" size={14} color="#f59e0b" />
          <Text style={styles.instructions} numberOfLines={1}>{item.specialInstructions}</Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Ionicons name="list" size={14} color={COLORS.textLight} />
          <Text style={styles.footerText}>{item.items?.length || 0} items</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      </View>

      {item.shippingInfo && (
        <View style={styles.shippingContainer}>
          <View style={styles.shippingRow}>
            <Ionicons name="person" size={12} color={COLORS.textLight} />
            <Text style={styles.shippingName}>{item.shippingInfo.recipientName}</Text>
          </View>
          <View style={styles.shippingRow}>
            <Ionicons name="location" size={12} color={COLORS.textLight} />
            <Text style={styles.shippingAddress} numberOfLines={2}>
              {item.shippingInfo.addressLine1}, {item.shippingInfo.city} - {item.shippingInfo.pincode}
            </Text>
          </View>
          {item.shippingInfo.recipientPhone && (
            <TouchableOpacity 
              style={styles.shippingRow}
              onPress={() => Linking.openURL(`tel:${item.shippingInfo.recipientPhone}`)}
            >
              <Ionicons name="call" size={12} color={COLORS.primary} />
              <Text style={styles.shippingPhone}>{item.shippingInfo.recipientPhone}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Good Day,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.navigate('NetworkLogs')} style={styles.profileBtn}>
              <Ionicons name="bug-outline" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory', { user })} style={styles.profileBtn}>
              <Ionicons name="cube-outline" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.profileBtn}>
              <Ionicons name="person-circle-outline" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        {renderStats()}
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]} 
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active Tasks</Text>
          {activeData?.getMyAssignedOrders?.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeData.getMyAssignedOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
          onPress={() => { setActiveTab('history'); setHistoryPage(1); }}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'exceptions' && styles.activeTab]} 
          onPress={() => setActiveTab('exceptions')}
        >
          <Text style={[styles.tabText, activeTab === 'exceptions' && styles.activeTabText]}>Exceptions</Text>
          {historyData?.getMyOrderHistory?.filter(o => o.status === 'partially_fulfilled').length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.countText}>
                {historyData.getMyOrderHistory.filter(o => o.status === 'partially_fulfilled').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Bulk Actions */}
      {activeTab === 'active' && activeData?.getMyAssignedOrders?.length > 0 && (
        <View style={styles.downloadActions}>
          <TouchableOpacity 
            style={styles.downloadBtn} 
            onPress={handleBulkDownloadInvoice}
            disabled={isDownloadingBulkInvoice}
          >
            {isDownloadingBulkInvoice ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="document-text" size={16} color={COLORS.primary} />}
            <Text style={styles.downloadBtnText}>All Invoices</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.downloadBtn} 
            onPress={handleBulkDownloadCustomLabel}
            disabled={isDownloadingBulkCustom}
          >
            {isDownloadingBulkCustom ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="barcode" size={16} color={COLORS.primary} />}
            <Text style={styles.downloadBtnText}>All Labels</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <FlatList
        data={
          activeTab === 'active' ? activeData?.getMyAssignedOrders : 
          activeTab === 'history' ? paginatedHistory :
          activeTab === 'exceptions' ? historyData?.getMyOrderHistory?.filter(o => o.status === 'partially_fulfilled') : []
        }
        keyExtractor={item => item.id}
        renderItem={activeTab === 'active' ? renderOrderCard : ({ item }) => <HistoryCard order={item} navigation={navigation} />}
        ListHeaderComponent={renderPaginationControls}
        ListFooterComponent={renderPaginationControls}
        refreshControl={
          <RefreshControl 
            refreshing={activeLoading || historyLoading || statsLoading} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !activeLoading && !historyLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#e2e8f0" />
              <Text style={styles.emptyText}>
                {activeTab === 'active' ? 'No orders assigned right now.' : 
                 activeTab === 'exceptions' ? 'No exceptions found.' : 'No history found.'}
              </Text>
              {activeTab === 'active' && (
                <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                  <Text style={styles.refreshBtnText}>Check for Tasks</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    paddingBottom: 25, 
    paddingHorizontal: 20, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20
  },
  welcomeText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  userName: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  profileBtn: { opacity: 0.9 },
  
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 10
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    height: 100,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden'
  },
  statsLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  statsValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  statsIconBg: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 20
  },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    gap: 15
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  countBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  downloadActions: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 12 },
  downloadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', paddingVertical: 10, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  downloadBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: 'bold' },

  listContent: { padding: 20, paddingBottom: 40 },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 15, fontWeight: 'bold', color: COLORS.textDark, flexShrink: 1 },
  expressBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fef3c7', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4,
    marginTop: 4,
    gap: 2
  },
  expressBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#92400e' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusAssigned: { backgroundColor: '#e0f2fe' },
  statusPacking: { backgroundColor: '#fef3c7' },
  statusBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.textDark },
  
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6
  },
  instructions: { fontSize: 12, color: '#92400e', flex: 1 },
  
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 13, color: COLORS.textLight, fontWeight: '500' },
  
  shippingContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 4,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  shippingName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  shippingAddress: {
    fontSize: 11,
    color: COLORS.textLight,
    flex: 1,
  },
  shippingPhone: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    gap: 4
  },
  pageBtnDisabled: {
    backgroundColor: '#f1f5f9'
  },
  pageBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark
  },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 15, fontSize: 16, fontWeight: '500' },
  refreshBtn: { 
    marginTop: 20, 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 12 
  },
  refreshBtnText: { color: 'white', fontWeight: 'bold' },
});

export default DashboardScreen;