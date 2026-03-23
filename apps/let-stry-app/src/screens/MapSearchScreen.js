
import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GOOGLE_API_KEY = 'AIzaSyA44Ri5mmnDX-wE8folHq69LjEy1u8NLF0'; 

export default function MapSearchScreen({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlaces = async (input) => {
    if (!input) {
      setPredictions([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&components=country:IN&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      if (json.status === 'OK') {
        setPredictions(json.predictions);
        setError('');
      } else if (json.status === 'ZERO_RESULTS') {
        setPredictions([]);
        setError('No results found.');
      } else {
        setPredictions([]);
        setError('Something went wrong. Try again.');
      }
    } catch (error) {
      setPredictions([]);
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      if (json.status === 'OK') {
        return json.result;
      }
    } catch (error) {}
    return null;
  };

  const onSelectPlace = async (place) => {
    Keyboard.dismiss();
    const details = await fetchPlaceDetails(place.place_id);

    if (details && details.geometry && details.geometry.location) {
      // Retrieve the callback from route.params
      const { onLocationSelected } = route.params || {};

      if (typeof onLocationSelected === 'function') {
        onLocationSelected({
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          address: place.description,
        });
      }

      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        {/* --- ADD THIS BUTTON --- */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0C5273" />
        </TouchableOpacity>
        {/* --- END OF ADDITION --- */}

        <Ionicons name="search" size={22} color="#0C5273" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search for a location"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            fetchPlaces(text);
          }}
          placeholderTextColor="#aaa"
          autoFocus
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#0C5273" style={styles.loadingIndicator} />}
      </View>

      {error ? (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText} allowFontScaling={false} adjustsFontSizeToFit>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={predictions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionCard}
            activeOpacity={0.7}
            onPress={() => onSelectPlace(item)}
          >
            <Ionicons name="location-outline" size={20} color="#0C5273" style={{ marginRight: 10 }} />
            <Text style={styles.suggestionText} allowFontScaling={false} adjustsFontSizeToFit>{item.description}</Text>
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading && query.length > 0 && !error ? (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText} allowFontScaling={false} adjustsFontSizeToFit>No suggestions found.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingTop: 12 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 16 },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    margin: 15,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  // --- ADD THIS STYLE ---
  backButton: {
    paddingRight: 10, // Adds some space between the back arrow and search icon
  },
  // --- END OF ADDITION ---
  searchIcon: {
    marginRight: 10,
    color: "#0C5273", // blue icon
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 17,
    color: '#222',
    backgroundColor: 'transparent',
    fontWeight: "500",
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  suggestionText: {
    fontSize: 16,
    color: '#222',
    flex: 1,
    flexWrap: 'wrap',
    fontWeight: "500",
  },
  feedbackBox: {
    marginTop: 24,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#888',
    fontSize: 16,
    fontWeight: "500",
  },
});
