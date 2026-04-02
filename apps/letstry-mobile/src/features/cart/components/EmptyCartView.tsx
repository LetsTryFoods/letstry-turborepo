import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RFValue, wp, hp } from '../../../lib/utils/ui-utils';

interface EmptyCartViewProps {
  onClose: () => void;
}

const EmptyCartView: React.FC<EmptyCartViewProps> = ({ onClose }) => {
  const router = useRouter();

  const handleShopNow = () => {
    onClose();
    // In our tab layout, index is home.
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cart-outline" size={80} color="#CCC" />
      </View>
      <Text style={styles.title}>Your cart is empty</Text>
      <Text style={styles.subtitle}>Looks like you haven't added any snacks yet. Explore our delicious range of treats!</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleShopNow} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: hp('50%'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('8%'),
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: RFValue(18),
    fontFamily: 'Inter_700Bold',
    color: '#222',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: RFValue(13),
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0C5273',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#0C5273',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: RFValue(15),
    fontFamily: 'Inter_600SemiBold',
  },
});

export default EmptyCartView;
