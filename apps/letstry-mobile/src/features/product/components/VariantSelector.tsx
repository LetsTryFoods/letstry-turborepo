import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ProductVariant } from '../types';
import { wp, RFValue } from '../../../lib/utils/ui-utils';

interface Props {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
}

const VariantSelector: React.FC<Props> = ({ variants, selectedVariant, onSelect }) => {
  if (variants.length <= 1) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Sizes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {variants.map((v) => {
          const isSelected = v._id === selectedVariant._id;
          return (
            <TouchableOpacity
              key={v._id}
              style={[styles.item, isSelected && styles.selectedItem]}
              onPress={() => onSelect(v)}
              activeOpacity={0.7}
            >
              <Text style={[styles.text, isSelected && styles.selectedText]}>
                {v.weight}{v.weightUnit}
              </Text>
              <Text style={[styles.price, isSelected && styles.selectedPrice]}>
                ₹{v.price}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  list: {
    paddingRight: wp('5%'),
  },
  item: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: wp('22%'),
    backgroundColor: '#FFFFFF',
  },
  selectedItem: {
    borderColor: '#0C5273',
    backgroundColor: '#F0F7FA',
    borderWidth: 2,
  },
  text: {
    fontSize: RFValue(11),
    color: '#666',
    fontWeight: '600',
  },
  selectedText: {
    color: '#0C5273',
  },
  price: {
    fontSize: RFValue(10),
    color: '#999',
    marginTop: 2,
  },
  selectedPrice: {
    color: '#0C5273',
    fontWeight: 'bold',
  },
});

export default VariantSelector;
