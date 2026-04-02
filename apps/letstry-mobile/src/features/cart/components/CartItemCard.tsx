import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RFValue, wp, getImageUrl } from '../../../lib/utils/ui-utils';

interface CartItemProps {
  id: string;
  title: string;
  size: string;
  price: number;
  mrp?: number;
  quantity: number;
  imageUrl: string;
  isUpdating?: boolean;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onPress?: () => void;
}

const CartItemCard: React.FC<CartItemProps> = ({
  id,
  title,
  size,
  price,
  mrp,
  quantity,
  imageUrl,
  isUpdating,
  onUpdateQuantity,
  onRemoveItem,
  onPress,
}) => {
  return (
    <View style={[styles.container, isUpdating && styles.updating]}>
      <TouchableOpacity 
        style={styles.pressableArea} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Product Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: getImageUrl(imageUrl) }}
            style={styles.image}
            contentFit="contain"
          />
        </View>
  
        {/* Product Details Area (Text only) */}
        <View style={styles.textDetails}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.variant}>{size}</Text>
        </View>
      </TouchableOpacity>

      {/* Price and Actions Area */}
      <View style={styles.priceAndActions}>
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{price}</Text>
            {mrp && mrp > price && (
              <Text style={styles.mrp}>₹{mrp}</Text>
            )}
          </View>
  
          {/* Quantity Stepper */}
          <View style={styles.stepperContainer}>
            <TouchableOpacity 
              style={styles.stepperBtn}
              onPress={() => onUpdateQuantity(id, quantity - 1)}
              disabled={isUpdating}
            >
              <Ionicons name="remove" size={14} color="#0C5273" />
            </TouchableOpacity>
            
            <View style={styles.qtyLabel}>
              <Text style={styles.qtyText}>{quantity}</Text>
            </View>
  
            <TouchableOpacity 
              style={styles.stepperBtn}
              onPress={() => onUpdateQuantity(id, quantity + 1)}
              disabled={isUpdating}
            >
              <Ionicons name="add" size={14} color="#0C5273" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  updating: {
    opacity: 0.6,
  },
  imageWrapper: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pressableArea: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  priceAndActions: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  textDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: RFValue(12.5),
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    lineHeight: 18,
  },
  variant: {
    fontSize: RFValue(11),
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12, // Added space between price and stepper
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  price: {
    fontSize: RFValue(14),
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  mrp: {
    fontSize: RFValue(10),
    fontFamily: 'Inter_400Regular',
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: -2, // Pull it closer to the price
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 2,
  },
  stepperBtn: {
    padding: 4,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyLabel: {
    paddingHorizontal: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  qtyText: {
    fontSize: RFValue(13),
    fontFamily: 'Inter_700Bold',
    color: '#0C5273',
  },
});

export default CartItemCard;
