import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { RFValue, wp, getImageUrl } from '../../../lib/utils/ui-utils';

interface Suggestion {
  id: string;
  image: string;
  title: string;
  price: number;
}

interface CartSuggestionsProps {
  suggestions: Suggestion[];
  onAdd: (id: string) => void;
}

export const CartSuggestions: React.FC<CartSuggestionsProps> = ({ suggestions, onAdd }) => {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>You might also like</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.image}
                contentFit="contain"
              />
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={styles.price}>
              ₹{item.price}
            </Text>

            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => onAdd(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: wp('4%'),
  },
  heading: {
    fontSize: RFValue(14),
    fontFamily: 'Inter_600SemiBold',
    color: '#222',
    marginBottom: wp('3%'),
  },
  scrollContent: {
    paddingRight: wp('4%'),
  },
  card: {
    width: wp('32%'),
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: wp('2.5%'),
    marginRight: wp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: wp('22%'),
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: RFValue(11),
    fontFamily: 'Inter_500Medium',
    color: '#333',
    textAlign: 'center',
    height: 32, // Fixed height for 2 lines
    marginBottom: 6,
  },
  price: {
    fontSize: RFValue(13),
    fontFamily: 'Inter_700Bold',
    color: '#222',
    marginBottom: 10,
  },
  addButton: {
    width: '100%',
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#0fa958',
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: RFValue(11),
    fontFamily: 'Inter_700Bold',
    color: '#0fa958',
  },
});

export default CartSuggestions;
