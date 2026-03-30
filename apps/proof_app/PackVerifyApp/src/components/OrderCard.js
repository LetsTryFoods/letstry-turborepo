

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const OrderCard = ({ order, onPress }) => {
  // Check completion status
  const isCompleted = order.status === 'Completed';

  return (
    <TouchableOpacity 
        style={[styles.card, isCompleted && styles.cardCompleted]} 
        onPress={onPress} 
        activeOpacity={0.7}
    >
      {/* Dynamic Left Accent: Blue for Pending, Green for Done */}
      <View style={[styles.leftAccent, { backgroundColor: isCompleted ? COLORS.secondary : COLORS.primary }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.orderId}>{order.id}</Text>
          
          {/* Priority / Done Badge */}
          {isCompleted ? (
             <View style={styles.completedBadge}>
                <Ionicons name="checkmark-done-circle" size={14} color={COLORS.secondary} style={{marginRight: 4}} />
                <Text style={styles.completedText}>DONE</Text>
             </View>
          ) : order.isUrgent ? (
            <View style={styles.urgentBadge}>
              <Ionicons name="flame" size={12} color={COLORS.danger} style={{marginRight: 4}} />
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ITEMS</Text>
            <Text style={styles.detailValue}>{order.itemsCount}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>STATUS</Text>
            <Text style={[
                styles.detailValue, 
                { color: isCompleted ? COLORS.secondary : (order.isUrgent ? COLORS.danger : COLORS.textLight) }
            ]}>
              {order.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.actionIcon}>
             {isCompleted ? (
                 <Ionicons name="checkmark-circle" size={24} color={COLORS.secondary} />
             ) : (
                 <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
             )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardCompleted: {
    backgroundColor: '#f0fdf4', // Lightest Green Tint background
  },
  leftAccent: {
    width: 6,
    // Background color is handled inline
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  urgentBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  urgentText: { color: COLORS.danger, fontSize: 10, fontWeight: '800' },
  
  completedBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  completedText: { color: COLORS.secondary, fontSize: 10, fontWeight: '800' },

  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },
  detailsRow: { flexDirection: 'row', alignItems: 'center' },
  detailItem: { marginRight: 24 },
  detailLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.textLight, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  actionIcon: { marginLeft: 'auto' },
});

export default OrderCard;