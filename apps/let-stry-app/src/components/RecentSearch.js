import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getRecentSearches, saveRecentSearch } from '../utils/SearchUtil';

const RecentSearches = ({ onSelect, onClear }) => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getRecentSearches();
      setRecent(data);
    })();
  }, []);

  if (!recent.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text 
          style={styles.label} 
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          Recent searches
        </Text>
        <TouchableOpacity onPress={onClear}>
          <Text 
            style={styles.clearText} 
            allowFontScaling={false}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            clear
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.chipsContainer}>
        {recent.map(term => (
          <TouchableOpacity
            key={term}
            style={styles.chip}
            onPress={() => onSelect(term)}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={18} color="#555" style={styles.chipIcon} />
            <Text 
              style={styles.chipText} 
              allowFontScaling={false}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {term}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10, paddingHorizontal: 10 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#222',
    letterSpacing: 0.1,
  },
  clearText: {
    color: '#0C5273',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipIcon: {
    marginRight: 7,
  },
  chipText: {
    color: '#353A42',
    fontSize: 17,
    fontWeight: '500',
  },
});

export default RecentSearches;