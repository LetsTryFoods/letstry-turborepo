import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { getCdnUrl } from '../config/api';

const HistoryCard = ({ order, navigation }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const images = order.evidence?.prePackImages || [];

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => navigation?.navigate('PackedOrderDetail', { order })}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="middle">#{order.orderNumber || order.orderId}</Text>
          <Text style={styles.dateText}>{formatDate(order.packingCompletedAt)}</Text>
        </View>
        <View style={[styles.statusBadge, order.status === 'partially_fulfilled' && { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.statusText, order.status === 'partially_fulfilled' && { color: '#b45309' }]}>
            {order.status === 'partially_fulfilled' ? 'EXCEPTION' : 'COMPLETED'}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.itemCount}>
          {order.items?.length || 0} product types • {order.items?.reduce((s, i) => s + i.quantity, 0) || 0} items
        </Text>
        {order.status === 'partially_fulfilled' && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#f59e0b', marginBottom: 4 }}>
              Items Marked Missing:
            </Text>
            {order.items?.filter(i => (i.shortCount || 0) > 0 || (i.shortComponentCount || 0) > 0).map((item, idx) => (
              <Text key={idx} style={{ fontSize: 11, color: '#b45309', marginBottom: 2 }}>
                • {item.name} 
                {(item.shortCount || 0) > 0 ? ` (${item.shortCount} full missing)` : ''}
                {(item.shortComponentCount || 0) > 0 ? ` (${item.shortComponentCount} component missing)` : ''}
              </Text>
            ))}
          </View>
        )}
      </View>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {images.map((img, index) => (
            <Image key={index} source={{ uri: getCdnUrl(img) }} style={styles.evidenceImage} />
          ))}
        </ScrollView>
      )}

      {order.isExpress && (
        <View style={styles.expressTag}>
          <Ionicons name="flash" size={12} color="#f59e0b" />
          <Text style={styles.expressText}>EXPRESS</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    flexShrink: 1,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  },
  details: {
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  imageScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  evidenceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
  },
  expressTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: SIZES.borderRadius,
    borderBottomLeftRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expressText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
  },
});

export default HistoryCard;
