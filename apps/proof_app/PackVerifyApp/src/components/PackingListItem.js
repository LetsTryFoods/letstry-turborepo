import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { getCdnUrl } from '../config/api';
import ImageZoomModal from './ImageZoomModal';

const PackingListItem = ({ item }) => {
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const isCompleted = item.scannedCount >= item.qty;
  const isPartial = item.scannedCount > 0 && !isCompleted;
  const imageUrl = getCdnUrl(item.imageUri || item.imageUrl) || 'https://placehold.co/60x60/e2e8f0/64748b?text=IMG';

  return (
    <>
      <View style={[styles.card, isCompleted && styles.cardPacked, isPartial && styles.cardPartial]}>
        
        {/* Product Image */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => setZoomModalVisible(true)}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image} 
          />
          {isCompleted && (
            <View style={styles.successOverlay}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
            </View>
          )}
          <View style={styles.zoomIcon}>
            <Ionicons name="search" size={16} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      
      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.row}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>SKU: {item.sku}</Text>
          </View>
          <Text style={styles.ean}>EAN: {item.ean}</Text>
        </View>

        {/* PROGRESS BAR INSIDE CARD */}
        <View style={styles.miniProgressBg}>
            <View style={[styles.miniProgressFill, { 
                width: `${(item.scannedCount / item.qty) * 100}%`,
                backgroundColor: isCompleted ? COLORS.secondary : COLORS.primary 
            }]} />
        </View>
        <Text style={styles.progressText}>
            Scanned: <Text style={{fontWeight:'bold', color: COLORS.textDark}}>{item.scannedCount}</Text> / {item.qty}
        </Text>
      </View>

      {/* Status Icon (Right Side) */}
      <View style={styles.statusCol}>
        {isCompleted ? (
           <Ionicons name="checkmark-done-circle" size={32} color={COLORS.secondary} />
        ) : (
           <View style={styles.qtyBadge}>
               <Text style={styles.qtyText}>{item.qty - item.scannedCount}</Text>
               <Text style={styles.qtyLabel}>LEFT</Text>
           </View>
        )}
      </View>
    </View>

    <ImageZoomModal
      visible={zoomModalVisible}
      imageUrl={imageUrl}
      title={item.name}
      onClose={() => setZoomModalVisible(false)}
    />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardPacked: {
    backgroundColor: '#f0fdf4', // Light Green
    borderColor: COLORS.secondary,
  },
  cardPartial: {
    backgroundColor: '#eff6ff', // Light Blue (Work in progress)
    borderColor: COLORS.primary,
  },
  imageContainer: { position: 'relative' },
  image: {
    width: 60, height: 60, borderRadius: 12, backgroundColor: '#f1f5f9',
  },
  zoomIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.6)',
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center'
  },
  details: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tag: { backgroundColor: '#e0e7ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 6 },
  tagText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary },
  ean: { fontSize: 10, color: COLORS.textLight, fontFamily: 'monospace' },
  
  miniProgressBg: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  miniProgressFill: { height: '100%' },
  progressText: { fontSize: 12, color: COLORS.textLight },

  statusCol: { marginLeft: 10, alignItems: 'center' },
  qtyBadge: { backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  qtyText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  qtyLabel: { color: '#fff', fontSize: 6, fontWeight: 'bold' }
});

export default PackingListItem;