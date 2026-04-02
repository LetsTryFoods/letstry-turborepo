import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, RFValue } from '../../lib/utils/ui-utils';

interface SearchBarProps {
  placeholder?: string;
  searchText?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search for snacks, sweets...",
  searchText = ""
}) => {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to search screen
    router.push({
      pathname: '/search' as any,
      params: { initialQuery: searchText || "" }
    });
  };

  return (
    <TouchableOpacity
      style={styles.searchBar}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={22} color="#888" style={styles.searchIcon} />
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[styles.searchText, !searchText && styles.placeholder]}
      >
        {searchText || placeholder}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 5,
    // Add subtle shadow for visual consistency
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchText: {
    fontSize: RFValue(13),
    color: "#333",
    flex: 1,
  },
  placeholder: {
    color: "#999",
  },
});

export default SearchBar;
