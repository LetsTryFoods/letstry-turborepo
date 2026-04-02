import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wp, RFValue } from '../../../lib/utils/ui-utils';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (term: string) => void;
  onClear: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ searches, onSelect, onClear }) => {
  if (searches.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        {searches.map((term, index) => (
          <TouchableOpacity 
            key={`${term}-${index}`}
            style={styles.item}
            onPress={() => onSelect(term)}
          >
            <Ionicons name="time-outline" size={RFValue(16)} color="#666" style={styles.icon} />
            <Text style={styles.itemText} numberOfLines={1}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp('4%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    color: '#333',
  },
  clearText: {
    fontSize: RFValue(11),
    color: '#0C5273',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 6,
  },
  itemText: {
    fontSize: RFValue(11),
    color: '#666',
  },
});

export default RecentSearches;
