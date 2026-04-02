import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, RFValue } from '../../../lib/utils/ui-utils';

interface SearchHeaderProps {
  query: string;
  setQuery: (text: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  query, 
  setQuery, 
  onSubmit,
  autoFocus = true 
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={RFValue(24)} color="#333" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={RFValue(18)} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for snacks, sweets..."
          placeholderTextColor="#999"
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          allowFontScaling={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={RFValue(18)} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity style={styles.micButton}>
        <Ionicons name="mic-outline" size={RFValue(22)} color="#0C5273" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: wp('2%'),
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: wp('3%'),
    height: hp('5%'),
  },
  searchIcon: {
    marginRight: wp('2%'),
  },
  input: {
    flex: 1,
    fontSize: RFValue(13),
    color: '#333',
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  micButton: {
    marginLeft: wp('3%'),
    padding: 4,
  },
});

export default SearchHeader;
