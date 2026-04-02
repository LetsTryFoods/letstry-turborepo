import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLazyQuery } from '@apollo/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SEARCH_PLACES, GET_PLACE_DETAILS } from '../../src/lib/graphql/address';
import { wp, RFValue } from '../../src/lib/utils/ui-utils';

export default function PlaceSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const [searchPlaces, { data, loading }] = useLazyQuery(SEARCH_PLACES);
  const [getPlaceDetails] = useLazyQuery(GET_PLACE_DETAILS);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      searchPlaces({ variables: { input: { query: text } } });
    }
  };

  const handleSelectPlace = async (placeId: string) => {
    const { data: detailsData } = await getPlaceDetails({
      variables: { input: { placeId } }
    });

    if (detailsData?.getPlaceDetails) {
      const { latitude, longitude, formattedAddress } = detailsData.getPlaceDetails;
      // Navigate back to location with selected coordinates
      router.replace({
        pathname: '/checkout/location',
        params: {
          latitude,
          longitude,
          address: formattedAddress,
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for area, building name..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#0C5273" />
        </View>
      ) : (
        <FlatList
          data={data?.searchPlaces || []}
          keyExtractor={(item) => item.placeId}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.placeItem}
              onPress={() => handleSelectPlace(item.placeId)}
            >
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.placeText}>
                <Text style={styles.placeMain}>{item.mainText}</Text>
                <Text style={styles.placeSecondary}>{item.secondaryText}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length > 2 ? (
              <Text style={styles.emptyText}>No places found</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(15),
    fontFamily: 'Inter_400Regular',
    color: '#222',
  },
  loading: {
    marginTop: 20,
    alignItems: 'center',
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  placeText: {
    marginLeft: 12,
    flex: 1,
  },
  placeMain: {
    fontSize: RFValue(14),
    fontFamily: 'Inter_600SemiBold',
    color: '#222',
  },
  placeSecondary: {
    fontSize: RFValue(12),
    fontFamily: 'Inter_400Regular',
    color: '#888',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: RFValue(13),
  },
});
