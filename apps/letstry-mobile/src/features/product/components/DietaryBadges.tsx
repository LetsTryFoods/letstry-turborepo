import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue, wp } from '../../../lib/utils/ui-utils';

interface Props {
  isVegetarian: boolean;
  isGlutenFree: boolean;
}

const DietaryBadges: React.FC<Props> = ({ isVegetarian, isGlutenFree }) => {
  return (
    <View style={styles.container}>
      {isVegetarian && (
        <View style={styles.badge}>
          <View style={styles.vegIcon}>
            <View style={styles.vegDot} />
          </View>
          <Text style={styles.text}>Vegetarian</Text>
        </View>
      )}
      {isGlutenFree && (
        <View style={styles.badge}>
          <Ionicons name="leaf-outline" size={RFValue(12)} color="#4CAF50" />
          <Text style={styles.text}>Gluten Free</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  vegIcon: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4CAF50',
  },
  text: {
    fontSize: RFValue(10),
    color: '#666',
    fontWeight: '600',
  },
});

export default DietaryBadges;
